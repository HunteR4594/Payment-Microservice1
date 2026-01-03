using Microsoft.AspNetCore.Mvc;
using backend_refund_page.Models;
using backend_refund_page.Services;
using System;
using System.Threading.Tasks;

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

        /// <summary>
        /// Creates a refund request (pending status, for manual approval)
        /// </summary>
        [HttpPost]
        public IActionResult Create([FromBody] RefundRequest request)
        {
            if (string.IsNullOrEmpty(request.PaymentId))
            {
                return BadRequest(new { error = "PaymentId is required" });
            }

            var created = _refundService.Create(request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Creates and immediately processes a refund through PayMongo
        /// </summary>
        [HttpPost("process")]
        public async Task<IActionResult> CreateAndProcess([FromBody] RefundRequest request)
        {
            if (string.IsNullOrEmpty(request.PaymentId))
            {
                return BadRequest(new { error = "PaymentId is required" });
            }

            if (request.Amount <= 0)
            {
                return BadRequest(new { error = "Amount must be greater than 0" });
            }

            try
            {
                var refund = await _refundService.CreateAndProcessRefundAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = refund.Id }, refund);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Process a pending refund through PayMongo
        /// </summary>
        [HttpPost("{id}/process")]
        public async Task<IActionResult> ProcessRefund(Guid id)
        {
            try
            {
                var refund = await _refundService.ProcessRefundAsync(id);
                if (refund == null)
                {
                    return NotFound(new { error = "Refund not found" });
                }
                return Ok(refund);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Endpoint for file upload
        [HttpPost("upload")]
        public IActionResult UploadPhoto([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Save file to a temp directory
            var uploads = Path.Combine(Directory.GetCurrentDirectory(), "UploadedRefundPhotos");
            if (!Directory.Exists(uploads))
                Directory.CreateDirectory(uploads);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploads, uniqueFileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return Ok(new { file = uniqueFileName, path = filePath });
        }

        /// <summary>
        /// Upload photo and attach to existing refund
        /// </summary>
        [HttpPost("{id}/upload")]
        public IActionResult UploadPhotoForRefund(Guid id, [FromForm] IFormFile file)
        {
            var refund = _refundService.GetById(id);
            if (refund == null)
                return NotFound(new { error = "Refund not found" });

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploads = Path.Combine(Directory.GetCurrentDirectory(), "UploadedRefundPhotos");
            if (!Directory.Exists(uploads))
                Directory.CreateDirectory(uploads);

            var uniqueFileName = $"{id}_{file.FileName}";
            var filePath = Path.Combine(uploads, uniqueFileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            _refundService.UpdatePhotoPath(id, filePath);

            return Ok(new { file = uniqueFileName, path = filePath, refundId = id });
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