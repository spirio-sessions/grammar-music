using OpenTK.Audio.OpenAL;
using NAudio.Wave;

using System;
using System.Linq;
using System.Threading;
using System.Collections.Generic;

using static System.Console;

namespace Analysis
{
    public static class Audio
    {
        public static double[] Record(double duration, int sampleRate = 44_100)
        {
            var captureDevice = ALC.CaptureOpenDevice(null, sampleRate, ALFormat.Mono16, 1024);
            CheckAlcError();

            var deviceName = ALC.GetString(ALDevice.Null, AlcGetString.CaptureDefaultDeviceSpecifier);
            WriteLine($"recording {duration}s on {deviceName}");

            ALC.CaptureStart(captureDevice);
            CheckAlcError();

            int samplesCount = (int)(sampleRate * duration);
            var samples = new short[samplesCount];
            int samplesRead = 0;

            while (samplesRead < samples.Length)
            {
                int samplesAvailable = ALC.GetAvailableSamples(captureDevice);
                CheckAlcError();

                if (samplesAvailable > 512)
                {
                    int samplesToRead = Math.Min(samplesAvailable, samples.Length - samplesRead);

                    ALC.CaptureSamples(captureDevice, ref samples[samplesRead], samplesToRead);
                    CheckAlcError();

                    samplesRead += samplesToRead;
                }
                Thread.Yield();
            }

            ALC.CaptureStop(captureDevice);
            CheckAlcError();
            if (!ALC.CaptureCloseDevice(captureDevice))
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
}
