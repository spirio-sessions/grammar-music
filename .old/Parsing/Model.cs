using System;

namespace Parsing
{
    public enum PitchClass { C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B }

    public class Pitch
    {
        public readonly byte midiNoteNumber;
        public PitchClass PitchClass => (PitchClass)(midiNoteNumber % 12);
        public int OctaveOffset => midiNoteNumber / 12 - 1;
        public double Frequency => Math.Pow(2, (midiNoteNumber - 69) / 12.0) * 440;

        public Pitch(byte midiNoteNumber)
        {
            this.midiNoteNumber = midiNoteNumber;
        }

        public override string ToString() => $"{PitchClass}{OctaveOffset}";

        public static Pitch FromFrequency(double freq)
        {
            if (freq <= 0)
                return null;

            int octaveOffset = 4;

            // map freq to [C4, B4]
            double freqB3C4 = 254.284;
            double freqB4C5 = 508.565;
            while (!Between(freq, freqB3C4, freqB4C5))
            {
                if (freq < freqB3C4)
                {
                    freq *= 2;
                    octaveOffset--;
                }
                else if (freq > freqB4C5)
                {
                    freq /= 2;
                    octaveOffset++;
                }
            }

            return freq switch
            {
                double f when Between(f, freqB3C4, 269.405) => new Pitch((byte)(0 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 269.405, 285.424) => new Pitch((byte)(1 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 285.424, 302.396) => new Pitch((byte)(2 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 302.396, 320.378) => new Pitch((byte)(3 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 320.378, 339.428) => new Pitch((byte)(4 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 339.428, 359.611) => new Pitch((byte)(5 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 359.611, 380.995) => new Pitch((byte)(6 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 380.995, 403.650) => new Pitch((byte)(7 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 403.650, 427.653) => new Pitch((byte)(8 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 427.653, 453.080) => new Pitch((byte)(9 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 453.080, 480.020) => new Pitch((byte)(10 + MidiNoteOffset(octaveOffset))),
                double f when Between(f, 480.020, freqB4C5) => new Pitch((byte)(11 + MidiNoteOffset(octaveOffset))),
                _ => null
            };

            static bool Between(double d, double l, double u) => l < d && d < u;
            static int MidiNoteOffset(int octaveOffset) => 12 * (octaveOffset + 1);
        }
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
