using Microsoft.AspNetCore.Http.HttpResults;

namespace GzToolsAPI.Models
{
    public class UpdateInputsRequest
    {
        public class AddModifyInputWrapper
        {
            public InputButtons[] InputButtons { get; set; } = Array.Empty<InputButtons>();
            public int frameIndex { get; set; }
            public sbyte x { get; set; }
            public sbyte y { get; set; }
            public ushort padDelta { get; set; }

            public MovieInput getNewMovieInput(ushort pad)
            {
                return new MovieInput()
                {
                    raw = new Z64Controller()
                    {
                        pad = setInputsOnPad(pad, InputButtons),
                        x = x,
                        y = y
                    },
                    pad_delta = padDelta,
                };
            }
        }

        public string Base64 { get; set; } = string.Empty;
        public AddModifyInputWrapper[] AddInputs { get; set; } = Array.Empty<AddModifyInputWrapper>();
        public AddModifyInputWrapper[] ModifyInputs { get; set; } = Array.Empty<AddModifyInputWrapper>();


        public int[] DeleteInputsFrameIndexes { get; set; } = Array.Empty<int>();

        public static ushort setInputsOnPad(ushort pad, InputButtons[] inputButtons)
        {
            foreach(var button in inputButtons)
            {
                if(button.isButtonPressed)
                {
                    pad = setBit(pad, (int)button.ButtonType);
                }
                else
                {
                    pad = clearBit(pad, (int)button.ButtonType);
                }
            }
            return pad;
        }

        private static ushort setBit(ushort x, int i)
        {
            return (ushort)(x | (1 << i));
        }

        private static ushort clearBit(ushort x, int i)
        {
            return (ushort)(x & ~(1 << i));
        }


    }
}
