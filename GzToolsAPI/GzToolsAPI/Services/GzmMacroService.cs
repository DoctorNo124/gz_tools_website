using GzToolsAPI.Models;
using System.Runtime.InteropServices;
using static GzToolsAPI.Models.GzMacro;

namespace GzToolsAPI.Services
{
    public class GzmMacroService
    {

        [DllImport(@"C:\Repos\GzMacrosDll\x64\Debug\GzMacrosDll.dll", EntryPoint = "set_gzmacro", CallingConvention = CallingConvention.StdCall)]
        public static extern int SetDllGzMacro(byte[] data, ref GzMacro gzm, int size);


        [DllImport(@"C:\Repos\GzMacrosDll\x64\Debug\GzMacrosDll.dll", EntryPoint = "cat_gzmacro", CallingConvention = CallingConvention.StdCall)]
        public static extern int CatGzMacro(byte[] gzmData1, int gzmDataSize1, byte[] gzmData2, int gzmDataSize2, ref FileOutput fileOutput);

        public class GzMacroWrapper
        {
            public GzMacro macro { get; set; }
            public MovieInput[] inputs { get; set; }
            public FormattedMovieSeed[] seeds { get; set; }
        }

        public struct FormattedMovieSeed
        {
            public int frame_idx { get; set; }
            public string old_seed { get; set; }
            public string new_seed { get; set; }
        }

        public struct FileOutput
        {
            public uint n_bytes;
            public IntPtr bytes;
        }

        public GzMacroWrapper GetGzMacro(byte[] bytes)
            {
            var gzMacro = new GzMacro();
            int code = SetDllGzMacro(bytes, ref gzMacro, bytes.Length);

            var numberOfBytes = 0;
            var actualInputs = new MovieInput[gzMacro.n_input];
            for(int i = 0; i < gzMacro.n_input; i++)
            {
                var movieInput = new MovieInput();
                var raw = new Z64Controller();
                raw.pad = (ushort)Marshal.ReadInt16(gzMacro.input + numberOfBytes);
                numberOfBytes += 2;
                raw.x = Marshal.ReadByte(gzMacro.input + numberOfBytes);
                numberOfBytes += 1;
                raw.y = Marshal.ReadByte(gzMacro.input + numberOfBytes);
                numberOfBytes += 1;
                movieInput.raw = raw;
                movieInput.pad_delta = (ushort)Marshal.ReadInt16(gzMacro.input  + numberOfBytes);
                numberOfBytes += 2;
                actualInputs[i] = movieInput;
            }

            numberOfBytes = 0;
            var actualSeeds = new FormattedMovieSeed[gzMacro.n_seed];
            for (int i = 0; i < gzMacro.n_seed; i++)
            {
                var seed = new FormattedMovieSeed();
                seed.frame_idx = Marshal.ReadInt32(gzMacro.seed + numberOfBytes);
                numberOfBytes += 4;
                seed.old_seed = string.Format("{0:X}", (uint)Marshal.ReadInt32(gzMacro.seed + numberOfBytes));
                numberOfBytes += 4;
                seed.new_seed = string.Format("{0:X}", (uint)Marshal.ReadInt32(gzMacro.seed + numberOfBytes));
                numberOfBytes += 4;
                actualSeeds[i] = seed;
            }

            var wrapper = new GzMacroWrapper();
            wrapper.macro = gzMacro;
            wrapper.inputs = actualInputs;
            wrapper.seeds = actualSeeds;
            return wrapper;
        }

        public byte[] CatMacro(byte[] bytes, byte[] bytes2)
        {
            var fileOutput = new FileOutput();
            CatGzMacro(bytes, bytes.Length, bytes2, bytes2.Length, ref fileOutput);

            var numberOfBytes = 0;
            var outputBytes = new byte[fileOutput.n_bytes];
            for(int i = 0; i < fileOutput.n_bytes; i++)
            {
                outputBytes[i] = Marshal.ReadByte(fileOutput.bytes + numberOfBytes);
                numberOfBytes++;
            }
            return outputBytes;
        }
    }
}
 