using System;

namespace Analysis
{
    public enum PitchClass { C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B, Unknown }

    public abstract class Token
    {
        public readonly DateTime From;
        public readonly DateTime To;

        public Token(DateTime from, DateTime to)
        {
            From = from;
            To = to;
        }

        public Token(int from, int to, int sampleRate)
        {
            From = new DateTime().AddSeconds((double)from / sampleRate);
            To = new DateTime().AddSeconds((double)to / sampleRate);
        }

        public override string ToString()
        {
            return $"{From.Minute}:{From.Second}:{From.Millisecond}-{To.Minute}:{To.Second}:{To.Millisecond}";
        }
    }

    public class Tone : Token
    {
        public readonly PitchClass Pitch;

        public Tone(DateTime from, DateTime to, PitchClass pitch) : base(from, to)
        {
            Pitch = pitch;
        }

        public Tone(int from, int to, int sampleRate, PitchClass pitch) : base(from, to, sampleRate)
        {
            Pitch = pitch;
        }

        public override string ToString()
        {
            return $"{Pitch}@" + base.ToString();
        }
    }

    public class Rest : Token
    {
        public Rest(DateTime from, DateTime to) : base(from, to) { }
        public Rest(int from, int to, int sampleRate) : base(from, to, sampleRate) { }

        public override string ToString()
        {
            return "_@" + base.ToString();
        }
    }

    public class UnidentifiedSection : Token
    {
        public UnidentifiedSection(DateTime from, DateTime to) : base(from, to) { }
        public UnidentifiedSection(int from, int to, int sampleRate) : base(from, to, sampleRate) { }

        public override string ToString()
        {
            return "U@" + base.ToString();
        }
    }
}
