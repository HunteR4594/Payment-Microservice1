using Microsoft.AspNetCore.Mvc;
using backend_refund_page.Models;
using backend_refund_page.Services;
using System;

namespace backend_refund_page.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RefundController : ControllerBase
    {
        private readonly RefundService _refundService;

        public RefundController(RefundService refundService)
        {
            _refundService = refundService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_refundService.GetAll());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(Guid id)
        {
            var refund = _refundService.GetById(id);
            if (refund == null) return NotFound();
            return Ok(refund);
        }


        [HttpPost]
        public IActionResult Create([FromBody] Refund refund)
        {
            var created = _refundService.Create(refund);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // New endpoint for file upload
        [HttpPost("upload")]
        public IActionResult UploadPhoto([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Save file to a temp directory (or implement your own logic)
            var uploads = Path.Combine(Directory.GetCurrentDirectory(), "UploadedRefundPhotos");
            if (!Directory.Exists(uploads))
                Directory.CreateDirectory(uploads);

            var filePath = Path.Combine(uploads, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return Ok(new { file = file.FileName, path = filePath });
        }

        [HttpPatch("{id}/status")]
        public IActionResult UpdateStatus(Guid id, [FromBody] string status)
        {
            var updated = _refundService.UpdateStatus(id, status);
            if (!updated) return NotFound();
            return NoContent();
        }
    }
}