using System;
using System.IO;
using System.Linq;

namespace Analysis
{
    class Program
    {

        static void Main()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");

            var (format, _, samples) = Audio.File(inPath, duration);
            // check with format if audio has multiple channels and reduce/filter to mono as all further processing relies on single channel audio
            var hopLength = 0.05;
            var (preprocessed, detection, transients) = Analysis.Temporal(samples, format.SampleRate, hopLength);
            var tones = Analysis.Tonal(transients, samples, format.SampleRate).Select(t => (t.start, t.end, t.pitchClass));
            var tokens = Analysis.Tokenize(tones, samples, format.SampleRate);

            Plot.Tokens(samples, format.SampleRate, tokens, "tokens");

            foreach (var token in tokens)
                Console.WriteLine(token);

            //Plot.Signal(samples, format.SampleRate, "raw");
            //Plot.Signal(preprocessed, 1 / hopLength, "preprocessed");
            //Plot.Signal(detection, 1 / hopLength, "detection");
            //Plot.Transients(samples, format.SampleRate, transients, "transients");
            //Plot.Tones(samples, format.SampleRate, tones, "tones");
        }
    }
}
