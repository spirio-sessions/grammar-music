using System;
using System.Linq;
using System.Threading;
using System.Collections.Generic;

using OpenTK.Audio.OpenAL;

using static System.Console;

namespace Parsing
{
    class Program
    {
        static void Main()
        {
            var audio = Audio.Record(4);
            Plot.Signal(audio.Samples, audio.SampleRate, "capture-test");
        }

        static void LiveTokenize(Action<IEnumerable<Token>> handle) // use action in body
        {
            var estimator = new F0Estimator();
            var tokenizer = new Tokenizer();

            var recording = new Recording(samples =>
            {
                var (f0s, sampleRate) = estimator.Run(samples, 44_100);
                var tokens = tokenizer.Run(f0s, sampleRate);
                handle(tokens);
            });

            recording.Start();
            WriteLine("recording started");
            Read();
            recording.Stop();
            WriteLine("\nrecording ended");
        }
    }
}
