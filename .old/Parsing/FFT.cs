using FftSharp;

namespace Parsing
{
    public static class FFT
    {
        /// <summary>
        /// calculates the fft of a time-discrete signal
        /// </summary>
        /// <param name="audio">audio input comprising the signal's raw data and samplerate</param>
        /// <returns>all contained frequencies and their power in db</returns>
        public static (double[] freq, double[] power) Run(Audio audio)
        {
            var samples = Pad.ZeroPad(audio.Samples);
            var window = Window.Hanning(samples.Length);
            Window.ApplyInPlace(window, samples);

            var power = Transform.FFTpower(samples);
            var freq = Transform.FFTfreq(audio.SampleRate, power.Length);

            return (freq, power);
        }
    }
}
