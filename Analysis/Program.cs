using System;
using System.IO;
using System.Linq;

namespace MusicAnalysis
{
    class Program
    {

        static void Main()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");

            var (format, _, samples) = Audio.File(inPath, duration);
            var hopLength = 0.05;
            var (preprocessed, detection, transients) = Analysis.Temporal(samples, format.SampleRate, hopLength);
            var tones = Analysis.Tonal(transients, samples, format.SampleRate);

            Plot.Signal(samples, format.SampleRate, "raw");
            Plot.Signal(preprocessed, 1 / hopLength, "preprocessed");
            Plot.Signal(detection, 1 / hopLength, "detection");
            Plot.Transients(samples, format.SampleRate, transients, "transients");
            Plot.Tones(samples, format.SampleRate, tones.Select(t => (t.start, t.end, t.pitchClass)), "tones");
        }
    }
}
