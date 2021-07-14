using System;
using System.IO;
using System.Linq;

namespace Parsing
{
    public static class Plot
    {
        public static void SavePlot(ScottPlot.Plot plot, string title, string dirPath = "")
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

        public static void Spectogram(double[] frequencies, double[] powers, string title)
        {
            var plot = new ScottPlot.Plot();
            plot.PlotBar(frequencies, powers);
            SavePlot(plot, title);
        }

        public static void EvaluationResults(Evaluation.Result[] results, string parameter, double[] arguments, string title)
        {
            var plot = new ScottPlot.Plot();

            plot.XLabel(parameter);
            plot.YLabel("share of all samples");

            plot.Axis(y1: 0, y2: 1);

            plot.PlotScatter(arguments, results.Select(r => r.AmbiguousRate).ToArray(), System.Drawing.Color.Gray, label: "ambiguous");
            plot.PlotScatter(arguments, results.Select(r => r.MinorRate).ToArray(), System.Drawing.Color.Blue, label:"min err");
            plot.PlotScatter(arguments, results.Select(r => r.MajorRate).ToArray(), System.Drawing.Color.Red, label:"maj err");
            plot.PlotScatter(arguments, results.Select(r => r.OverallRate).ToArray(), System.Drawing.Color.Black, label:"all err");

            plot.Legend();

            SavePlot(plot, title);
        }

        public static void Experiment(string id, Evaluation.Result[] results, string parameter, double[] arguments)
        {
            EvaluationResults(results, parameter, arguments, $"musicnet-{id}-{parameter}-{arguments.First()}-{arguments.Last()}");
        }
    }
}
