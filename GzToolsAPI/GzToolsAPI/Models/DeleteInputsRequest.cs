namespace GzToolsAPI.Models
{
    public class DeleteInputsRequest
    {
        public string Base64 { get; set; }
        public int[] DeleteInputsFrameIndexes { get; set; }
    }
}
