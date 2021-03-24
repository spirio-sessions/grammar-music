using FftSharp;

using System;
using System.Linq;
using System.Collections.Generic;

namespace Analysis
{
    public static class Analysis
    {
        // TODO: add silence detection to identify rests
        // in the end, temporal and tonal analysis should form tokenizer for parsing the audio into a music grammar
        // possible token model: tone(from, to, pitch/harmony), rest(from, to), unidentified-section(from, to)
        // possible token class: abstract Token(DateTime from, DateTime to), rest as derived classes
        public static (
            double[] preprocessedSignal,
            double[] detectionSignal,
            IEnumerable<(int start, int end)> toneIndicies)
        Temporal(
            double[] raw, // needs to be mono
            int sampleRate,
            double hopLength = 0.05,
            double windowLength = 0.25,
            double threshold = 0d)
        {

            #region input checking

            if (windowLength < 2 * hopLength)
                throw new ArgumentException($"window length must be at least twice as big as hop length but instead is {windowLength}:{hopLength}");

            int hopSize = (int)(hopLength * sampleRate);
            int windowSize = (int)(windowLength * sampleRate);

            if (raw.Length < windowSize + 3 * hopSize)
                throw new ArgumentException($"signal with length {raw.Length} is too short for window of length {windowSize}");

            #endregion

            #region variable init

            int halfWindow = (int)Math.Ceiling((double)windowSize / 2);

            int signalPos = halfWindow;
            int preprocessedPos = 0;
            bool toneStarted = false;
            (int start, int end) tone = (-1, -1);

            var preprocessed = new double[(int)Math.Ceiling((double)(raw.Length - windowSize) / hopSize)];
            var detection = new double[preprocessed.Length - 1];
            var toneIndicies = new List<(int start, int end)>();

            var sl = PreprocessWindow(raw, signalPos, halfWindow);
            signalPos += hopSize;
            preprocessed[preprocessedPos] = sl;
            preprocessedPos++;

            var sm1 = PreprocessWindow(raw, signalPos, halfWindow);
            signalPos += hopSize;
            preprocessed[preprocessedPos] = sm1;
            preprocessedPos++;

            int measurePos = signalPos;
            var frame = raw[measurePos];

            var sm2 = PreprocessWindow(raw, signalPos, halfWindow);
            signalPos += hopSize;
            preprocessed[preprocessedPos] = sm2;
            preprocessedPos++;

            var sr = PreprocessWindow(raw, signalPos, halfWindow);
            preprocessed[preprocessedPos] = sr;

            var dl = sm1 - sl;
            detection[0] = dl;

            var dm = sm2 - sm1;
            detection[1] = dm;

            var dr = sr - sm2;
            detection[2] = dr;

            CheckAddTone();

            signalPos += hopSize;
            measurePos += hopSize;
            preprocessedPos++;

            #endregion

            while (signalPos < raw.Length - halfWindow - 1)
            {
                frame = raw[measurePos];

                sm2 = sr;
                sr = PreprocessWindow(raw, signalPos, halfWindow);
                preprocessed[preprocessedPos] = sr;

                dl = dm;
                dm = dr;
                dr = sr - sm2;
                detection[preprocessedPos - 1] = dr;

                CheckAddTone();

                signalPos += hopSize;
                measurePos += hopSize;
                preprocessedPos++;
            }

            return (preprocessed, detection, toneIndicies);

            #region subroutines

            double PreprocessWindow(double[] raw, int position, int halfWindowSize)
            {
                double sum = 0.0d;

                for (int i = position - halfWindowSize; i < position + halfWindowSize; i++)
                {
                    var n = i + halfWindowSize - position;
                    sum += raw[i] * raw[i] * Math.Pow(Math.Sin(Math.PI * n / (halfWindowSize * 2)), 2); // use Hann window for interpolation
                }

                return sum / (2 * halfWindowSize);
            }

            void CheckAddTone()
            {

                // transient start aka. tone onset
                if (dm > 0 && dl < dm && dm >= dr && Math.Abs(frame) > threshold)
                {

                    if (toneStarted)
                    {
                        tone.end = measurePos;
                        toneIndicies.Add(tone);
                        tone = (measurePos, -1);
                    }
                    // if no tone end has been detected between two tone onsets, end the first tone right at the beginning of the second -- index problems?
                    else
                    {
                        tone = (measurePos, -1);
                        toneStarted = true;
                    }

                }

                // transient end aka. tone end
                else if (dm < 0 && dl > dm && dm <= dr)
                {

                    if (toneStarted)
                    {
                        tone.end = measurePos;
                        toneIndicies.Add(tone);
                        toneStarted = false;
                    }

                    // ignored: two subsequent tone ends
                    // argument: tone usually marked by sharp onset with steep flank and flat, extended decay (the latter would often trigger subsequent tone ends)
                    // alternative: generate tone start in between and interpret as two tones -- has to be tested
                }
            }

            #endregion
        }

