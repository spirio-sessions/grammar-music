using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

using static System.Console;

namespace Parsing
{
    public static class Sandbox
    {
        public static void TestTokenization()
        {
            var duration = 4.0;
            var inPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Sax_1.wav");

            var audio = Audio.File(inPath, duration);
            var estimator = new F0Estimator();
            var tokenizer = new Tokenizer();

            var (f0s, sampleRate) = estimator.Run(audio.Samples, audio.SampleRate);
            var tokens = tokenizer.Run(f0s, sampleRate);

            foreach (var t in tokens)
                WriteLine(t);
        }

        public static void TestRecording()
        {
            var rec = new Recording(frame => WriteLine($"{frame.Length} samples recorded @ {DateTime.Now}"));
            rec.Start();
            ReadKey();
            rec.Stop();
        }

        public static void IterateMusicNet(Action<string, string> experiment)
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

        public static IEnumerable<Evaluation.Result> ConductExperiment(string parameter, IEnumerable<double> arguments)
        {
            var results = new List<Evaluation.Result>();

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

                results.AddRange(Task.WhenAll(tasks).Result);
            });

            return results;
        }

        public static void StoreResults(string fileName, IEnumerable<Evaluation.Result> results)
        {
            var path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), $"{fileName}.json");
            var json = JsonSerializer.Serialize(results);
            File.WriteAllText(path, json);
        }

        public static IEnumerable<Evaluation.Result> LoadResults(string fileName)
        {
            var path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), $"{fileName}.json");
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<IEnumerable<Evaluation.Result>>(json);
        }
    }
}
