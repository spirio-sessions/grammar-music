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
        public double Duration { get; private set; }

        public Token(double duration)
        {
            Duration = duration;
        }

        public Token(int durationFrames, double sampleRate)
        {
            Duration = durationFrames / sampleRate;
        }

        public Token DurationAdd(double secs)
        {
            Duration += secs;
            return this;
        }

        public override string ToString()
        {
            return $"{Duration,6:F3}";
        }
    }

    public class Tone : Token
    {
        public readonly Pitch pitch;

        public Tone(Pitch pitch, double duration) : base(duration)
        {
            this.pitch = pitch;
        }

        public Tone(Pitch pitch, int durationFrames, double sampleRate) : base(durationFrames, sampleRate)
        {
            this.pitch = pitch;
        }

        public override string ToString()
        {
            return $"{pitch,3} {base.ToString()}";
        }
    }

    public class UnidentifiedSection : Token
    {
        public UnidentifiedSection(double duration) : base(duration) { }
        public UnidentifiedSection(int durationFrames, double sampleRate) : base(durationFrames, sampleRate) { }

        public override string ToString()
        {
            return $"{"U",3} {base.ToString()}";
        }
    }
}
