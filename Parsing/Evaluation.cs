using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace Parsing
{
    public class Evaluation
    {
        private readonly string id;
        private readonly Audio audio;
        private readonly IEnumerable<Label> labels;

        public Evaluation(string basePath, string id)
        {
            this.id = id;
            var audioPath = Path.Combine(basePath, $"{id}.wav");
            audio = Audio.File(audioPath);
            var labelPath = Path.Combine(basePath, $"{id}.csv");
            labels = ReadLabels(labelPath);
        }

        private static IEnumerable<Label> ReadLabels(string path)
        {
            using var sr = new StreamReader(path);
            var lines = sr.ReadToEnd().Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            return lines
                .Skip(1)
                .Select(line => line.Split(','))
                .Select(fields => LabelFromFields(fields));

            static Label LabelFromFields(string[] fields)
            {
                long start = Convert.ToInt64(fields[0]);
                long end = Convert.ToInt64(fields[1]);
                var pitch = new Pitch(Convert.ToByte(fields[3]));

                return new Label(start, end, pitch);
            }
        }

        public class Label
        {
            public readonly double start; // seconds
            public readonly double end; // seconds
            public readonly Pitch pitch;

            public Label(long start, long end, Pitch pitch)
            {
                this.start = start / 44_100.0;
                this.end = end / 44_100.0;
                this.pitch = pitch;
            }
        }

        public class Result
        {
            public string Id { get; set; }
            public int N { get; set; }
            public int Ambiguous { get; set; }
            public int MinorErrors { get; set; }
            public int MajorErrors { get; set; }

            public double AmbiguousRate => (double)Ambiguous / N;
            public double MinorRate => (double)MinorErrors / N;
            public double MajorRate => (double)MajorErrors / N;
            public double OverallRate => (double)(MinorErrors + MajorErrors) / N;

            public Result(string id, int n, int ambiguousErrors, int minorErrors, int majorErrors)
            {
                Id = id;
                N = n;
                Ambiguous = ambiguousErrors;
                MinorErrors = minorErrors;
                MajorErrors = majorErrors;
            }

            public Result() { }

            public static Result Average(IEnumerable<Result> results)
            {
                int n = 0, amb = 0, min = 0, maj = 0;
                foreach (var result in results)
                {
                    n += result.N;
                    amb += result.Ambiguous;
                    min += result.MinorErrors;
                    maj += result.MajorErrors;
                }
                return new Result("average", n, amb, min, maj);
            }

            public override string ToString() => $"amb: {AmbiguousRate}\nmin: {MinorRate}\nmaj: {MajorRate}\novr: {OverallRate}";
        }

        public Result Run(F0Estimator estimator)
        {
            var (f0s, sampleRate) = estimator.Run(audio.Samples, audio.SampleRate);
            
            int n = f0s.Count();
            int nAmb = 0, nMin = 0, nMaj = 0;

            int i = 0;
            foreach (var f in f0s)
            {
                var startTime = i / sampleRate;
                i++;
                var endTime = i / sampleRate;

                var relevantLabels = labels.Where(l => l.start <= startTime && l.end >= endTime);

                if (!relevantLabels.Any()) // overlap error
                {
                    nAmb++;
                }
                else // fit
                {
                    var label = relevantLabels
                        .OrderBy(l => Math.Abs(f - l.pitch.Frequency))
                        .First();

                    var pitchRef = label.pitch;
                    var pitchMes = Pitch.FromFrequency(f) ?? new Pitch(0);

                    var deltaClass = pitchMes.PitchClass - pitchRef.PitchClass;
                    var deltaOctave = pitchMes.OctaveOffset - pitchRef.OctaveOffset;

                    if (isMinor(deltaClass, deltaOctave))
                    {
                        nMin++;
                    }
                    else if (isMajor(deltaClass))
                    {
                        nMaj++;
                    }

                    static bool isMinor(int delC, int delO) =>
                        (delC == 0 && delO != 0)
                        || Math.Abs(delC) == 4 || Math.Abs(delC) == 7;
                    static bool isMajor(int delC) =>
                        delC != 0 && Math.Abs(delC) != 4 && Math.Abs(delC) != 7;
                }
            }

            return new Result(id, n, nAmb, nMin, nMaj);
        }
    }
}
