using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace MusicAnalysis
{
    public static class Plot
    {
        private static void SavePlot(ScottPlot.Plot plot, string title, string dirPath = "")
        {
            plot.Title(title);

            if (dirPath == "")
                dirPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);

            var path = Path.Combine(dirPath, $"{title}.png");
            plot.SaveFig(path);
        }

        public static void Signal(double[] samples, double sampleRate, string title)
        {
            var plot = new ScottPlot.Plot();
            plot.PlotSignal(samples, sampleRate);
            SavePlot(plot, title);
        }

        private static ScottPlot.Plot TransientPlot(double[] samples, double sampleRate, IEnumerable<(int, int)> transients)
        {
            var plot = new ScottPlot.Plot();
            plot.PlotSignal(samples, sampleRate);

            foreach (var (from, to) in transients)
            {
                plot.PlotVLine(from / sampleRate, System.Drawing.Color.Red);
                plot.PlotVLine(to / sampleRate, System.Drawing.Color.Green);
            }

            return plot;
        }

        public static void Transients(double[] samples, double sampleRate, IEnumerable<(int, int)> transients, string title)
        {
            var plot = TransientPlot(samples, sampleRate, transients);
            SavePlot(plot, title);
        }

        public static void Tones(
            double[] samples,
            double sampleRate,
            IEnumerable<(int start, int end, string pitchClass)> tones,
            string title)
        {
            var transients = tones.Select(tone => (tone.start, tone.end));
            var plot = TransientPlot(samples, sampleRate, transients);

            foreach (var tone in tones)
            {
                var start = tone.start / sampleRate;
                var end = tone.end / sampleRate;
                var duration = end - start;
                plot.PlotText(tone.pitchClass, start + duration / 2, 0);
            }

            SavePlot(plot, title);
        }

        public static void Spectogram(double[] frequencies, double[] powers, string title)
        {
            var plot = new ScottPlot.Plot();
            plot.PlotBar(frequencies, powers);
            SavePlot(plot, title);
        }
    }
}
