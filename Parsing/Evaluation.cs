using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace Parsing
{
    public class Evaluation
    {
        private readonly Audio audio;
        public readonly IEnumerable<IEnumerable<Label>> labels;

        public Evaluation(string basePath, string name)
        {
            var audioPath = Path.Combine(basePath, $"{name}.wav");
            audio = Audio.File(audioPath);
            var labelPath = Path.Combine(basePath, $"{name}.csv");
            labels = ReadLabels(labelPath);
        }

        private static IEnumerable<IEnumerable<Label>> ReadLabels(string path)
        {
            using var sr = new StreamReader(path);
            var lines = sr.ReadToEnd().Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            return lines
                .Skip(1)
                .Select(line => line.Split(','))
                .Select(fields => LabelFromFields(fields))
                .GroupBy(
                    label => label.start,
                    (_, ls) => ls);

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
            public readonly long start;
            public readonly long end;
            public readonly Pitch pitch;

            public Label(long start, long end, Pitch pitch)
            {
                this.start = start;
                this.end = end;
                this.pitch = pitch;
            }
        }
    }
}
