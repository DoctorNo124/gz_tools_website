using GzToolsAPI.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using static GzToolsAPI.Models.GzMacro;

namespace GzToolsAPI.Services
{
    public class GzmMacroService
    {
        [DllImport(@"GzMacrosDll.so", EntryPoint = "set_gzmacro", CallingConvention = CallingConvention.StdCall)]
        public static extern int SetDllGzMacro(byte[] data, ref GzMacro gzm, int size);

        [DllImport(@"GzMacrosDll.so", EntryPoint = "cat_gzmacro", CallingConvention = CallingConvention.StdCall)]
        public static extern int CatGzMacro(byte[] gzmData1, int gzmDataSize1, byte[] gzmData2, int gzmDataSize2, ref FileOutput fileOutput);

        [DllImport(@"GzMacrosDll.so", EntryPoint = "update_inputs_gzmacro", CallingConvention = CallingConvention.StdCall)]
        public static extern int UpdateInputsGzMacro(ref GzMacro gzm, in MovieInput input, ref FileOutput fileOutput);

        [DllImport(@"GzMacrosDll.so", EntryPoint = "trim_gzmacro", CallingConvention = CallingConvention.StdCall)]
        public static extern int TrimGzMacro(byte[] data, int size, uint end, ref FileOutput fileOutput);

        [DllImport(@"GzMacrosDll.so", EntryPoint = "slice_gzmacro", CallingConvention = CallingConvention.StdCall)]
        public static extern int SliceGzMacro(byte[] data, int size, uint frame_start, uint frame_end, ref FileOutput fileOutput);

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
            var wrapper = new GzMacroWrapper();

            unsafe
            {
                var inputSpan = new ReadOnlySpan<MovieInput>(gzMacro.input.ToPointer(), (int)gzMacro.n_input);
                wrapper.inputs = inputSpan.ToArray();
                var seedSpan = new ReadOnlySpan<MovieSeed>(gzMacro.seed.ToPointer(), (int)gzMacro.n_seed);
                wrapper.seeds = seedSpan.ToArray().Select(seed => {
                    return new FormattedMovieSeed()
                    {
                        frame_idx = seed.frame_idx,
                        old_seed = string.Format("{0:X}", seed.old_seed),
                        new_seed = string.Format("{0:X}", seed.new_seed),
                    };
                }).ToArray();
            }
            wrapper.macro = gzMacro;
            return wrapper;
        }

        public byte[] CatMacro(byte[] bytes, byte[] bytes2)
        {
            var fileOutput = new FileOutput();
            CatGzMacro(bytes, bytes.Length, bytes2, bytes2.Length, ref fileOutput);

            byte[] outputBytes;
            unsafe
            {
                var byteSpan = new Span<byte>(fileOutput.bytes.ToPointer(), (int)fileOutput.n_bytes);
                outputBytes = byteSpan.ToArray();
            }
            return outputBytes;
        }

