using FftSharp;

using System;
using System.Collections.Generic;

namespace Parsing
{
    public static class STFT
    {
        /// <summary>
        /// calculats stft of a time-discrete signal
        /// </summary>
        /// <param name="samples">the discrete samples</param>
        /// <param name="hopLength">the offset between fft chunks in frames</param>
        /// <param name="halfWindowSize">half length of the fft window used to produce an fft chunk in frames</param>
        public static (double[] freqs, IEnumerable<double[]> powerChunks) Run(double[] samples, int sampleRate, int hopSize, int halfWindowSize)
        {
            if (hopSize % 2 != 0)
                throw new ArgumentException("hop size must be power of two");
            if (2 * halfWindowSize + 1 > samples.Length)
                throw new ArgumentException("window size must be shorter than sample length");

            var powerChunks = new List<double[]>();

            for (var h = halfWindowSize; h + halfWindowSize < samples.Length; h += hopSize)
            {
                int wl = h - halfWindowSize;
                int wr = h + halfWindowSize;

                var chunk = Pad.ZeroPad(samples[wl..wr]);
                var window = Window.Hanning(chunk.Length);
                Window.ApplyInPlace(window, chunk);

                var stftChunk = Transform.FFTpower(chunk);
                powerChunks.Add(stftChunk);
            }

            var freqs = Transform.FFTfreq(sampleRate, powerChunks[0].Length);

            return (freqs, powerChunks);
        }

        public static (double[] freqs, IEnumerable<double[]> powerChunks) Run(
            double[] samples,
            int sampleRate,
            double hopLength = 0.05 /*seconds*/,
            double windowLength = 0.1 /*seconds*/)
        {
            int hopSize = (int)(hopLength * sampleRate);
            int halfWindowSize = (int)(0.5 * windowLength * sampleRate);
            return Run(samples, sampleRate, hopSize, halfWindowSize);
        }
    }
}
