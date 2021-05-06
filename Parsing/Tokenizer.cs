using System.Linq;
using System.Collections.Generic;

namespace Parsing
{
    public class Tokenizer
    {
        readonly double fMin;
        readonly double fMax;
        readonly double[] frequencies;
        readonly int framesPerToneMin;
        readonly double pMin;
        readonly int peaksCount;

        public Tokenizer(double fMin, double fMax, double[] frequencies, int framesPerToneMin = 3, double pMin = -50.0, int peaksCount = 3)
        {
            this.fMin = fMin;
            this.fMax = fMax;
            this.frequencies = frequencies;
            this.framesPerToneMin = framesPerToneMin;
            this.pMin = pMin;
            this.peaksCount = peaksCount;   
        }

        public IEnumerable<Token> Tokenize(IEnumerable<double[]> frames, double sampleRate)
        {
            var freq = LimitFrequencies(frequencies);

            return frames
                .Select(LimitFrequencies)
                .Select(frame => (frame, peaks: frame.ArgPeaks(peaksCount)))
                .Select(t => t.peaks
                    .Select(i => i != -1 ? (f: freq[i], p: t.frame[i]) : (f: 0, p: double.NegativeInfinity)))
                .Select(ts => ts
                    .Select(t => t.p < pMin ? (0, t.p) : t))
                .Select(ts => ts
                    .Where(t => t.f != 0)
                    .OrderBy(t => t.f)
                    .Select(t => t.f)
                    .FirstOrDefault())
                .Aggregate(new List<(double f, int c)>{(0.0, 1)}, MergeCount)
                .Select(t => (p: DetectPitch(t.f), t.c))
                .Select(t => t.c < framesPerToneMin ? (p: new Pitch(PitchClass.Unknown, int.MinValue), t.c) : t)
                .Select(t => (t.p, d: t.c / sampleRate))
                .Select<(Pitch p, double d), Token>(t =>
                    t.p.pitchClass == PitchClass.Unknown
                        ? new UnidentifiedSection(t.d)
                        : new Tone(t.p, t.d));
            // TODO: add rests by zip-joining with downsamples version of original samples and threshold filtering
        }

        private double[] LimitFrequencies(double[] frame)
        {
            double fd = frequencies[1];
            int lfb = (int)(fMin / fd);
            int ufb = (int)(fMax / fd) + 1;
            return frame[lfb .. ufb];
        }

        private static List<(double f, int c)> MergeCount(List<(double f, int c)> acc, double f)
        {
            var last = acc [^1];
            if (f == last.f)
            {
                acc.RemoveAt(acc.Count - 1);
                last.c++;
                acc.Add(last);
            }
            else
            {
                acc.Add((f, 1));
            }
            return acc;
        }

        private static Pitch DetectPitch(double freq)
        {
            if (freq <= 0)
                return new Pitch(PitchClass.Unknown, int.MinValue);

            int octaveOffset = 4;

            // map freq to [C4, B4]
            double freqB3C4 = 254.284;
            double freqB4C5 = 508.565;
            while (!Between(freq, freqB3C4, freqB4C5))
            {
                if (freq < freqB3C4)
                {
                    freq *= 2;
                    octaveOffset--;
                }
                else if (freq > freqB4C5)
                {
                    freq /= 2;
                    octaveOffset++;
                }
            }

            return freq switch
            {
                double f when Between(f, freqB3C4, 269.405) => new Pitch(PitchClass.C, octaveOffset),
                double f when Between(f, 269.405, 285.424) => new Pitch(PitchClass.Db, octaveOffset),
                double f when Between(f, 285.424, 302.396) => new Pitch(PitchClass.D, octaveOffset),
                double f when Between(f, 302.396, 320.378) => new Pitch(PitchClass.Eb, octaveOffset),
                double f when Between(f, 320.378, 339.428) => new Pitch(PitchClass.E, octaveOffset),
                double f when Between(f, 339.428, 359.611) => new Pitch(PitchClass.F, octaveOffset),
                double f when Between(f, 359.611, 380.995) => new Pitch(PitchClass.Gb, octaveOffset),
                double f when Between(f, 380.995, 403.650) => new Pitch(PitchClass.G, octaveOffset),
                double f when Between(f, 403.650, 427.653) => new Pitch(PitchClass.Ab, octaveOffset),
                double f when Between(f, 427.653, 453.080) => new Pitch(PitchClass.A, octaveOffset),
                double f when Between(f, 453.080, 480.020) => new Pitch(PitchClass.Bb, octaveOffset),
                double f when Between(f, 480.020, freqB4C5) => new Pitch(PitchClass.B, octaveOffset),
                _ => new Pitch(PitchClass.Unknown, int.MinValue)
            };

            static bool Between(double d, double l, double u) => l < d && d < u;
        }
    }
}
