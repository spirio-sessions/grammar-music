using System;
using System.IO;
using System.Linq;

namespace Parsing
{
    class Program
    {

        static void Main()
        {
            TestTokenization();   
        }

        static void TestTokenization()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");
            int stftHop = 1000, stftHalfWindow = 1000;

            var (format, _, samples) = Audio.File(inPath, duration);
            var (freqs, frames) = STFT.Run(samples, format.SampleRate, stftHop, stftHalfWindow);
            var tokens = new Tokenizer(130, 1000, freqs)
                .Tokenize(frames)
                .Select(t => (t.p, d: (double)t.c / (format.SampleRate / stftHop)))
                .Select(t => (Token)(
                    t.p.pitchClass == PitchClass.Unknown
                        ? new UnidentifiedSection(t.d)
                        : new Tone(t.p, t.d)));

            foreach (var t in tokens)
                Console.WriteLine(t);
        }

        static void TestRecording()
        {
            var rec = new Recording(null, 44_100, 4.0, frame => Console.WriteLine($"{frame.Length} samples recorded @ {DateTime.Now}"));
            rec.Start();
            Console.ReadKey();
            rec.Stop();
        }
    }
}
