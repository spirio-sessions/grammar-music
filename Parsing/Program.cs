using System;
using System.Collections.Generic;

using static System.Console;

namespace Parsing
{
    class Program
    {
        static void Main()
        {
            var results = Sandbox.LoadResults("musicnet-all-peaks-2-halfwindow-4096");
            WriteLine(Evaluation.Result.Average(results));
        }

        static void LiveTokenize(Action<IEnumerable<Token>> action)
        {
            var estimator = new F0Estimator();
            var tokenizer = new Tokenizer();

            var recording = new Recording(samples =>
            {
                var (f0s, sampleRate) = estimator.Run(samples, 44_100);
                foreach (var token in tokenizer.Run(f0s, sampleRate))
                    WriteLine(token);
            });

            recording.Start();
            WriteLine("recording started");
            Read();
            recording.Stop();
            WriteLine("\nrecording ended");
        }
    }
}
