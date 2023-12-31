namespace GzToolsAPI.Models
{
    public class GzmSliceRequest : GzmRequest
    {
        public uint FrameStart { get; set; }
        public uint FrameEnd { get; set; }
    }
}
