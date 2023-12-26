using GzToolsAPI.Models;
using GzToolsAPI.Services;
using Microsoft.AspNetCore.Mvc;
using static GzToolsAPI.Services.GzmMacroService;

namespace GzToolsAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GzMacroController : ControllerBase
    {
        private readonly GzmMacroService _service;
        public GzMacroController(GzmMacroService service)
        {
            _service = service;
        }
        [HttpPost]
        [Route("stats")]
        public GzMacroWrapper GetGzMacro([FromBody] GzmStatsRequest request)
        {
            var bytes = Convert.FromBase64String(request.Base64);
            var wrapper = _service.GetGzMacro(bytes);
            return wrapper;
        }

        [HttpPost]
        [Route("cat")]
        public FileContentResult CatGzMacro([FromBody] GzmCatRequest request)
        {
            var bytes1 = Convert.FromBase64String(request.Gzm1Base64);
            var bytes2 = Convert.FromBase64String(request.Gzm2Base64);
            var outputBytes = _service.CatMacro(bytes1, bytes2);
            return File(outputBytes, "application/octet-stream");
        }

        [HttpPost]
        [Route("modify_inputs")]
        public FileContentResult ModifyInputsGzMacro([FromBody] UpdateInputsRequest request)
        {
            var outputBytes = _service.ModifyInputs(request);
            return File(outputBytes, "application/octet-stream");
        }

        [HttpPost]
        [Route("add_inputs")]
        public FileContentResult AddInputsGzMacro([FromBody] UpdateInputsRequest request)
        {
            var outputBytes = _service.AddInputs(request);
            return File(outputBytes, "application/octet-stream");
        }

        [HttpPost]
        [Route("delete_inputs")]
        public FileContentResult DeleteInputsGzMacro([FromBody] DeleteInputsRequest request)
        {
            var outputBytes = _service.DeleteInputs(request);
            return File(outputBytes, "application/octet-stream");
        }


    }


}
