using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;

using static System.Console;

namespace Parsing
{
    class Program
    {

        static void Main()
        {
            TestMeterDetectionStft();
        }

        static void TestTokenization()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");
            int stftHop = 1024, stftHalfWindow = 1024;

            var (format, _, samples) = Audio.File(inPath, duration);
            var (freqs, frames) = STFT.Run(samples, format.SampleRate, stftHop, stftHalfWindow);
            var tokens = new Tokenizer(130, 1000, freqs)
                .Tokenize(frames, format.SampleRate / stftHop);

            foreach (var t in tokens)
                WriteLine(t);
        }

        static void TestRecording()
        {
            var rec = new Recording(null, 44_100, 4.0, frame => WriteLine($"{frame.Length} samples recorded @ {DateTime.Now}"));
            rec.Start();
            Console.ReadKey();
            rec.Stop();
        }

        static void TestMeterDetectionFft()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");
            var (format, _, samples) = Audio.File(inPath, duration);

            samples = FftSharp.Pad.ZeroPad(samples);
            var rfft = FftSharp.Transform.RFFT(samples);
            var freqs = FftSharp.Transform.FFTfreq(format.SampleRate, rfft.Length);

            double fd = freqs[1];
            int lfb = (int)(1 / fd); // 60bpm
            int ufb = (int)(5 / fd) + 1; // 300bpm

            var period = format.SampleRate / freqs[rfft[lfb..ufb].Select(c => c.Magnitude).ToArray().ArgMax()];
            var rfftMax = rfft[lfb..ufb].OrderByDescending(c => c.Magnitude).First();
            var shift = Math.Atan2(rfftMax.Imaginary, rfftMax.Real) * period / Math.PI;

            WriteLine(period);
            WriteLine(shift);

            var plot = new ScottPlot.Plot();
            plot.PlotSignal(samples, format.SampleRate);

            var tShift = shift / format.SampleRate;
            var tPeriod = period / format.SampleRate;
            var tMax = samples.Length / format.SampleRate;
            for (double t = 0; t < tMax; t += tPeriod) // without shift
                plot.PlotVLine(t, System.Drawing.Color.Red);
            for (double t = tShift; t < tMax; t += tPeriod) // with shift
                plot.PlotVLine(t, System.Drawing.Color.Blue);

            Plot.SavePlot(plot, "beat-raw-fft");
        }

        static void TestMeterDetectionStft()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");
            var (format, _, samples) = Audio.File(inPath, duration);
            int origLength = samples.Length;

            int stftHop = 1024, stftHalfWindow = 1024;
            // this also zero-pads halfway left and halfway right up to the next power of 2
            var (freqs, frames) = STFT.Run(samples, format.SampleRate, stftHop, stftHalfWindow);

            var tokens = new Tokenizer(130, 1000, freqs)
                .Tokenize(frames, format.SampleRate / stftHop);
            double relevantDuration = 0.1;
            var relevantTokens = new List<Token>() { tokens.First() };

            foreach (var t in tokens.Skip(1))
            {
                if (t.Duration < relevantDuration)
                {
                    var elem = relevantTokens.Last();
                    elem.DurationAdd(t.Duration);
                }
                else
                    relevantTokens.Add(t);
            }

            if (relevantTokens.First().Duration < relevantDuration && relevantTokens.Count() > 1)
            {
                relevantTokens[1].DurationAdd(relevantTokens.First().Duration);
                relevantTokens.RemoveAt(0);
            }

            var period = (from t in relevantTokens
                          select t.Duration into d
                          orderby d ascending
                          group d by d into g
                          orderby g.Count() descending
                          select g.Key).First();

            var shift =
                relevantTokens.First() is UnidentifiedSection
                    // if shifted, subtract half padding length from left
                    ? relevantTokens.First().Duration - (samples.Length - origLength) / 2 / format.SampleRate
                    : 0.0;

            var plot = new ScottPlot.Plot();
            plot.PlotSignal(samples, format.SampleRate);
            var tMax = samples.Length / format.SampleRate;
            for (double t = 0; t < tMax; t += period) // without shift
                plot.PlotVLine(t, System.Drawing.Color.Red);
            for (double t = shift; t < tMax; t += period) // with shift
                plot.PlotVLine(t, System.Drawing.Color.Blue);

            Plot.SavePlot(plot, "beat-raw-stft");
        }
    }
}
