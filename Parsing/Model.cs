using System;

namespace Parsing
{
    public enum PitchClass { C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B, Unknown }

    public struct Pitch
    {
        public readonly PitchClass pitchClass;
        public readonly int octaveOffset;

        public Pitch(PitchClass pitchClass, int octaveOffset)
        {
            this.pitchClass = pitchClass;
            this.octaveOffset = octaveOffset;
        }

        public override string ToString() => $"{pitchClass}{octaveOffset}";
    }

    public abstract class Token
    {
        public readonly TimeSpan From;
        public readonly TimeSpan To;

        public Token(TimeSpan from, TimeSpan to)
        {
            From = from;
            To = to;
        }

        public Token(int from, int to, int sampleRate)
        {
            From = new TimeSpan(0, 0, 0, GetSeconds(from), GetMilliSeconds(from));
            To = new TimeSpan(0, 0, 0, GetSeconds(to), GetMilliSeconds(to));

            int GetSeconds(int frameIndex) => frameIndex / sampleRate;
            int GetMilliSeconds(int frameIndex) => 1000 * frameIndex / sampleRate % 1000;
        }

        public override string ToString()
        {
            return $"{From.Minutes}:{From.Seconds}:{From.Milliseconds}-{To.Minutes}:{To.Seconds}:{To.Milliseconds}";
        }
    }

    public class Tone : Token
    {
        public readonly Pitch Pitch;

        public Tone(TimeSpan from, TimeSpan to, Pitch pitch) : base(from, to)
        {
            Pitch = pitch;
        }

        public Tone(int from, int to, int sampleRate, Pitch pitch) : base(from, to, sampleRate)
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
        public Rest(TimeSpan from, TimeSpan to) : base(from, to) { }
        public Rest(int from, int to, int sampleRate) : base(from, to, sampleRate) { }

        public override string ToString()
        {
            return "R@" + base.ToString();
        }
    }

    public class UnidentifiedSection : Token
    {
        public UnidentifiedSection(TimeSpan from, TimeSpan to) : base(from, to) { }
        public UnidentifiedSection(int from, int to, int sampleRate) : base(from, to, sampleRate) { }

        public override string ToString()
        {
            return "U@" + base.ToString();
        }
    }
}
