using System;
using System.Linq;
using System.Collections.Generic;

namespace Parsing
{
    public static class ArrayExtensions
    {
        public static int ArgMax<T>(this T[] array) where T : IComparable
        {
            if (array.Length == 0)
                throw new ArgumentException("ArgMax is not defined for empty array");

            int index = 0;
            T elem = array[0];

            for (int i = 1; i < array.Length; i++)
            {
                if (elem.CompareTo(array[i]) < 0)
                {
                    elem = array[i];
                    index = i;
                }
            }

            return index;
        }

        public static int[] ArgTop<T>(this T[] array, int count) where T : IComparable
        {
            if (array.Length == 0)
                throw new ArgumentException("ArgTop is not defined for empty array");
            if (array.Length < count)
                throw new ArgumentException($"cannot collect top {count} indices for array of length {array.Length}");

            return array
                .Select((elem, i) => (i, elem))
                .OrderByDescending(t => t.elem)
                .Take(count)
                .Select(t => t.i)
                .ToArray();
        }

        public static T[] TopPeaks<T>(this T[] array, int count = 0) where T : IComparable
        {
            if (array.Length < 3)
                throw new ArgumentException("TopPeaks is not defined for array with less than three elements");
            if (array.Length < count)
                throw new ArgumentException($"cannot collect top {count} indices for array of length {array.Length}");

            if (count <= 0)
                count = array.Length;

            var peaks = new List<T>();

            for (int i = 1; i < array.Length - 1; i++)
            {
                if (array[i - 1].CompareTo(array[i]) < 0 && array[i].CompareTo(array[i + 1]) > 0)
                    peaks.Add(array[i]);
            }

            peaks.Sort();
            peaks.Reverse();

            return peaks.Take(count).ToArray();
        }

        public static int[] ArgPeaks<T>(this T[] array, int count = 0) where T : IComparable
        {
            if (array.Length < 3)
                throw new ArgumentException("ArgPeaks is not defined for array with less than three elements");
            if (array.Length < count)
                throw new ArgumentException($"cannot collect top {count} indices for array of length {array.Length}");

            if (count <= 0)
                count = array.Length;

            var peaksList = new List<(int, T)>();

            for (int i = 1; i < array.Length - 1; i++)
            {
                if (array[i - 1].CompareTo(array[i]) < 0 && array[i].CompareTo(array[i + 1]) > 0)
                    peaksList.Add((i, array[i]));
            }

            var peaks = peaksList
                .OrderByDescending(t => t.Item2)
                .Take(count)
                .Select(t => t.Item1)
                .ToArray();

            var output = new int[count];
            Array.Fill(output, -1);
            peaks.CopyTo(output, 0);

            return output;
        }
    }
}
