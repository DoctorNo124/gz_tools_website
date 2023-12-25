using System.Runtime.InteropServices;

namespace GzToolsAPI.Models
{
    [StructLayout(LayoutKind.Sequential)]
    public struct Z64Controller
    {
        public ushort pad { get; set; }
        public byte x { get; set; }
        public byte y { get; set; }
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MovieInput
    {
        public Z64Controller raw { get; set; }
        public ushort pad_delta { get; set; }
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MovieSeed
    {
        public int frame_idx { get; set; }
        public uint old_seed { get; set; }
        public uint new_seed { get; set; }
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MovieOcaInput
    {
        public int frame_idx { get; set; }
        public ushort pad { get; set; }
        public byte adjusted_x { get; set; }
        public byte adjusted_y { get; set; }
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MovieOcaSync
    {
        public int frame_idx { get; set; }
        public int audio_frames { get; set; }
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MovieRoomLoad
    {
        public int frame_idx { get; set; }
    }

    [StructLayout(LayoutKind.Sequential), Serializable]
    public struct GzMacro
    {
        public uint n_input { get; set; }
        public uint n_seed { get; set; }
        public Z64Controller input_start { get; set; }
        public IntPtr input;
        public IntPtr seed;
        public uint n_oca_input { get; set; }
        public uint n_oca_sync { get; set; }
        public uint n_room_load { get; set; }
        public IntPtr oca_input;
        public IntPtr oca_sync;
        public IntPtr room_load;
        public uint rerecords { get; set; }
        public uint last_recorded_frame { get; set; }
    }
}