        // TODO: replace pitch class with harmony of three or more pitch classes
        public static IEnumerable<(int start, int end, (double[] freqs, double[] power) fft, PitchClass pitchClass)>
        Tonal(
            IEnumerable<(int start, int end)> transients,
            double[] rawAudio, // needs to be mono
            int sampleRate)
        {

            #region parallelised

            //var tasks = transients.Select(transient =>
            //{
            //    var task = new Task<(int start, int duration, double pitch)>(() => ToneDetect(transient.start, transient.end, rawAudio));
            //    task.Start();
            //    return task;
            //});

            //Task.WhenAll(tasks).Wait();
            //var tonesUnsorted = tasks.Select(task => task.Result);

            //return tonesUnsorted.OrderBy(tone => tone.start);

            #endregion

            var tones = new List<(int start, int end, (double[] freqs, double[] power), PitchClass pitchClass)>();

            foreach (var transient in transients)
            {
                var tone = ToneDetect(transient.start, transient.end, rawAudio);
                tones.Add(tone);
            }

            return tones;

            (int start, int end, (double[] freqs, double[] power), PitchClass pitchClass) ToneDetect(int start, int end, double[] rawAudio)
            {
                int duration = end - start;
                var segment = new ArraySegment<double>(rawAudio, start, duration).ToArray();
                segment = Pad.ZeroPad(segment);

                var window = Window.Hanning(segment.Length);
                Window.ApplyInPlace(window, segment);
                var power = Transform.FFTpower(segment);
                var freqs = Transform.FFTfreq(sampleRate, power.Length);

                var freq = DominantFreq(power, freqs);
                var pitch = DetectPitchClass(freq);

                return (start, end, (freqs, power), pitch);
            }
        }

        public static double DominantFreq(double[] power, double[] freqs)
        {
            int maxIndex = 0;
            for (int i = 1; i < power.Length; i++)
            {
                if (power[i] > power[maxIndex])
                    maxIndex = i;
            }

            return freqs[maxIndex];
        }

        public static PitchClass DetectPitchClass(double freq)
        {
            // map freq to [a, g#']
            while (!Between(freq, 213.826, 427.653))
            {
                if (freq < 213.826)
                    freq *= 2;
                else if (freq >= 427.653)
                    freq /= 2;
            }

            return freq switch
            {
                double f when Between(f, 213.826, 226.541) => PitchClass.A,
                double f when Between(f, 226.541, 240.012) => PitchClass.Bb,
                double f when Between(f, 240.012, 254.284) => PitchClass.B,
                double f when Between(f, 254.284, 269.405) => PitchClass.C,
                double f when Between(f, 269.405, 285.424) => PitchClass.Db,
                double f when Between(f, 285.424, 302.396) => PitchClass.D,
                double f when Between(f, 302.396, 320.378) => PitchClass.Eb,
                double f when Between(f, 320.378, 339.428) => PitchClass.E,
                double f when Between(f, 339.428, 359.611) => PitchClass.F,
                double f when Between(f, 359.611, 380.995) => PitchClass.Gb,
                double f when Between(f, 380.995, 403.650) => PitchClass.G,
                double f when Between(f, 403.650, 427.653) => PitchClass.Ab,
                _ => PitchClass.Unknown,
            };

            static bool Between(double d, double l, double u) => l < d && d < u;
        }

        public static IEnumerable<Token> Tokenize(
            IEnumerable<(int start, int end, PitchClass pitch)> tones,
            double[] rawAudio, // needs to be mono
            int sampleRate,
            double silenceThreshold = 0.1)
        {
            var tokens = new List<Token>();

            if (!tones.Any())
                return tokens;

            var first = tones.First();
            if (first.start != 0)
                TokenizeSection(0, first.start);

            TokenizeTone(first);

            int prevToneEnd = first.end;
            foreach (var tone in tones.Skip(1))
            {
                TokenizeSection(prevToneEnd, tone.start);
                TokenizeTone(tone);

                prevToneEnd = tone.end;
            }

            var lastToneEnd = tones.Last().end;
            var lastSampleIndex = rawAudio.Length - 1;
            if (lastToneEnd != lastSampleIndex)
                TokenizeSection(lastToneEnd, lastSampleIndex);

            return tokens;

            #region subroutines

            void TokenizeTone((int start, int end, PitchClass pitch) tone)
            {
                tokens.Add(new Tone(tone.start, tone.end, sampleRate, tone.pitch));
            }

            void TokenizeSection(int from, int to)
            {
                if (IsSilence(from, to))
                    tokens.Add(new Rest(from, to, sampleRate));
                else
                    tokens.Add(new UnidentifiedSection(from, to, sampleRate));
            }

            bool IsSilence(int from, int to) =>
                rawAudio
                    .Skip(from)
                    .Take(to - from)
                    .Select(s => Math.Abs(s))
                    .Average() < silenceThreshold;

            #endregion
        }
    }
}