        public byte[] UpdateInputs(UpdateInputsRequest request)
        {
            var gzMacro = new GzMacro();
            var bytes = Convert.FromBase64String(request.Base64);
            int code = SetDllGzMacro(bytes, ref gzMacro, bytes.Length);
            Span<MovieInput> inputSpan;
            unsafe
            {
                inputSpan = new Span<MovieInput>(gzMacro.input.ToPointer(), (int)gzMacro.n_input);
            }
            foreach (var modifyRequest in request.ModifyInputs)
            {
                if (modifyRequest.frameIndex >= 0 && modifyRequest.frameIndex < gzMacro.n_input)
                {
                    inputSpan[modifyRequest.frameIndex] = modifyRequest.getNewMovieInput(inputSpan[modifyRequest.frameIndex].raw.pad);
                }
                else
                {
                    throw new Exception("Invalid frame index " + modifyRequest.frameIndex + " for modifying input in macro!");
                }
            }
            for (int i = 0; i < request.DeleteInputsFrameIndexes.Length; i++)
            {
                var deleteFrameIndex = request.DeleteInputsFrameIndexes[i];
                if (deleteFrameIndex >= 0 && deleteFrameIndex < gzMacro.n_input)
                {
                    deleteFrameIndex -= request.DeleteInputsFrameIndexes.Take(i).Count(index => index < deleteFrameIndex);
                    List<MovieInput> startingInputs = inputSpan.Slice(0, deleteFrameIndex).ToArray().ToList();
                    List<MovieInput> endingInputs = inputSpan.Slice(deleteFrameIndex + 1, (int)gzMacro.n_input - deleteFrameIndex - 1).ToArray().ToList();
                    List<MovieInput> finalList =
                    [
                        .. startingInputs,
                        .. endingInputs,
                    ];
                    inputSpan = new Span<MovieInput>(finalList.ToArray());
                    gzMacro.n_input--;
                }
                else
                {
                    throw new Exception("Invalid frame index " + deleteFrameIndex + " for deleting input in macro!");
                }
            }
            var frameIndexes = request.AddInputs.Select(input => input.frameIndex);
            for (int i = 0; i < request.AddInputs.Length; i++)
            {
                var addRequest = request.AddInputs[i];
                if (addRequest.frameIndex >= 0 && addRequest.frameIndex < gzMacro.n_input)
                {
                    addRequest.frameIndex -= request.DeleteInputsFrameIndexes.Count(index => index < addRequest.frameIndex);
                    addRequest.frameIndex += frameIndexes.Take(i).Count(index => index <= addRequest.frameIndex);
                    List<MovieInput> startingInputs = inputSpan.Slice(0, addRequest.frameIndex + 1).ToArray().ToList();
                    List<MovieInput> endingInputs = inputSpan.Slice(addRequest.frameIndex, (int)gzMacro.n_input - (addRequest.frameIndex) - 1).ToArray().ToList();
                    List<MovieInput> finalList =
                    [
                        .. startingInputs,
                        addRequest.getNewMovieInput(0),
                        .. endingInputs,
                    ];
                    inputSpan = new Span<MovieInput>(finalList.ToArray());
                    gzMacro.n_input++;
                }
                else if (addRequest.frameIndex >= gzMacro.n_input)
                {
                    List<MovieInput> finalList =
                    [
                        .. inputSpan,
                        addRequest.getNewMovieInput(0),
                    ];
                    inputSpan = new Span<MovieInput>(finalList.ToArray());
                    gzMacro.n_input++;
                }
                else
                {
                    throw new Exception("Invalid frame index " + addRequest.frameIndex + " for adding input to macro!");
                }
            }
            return UpdateInputsFromSpan(inputSpan, gzMacro);
        }

        private byte[] UpdateInputsFromSpan(Span<MovieInput> inputSpan, GzMacro gzMacro)
        {
            var fileOutput = new FileOutput();
            unsafe
            {
                fixed (MovieInput* ptr = &MemoryMarshal.GetReference(inputSpan))
                {
                    UpdateInputsGzMacro(ref gzMacro, Unsafe.AsRef<MovieInput>(ptr), ref fileOutput);
                }
            }
            byte[] outputBytes;
            unsafe
            {
                var byteSpan = new Span<byte>(fileOutput.bytes.ToPointer(), (int)fileOutput.n_bytes);
                outputBytes = byteSpan.ToArray();
            }
            return outputBytes;
        }

        public byte[] TrimMacro(byte[] bytes, uint end)
        {
            var fileOutput = new FileOutput();
            TrimGzMacro(bytes, bytes.Length, end, ref fileOutput);
            byte[] outputBytes;
            unsafe
            {
                var byteSpan = new Span<byte>(fileOutput.bytes.ToPointer(), (int)fileOutput.n_bytes);
                outputBytes = byteSpan.ToArray();
            }
            return outputBytes;
        }

        public byte[] SliceMacro(byte[] bytes, uint frameStart, uint frameEnd)
        {
            var fileOutput = new FileOutput();
            SliceGzMacro(bytes, bytes.Length, frameStart, frameEnd, ref fileOutput);

            byte[] outputBytes;
            unsafe
            {
                var byteSpan = new Span<byte>(fileOutput.bytes.ToPointer(), (int)fileOutput.n_bytes);
                outputBytes = byteSpan.ToArray();
            }
            return outputBytes;
        }


    }
}