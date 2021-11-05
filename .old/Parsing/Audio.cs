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
    public class Audio
    {
        public double SampleRate { get; }
        public double[] Samples { get; }

        private Audio(double sampleRate, double[] samples)
        {
            SampleRate = sampleRate;
            Samples = samples;
        }

        public static Audio Record(double duration, int sampleRate = 44_100)
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

            var samplesDouble = samples
                .Select(s => (double)s / short.MaxValue)
                .ToArray();

            return new Audio(sampleRate, samplesDouble);

            static void CheckAlcError()
            {
                var error = AL.GetError();
                if (error != ALError.NoError)
                    throw new Exception(AL.GetErrorString(error));
            }
        }

        public static Audio File(string path, double length = 0)
        {
            if (length < 0)
                throw new ArgumentException("audio length must not be negative");

            using var wfr = new WaveFileReader(path);
            var readAll = length == 0;
            var samples = new List<double>();

            long framesToRead = (long) (length * wfr.WaveFormat.SampleRate);
            long framesAvailable = wfr.Length / wfr.BlockAlign;
            framesToRead =
                framesToRead == 0
                ? framesAvailable // 0 -> read everything
                : Math.Min(framesAvailable, framesToRead); // ensure read length did not exceed stream length

            long framesRead = 0;
            float[] frame;

            while(framesRead < framesToRead)
            {
                frame = wfr.ReadNextSampleFrame();

                foreach (var sample in frame)
                    samples.Add(sample);

                framesRead++;
            }

            return new Audio(wfr.WaveFormat.SampleRate, samples.ToArray());
        }
    }

    public class Recording
    {
        private readonly Config config;

        private readonly Action<double[]> handle;

        private bool running = false;
        private ALCaptureDevice device;

        public Recording(Action<double[]> handle, Config config = null)
        {
            this.config = config ?? new Config();
            this.handle = handle;
        }

        public Task Start()
        {
            int frameSize = (int)(config.FrameLength * config.SampleRate);

            var task = new Task(() =>
            {
                device = ALC.CaptureOpenDevice(config.DeviceName, config.SampleRate, ALFormat.Mono16, 1024);
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
                    Error.WriteLine($"could not close {config.DeviceName}");

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

        public class Config
        {
            public int SampleRate { get; }
            public double FrameLength { get; }
            public string DeviceName { get; }

            public Config(int sampleRate = 44_100, double frameLength = 2.0, string deviceName = null)
            {
                SampleRate = sampleRate;
                FrameLength = frameLength;
                DeviceName = deviceName ?? ALC.GetString(ALDevice.Null, AlcGetString.CaptureDefaultDeviceSpecifier);
            }
        }
    }
}
