using OpenTK.Audio.OpenAL;
using NAudio.Wave;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

using static System.Console;

namespace Parsing
{
    public static class Audio
    {
        public static double[] Record(double duration, int sampleRate = 44_100)
        {
            var device = ALC.CaptureOpenDevice(null, sampleRate, ALFormat.Mono16, 1024);
            CheckAlcError();

            var deviceName = ALC.GetString(ALDevice.Null, AlcGetString.CaptureDefaultDeviceSpecifier);
            WriteLine($"recording {duration}s on {deviceName}");

            ALC.CaptureStart(device);
            CheckAlcError();

            int samplesCount = (int)(sampleRate * duration);
            var samples = new short[samplesCount];
            int samplesRead = 0;

            while (samplesRead < samples.Length)
            {
                int samplesAvailable = ALC.GetAvailableSamples(device);
                CheckAlcError();

                if (samplesAvailable > 512)
                {
                    int samplesToRead = Math.Min(samplesAvailable, samples.Length - samplesRead);

                    ALC.CaptureSamples(device, ref samples[samplesRead], samplesToRead);
                    CheckAlcError();

                    samplesRead += samplesToRead;
                }
                Thread.Yield();
            }

            ALC.CaptureStop(device);
            CheckAlcError();
            if (!ALC.CaptureCloseDevice(device))
                Error.WriteLine($"could not close {deviceName}");
            CheckAlcError();

            WriteLine("recording finished");

            return samples
                .Select(s => (double)s / short.MaxValue)
                .ToArray();

            static void CheckAlcError()
            {
                var error = AL.GetError();
                if (error != ALError.NoError)
                    throw new Exception(AL.GetErrorString(error));
            }
        }

        public static (WaveFormat format, int framesRead, double[] samples) File(string path, double length)
        {
            using var wfr = new WaveFileReader(path);

            int framesToRead = (int) (length * wfr.WaveFormat.SampleRate);
            var samples = new List<double>();

            var frame = wfr.ReadNextSampleFrame();
            int framesRead = 1;

            while(frame != null && framesRead <= framesToRead)
            {
                foreach (var sample in frame)
                    samples.Add(sample);

                frame = wfr.ReadNextSampleFrame();
                framesRead++;
            }

            // one greater than actually read
            framesRead--;
                
            return (wfr.WaveFormat, framesRead, samples.ToArray());
        }
    }

    public class Recording
    {
        private readonly string deviceName;
        private readonly int sampleRate;
        private readonly double frameLength;

        private readonly Action<double[]> handle;

        private bool running = false;
        private ALCaptureDevice device;

        public Recording(string deviceName, int sampleRate, double frameLength, Action<double[]> handle)
        {
            this.deviceName = deviceName;
            this.sampleRate = sampleRate;
            this.frameLength = frameLength;
            this.handle = handle;
        }

        public Task Start()
        {
            int frameSize = (int)(frameLength * sampleRate);

            var task = new Task(() =>
            {
                device = ALC.CaptureOpenDevice(deviceName, sampleRate, ALFormat.Mono16, 1024);
                CheckAlcError();

                ALC.CaptureStart(device);
                CheckAlcError();

                running = true;

                while (running)
                {
                    short[] samples = CaptureFrame(frameSize);

                    if (!running)
                        break; // break loop to avoid handling of stopped capture

                    new Task(() => Handle(samples)).Start();
                }

                ALC.CaptureStop(device);
                CheckAlcError();

                if (!ALC.CaptureCloseDevice(device))
                    Error.WriteLine($"could not close {deviceName}");

                CheckAlcError();
            });

            task.Start();

            return task;
        }

        public void Stop()
        {
            running = false;
        }

        private static void CheckAlcError()
        {
            var error = AL.GetError();
            if (error != ALError.NoError)
                throw new Exception(AL.GetErrorString(error));
        }

        private short[] CaptureFrame(int frameSize)
        {
            int samplesCount = frameSize;
            var samples = new short[samplesCount];
            int samplesRead = 0;

            while (running && samplesRead < samples.Length) // break capture loop if stop requested
            {
                int samplesAvailable = ALC.GetAvailableSamples(device);
                CheckAlcError();

                if (samplesAvailable > 512)
                {
                    int samplesToRead = Math.Min(samplesAvailable, samples.Length - samplesRead);

                    ALC.CaptureSamples(device, ref samples[samplesRead], samplesToRead);
                    CheckAlcError();

                    samplesRead += samplesToRead;
                }
                //Thread.Yield(); //??
            }

            return samples;
        }

        private void Handle(short[] samples)
        {
            double[] samplesNormalized = samples
                .Select(s => (double)s / short.MaxValue)
                .ToArray();
            handle(samplesNormalized);
        }
    }
}
