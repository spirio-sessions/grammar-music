using FftSharp;

using System;
using System.IO;

namespace Parsing
{
    class Program
    {

        static void Main()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");

            var (format, _, samples) = Audio.File(inPath, duration);

            samples = Pad.ZeroPad(samples);
            var (freqs, frames) = STFT.Run(samples, format.SampleRate, 1000, 1000);

            var res = new Tokenizer(130, 1000, freqs).Tokenize(frames);

            foreach (var t in res)
                Console.WriteLine(t);
        }
    }
}
