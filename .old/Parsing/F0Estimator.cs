using System.Linq;
using System.Collections.Generic;

namespace Parsing
{
    public class F0Estimator
    {

        private readonly Config config;

        public F0Estimator(Config config = null)
        {
            this.config = config ?? new Config();
        }

        public (IEnumerable<double> f0s, double samplerate) Run(double[] samples, double sampleRate)
        {
            var (freqs, stftFrames) = STFT.RunIndex(samples, sampleRate, config.StftHop, config.StftHalfWindow);
            var fStep = freqs[1];

            freqs = LimitFrequencies(freqs);
            stftFrames = stftFrames.Select(LimitFrequencies);

            var f0s = stftFrames
                .Select(frame => (frame, peaks: frame.ArgPeaks(config.PeaksCount)))
                .Select(t => t.peaks
                    .Select(i => i != -1 ? (f: freqs[i], p: t.frame[i]) : (f: 0, p: double.NegativeInfinity)))
                .Select(ts => ts
                    .Select(t => t.p < config.PMin ? (0, t.p) : t))
                .Select(ts => ts
                    .Where(t => t.f != 0)
                    .OrderBy(t => t.f)
                    .Select(t => t.f)
                    .FirstOrDefault());

            return (f0s, sampleRate / config.StftHop);

            double[] LimitFrequencies(double[] frame)
            {
                int lfb = (int)(config.FMin / fStep);
                int ufb = (int)(config.FMax / fStep) + 1;
                return frame[lfb..ufb];
            }
        }

        public class Config
        {
            public double FMin { get; set; }
            public double FMax { get; set; }
            public int StftHop { get; set; }
            public int StftHalfWindow { get; set; }
            public double PMin { get; set; }
            public int PeaksCount { get; set; }

            public Config
            (
                double fMin = 0,
                double fMax = 8000,
                int stftHop = 1024,
                int stftHalfWindow = 4096,
                double pMin = -50,
                int peaksCount = 2
            )
            {
                FMin = fMin;
                FMax = fMax;
                StftHop = stftHop;
                StftHalfWindow = stftHalfWindow;
                PMin = pMin;
                PeaksCount = peaksCount;
            }
        }
    }
}
