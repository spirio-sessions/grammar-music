using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

using static System.Console;

namespace Parsing
{
    class Program
    {

        static void Main()
        {
            //ConductExperiment("FMax", new double[] { 4000, 6000, 8000, 10_000, 12_000, 14_000, 16_000 });

            Plot.Signal(new double[] { 1, 2, 3, 4 }, 1, "test");
        }

        static void TestTokenization()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");

            var audio = Audio.File(inPath, duration);
            var estimator = new F0Estimator();
            var tokenizer = new Tokenizer();

            var (f0s, sampleRate)  = estimator.Run(audio.Samples, audio.SampleRate);
            var tokens = tokenizer.Run(f0s, sampleRate);

            foreach (var t in tokens)
                WriteLine(t);
        }

        static void TestRecording()
        {
            var rec = new Recording(null, 44_100, 4.0, frame => WriteLine($"{frame.Length} samples recorded @ {DateTime.Now}"));
            rec.Start();
            ReadKey();
            rec.Stop();
        }

        static void IterateMusicNet(Action<string, string> experiment)
        {
            var basePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "solo_samples");
            var samplePath = Path.Combine(basePath, "musicnet");
            var metaPath = Path.Combine(basePath, "musicnet_metadata_solo.csv");

            var sampleIds = File.ReadAllLines(metaPath)
                .Skip(1)
                .Select(line => line.Split(",").First())
                .Where(id => id != string.Empty);

            foreach (var id in sampleIds)
                experiment(samplePath, id);
        }

        static void ConductExperiment(string parameter, IEnumerable<double> arguments)
        {
            IterateMusicNet((samplePath, id) =>
            {
                var evaluation = new Evaluation(samplePath, id);

                var tasks = arguments.Select(arg =>
                {
                    // set the config's experiment parameter via reflection
                    var config = new F0Estimator.Config();
                    Type configType = typeof(F0Estimator.Config);
                    var propertyInfo = configType.GetProperty(parameter);
                    propertyInfo.SetValue(config, arg);

                    var estimator = new F0Estimator();
                    var task = new Task<Evaluation.Result>(() => evaluation.Run(estimator));

                    task.Start();
                    return task;
                });

                var results = Task.WhenAll(tasks).Result;
                Plot.EvaluationResults(results, parameter, arguments.ToArray(), $"musicnet-{id}-{parameter}-{arguments.First()}-{arguments.Last()}");
            });
        }
    }
}
