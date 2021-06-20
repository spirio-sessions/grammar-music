using System.Linq;
using System.Collections.Generic;

namespace Parsing
{
    public class Tokenizer
    {
        readonly double toneMinLength;

        public Tokenizer(double toneMinLength = 0.05)
        {
            this.toneMinLength = toneMinLength;
        }

        public IEnumerable<Token> Run(IEnumerable<double> f0s, double sampleRate)
        {
            return f0s
                .Aggregate(new List<(double f, int c)> { (0.0, 1) }, MergeCount)
                .Select(t => (p: Pitch.FromFrequency(t.f), d: t.c / sampleRate))
                .Select(t =>
                    t.d < toneMinLength
                        ? new UnidentifiedSection(t.d) as Token
                        : new Tone(t.p, t.d) as Token);
            // TODO: add rests by zip-joining with downsamples version of original samples and threshold filtering
            // TODO: add rests by designating regions with low harmonicity as rests
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
    }
}
