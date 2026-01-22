using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PaymentService.Models;
using PaymentService.Services;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RefundsController : ControllerBase
{
    private readonly IRefundService _refundService;
    private readonly ILogger<RefundsController> _logger;

    private ActionResult AdminForbidden()
    {
        return StatusCode(403, new { message = "Admin role required." });
    }

    /// <summary>
    /// Create a refund request with an optional uploaded photo (multipart/form-data).
    /// </summary>
    [HttpPost("with-photo")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<RefundRequest>> CreateRefundWithPhoto(
        [FromForm] RefundRequestDto dto,
        IFormFile? photo)
    {
        try
        {
            if (photo != null && photo.Length > 0)
            {
                var ext = Path.GetExtension(photo.FileName);
                var safeExt = string.IsNullOrWhiteSpace(ext) ? ".jpg" : ext;
                var fileName = $"{Guid.NewGuid():N}{safeExt}";

                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "UploadedRefundPhotos");
                Directory.CreateDirectory(uploadsDir);

                var filePath = Path.Combine(uploadsDir, fileName);
                await using var stream = System.IO.File.Create(filePath);
                await photo.CopyToAsync(stream);

                dto.PhotoPath = $"/refund-photos/{fileName}";
            }

            var refund = await _refundService.CreateRefundRequestAsync(dto);
            return CreatedAtAction(nameof(GetRefundById), new { id = refund.Id }, refund);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating refund request (with photo)");
            return StatusCode(500, new { message = "Error creating refund request" });
        }
    }

    private bool IsAdminRequest()
    {
        return User?.Claims?.Any(c => c.Type == ClaimTypes.Role && (string.Equals(c.Value, "Admin", StringComparison.OrdinalIgnoreCase) || string.Equals(c.Value, "SuperAdmin", StringComparison.OrdinalIgnoreCase))) ?? false;
    }

    public RefundsController(IRefundService refundService, ILogger<RefundsController> logger)
    {
        _refundService = refundService;
        _logger = logger;
    }

    /// <summary>
    /// Get all refund requests
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<RefundRequest>>> GetAllRefunds([FromQuery] string? status = null)
    {
        if (!IsAdminRequest())
        {
            return AdminForbidden();
        }

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<RefundStatus>(status, true, out var refundStatus))
        {
            var filteredRefunds = await _refundService.GetRefundsByStatusAsync(refundStatus);
            return Ok(filteredRefunds);
        }

        var refunds = await _refundService.GetAllRefundsAsync();
        return Ok(refunds);
    }

    /// <summary>
    /// Get refund by ID
    /// </summary>
    // FIX: Removed :guid constraint
    [HttpGet("{id}")]
    // FIX: Changed Guid to string
    public async Task<ActionResult<RefundRequest>> GetRefundById(string id)
    {
        var refund = await _refundService.GetRefundByIdAsync(id);
        if (refund == null)
        {
            return NotFound(new { message = "Refund not found" });
        }
        return Ok(refund);
    }

    /// <summary>
    /// Get refunds by status
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<RefundRequest>>> GetRefundsByStatus(string status)
    {
        if (!Enum.TryParse<RefundStatus>(status, true, out var refundStatus))
        {
            return BadRequest(new { message = "Invalid status" });
        }

        var refunds = await _refundService.GetRefundsByStatusAsync(refundStatus);
        return Ok(refunds);
    }

    /// <summary>
    /// Get refunds for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<RefundRequest>>> GetRefundsByUser(string userId)
    {
        // Non-admin callers can only fetch their own refunds
        if (!IsAdminRequest())
        {
            var callerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(callerId)) return Unauthorized();
            userId = callerId;
        }

        var refunds = await _refundService.GetRefundsByUserAsync(userId);
        return Ok(refunds);
    }

    /// <summary>
    /// Create a new refund request
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RefundRequest>> CreateRefund([FromBody] RefundRequestDto dto)
    {
        try
        {
            // If caller is not admin, ensure refund is created for the authenticated user
            if (!IsAdminRequest())
            {
                var callerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(callerId)) return Unauthorized();
                dto.UserId = callerId;
            }

            var refund = await _refundService.CreateRefundRequestAsync(dto);
            return CreatedAtAction(nameof(GetRefundById), new { id = refund.Id }, refund);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating refund request");
            return StatusCode(500, new { message = "Error creating refund request" });
        }
    }

    /// <summary>
    /// Review (approve/reject) a refund request
    /// </summary>
    // FIX: Removed :guid constraint
    [HttpPut("{id}/review")]
    // FIX: Changed Guid to string
    public async Task<ActionResult<RefundRequest>> ReviewRefund(string id, [FromBody] ReviewRefundDto dto)
    {
        if (!IsAdminRequest())
        {
            return AdminForbidden();
        }

        var refund = await _refundService.ReviewRefundAsync(id, dto);
        if (refund == null)
        {
            return NotFound(new { message = "Refund not found" });
        }
        return Ok(refund);
    }

    /// <summary>
    /// Process an approved refund - credits the user's wallet
    /// </summary>
    // FIX: Removed :guid constraint
    [HttpPost("{id}/process")]
    // FIX: Changed Guid to string
    public async Task<ActionResult<RefundRequest>> ProcessRefund(string id)
    {
        if (!IsAdminRequest())
        {
            return AdminForbidden();
        }

        try
        {
            var refund = await _refundService.ProcessRefundToWalletAsync(id);
            if (refund == null)
            {
                return NotFound(new { message = "Refund not found" });
            }
            return Ok(new 
            { 
                message = $"Refund processed! ₱{refund.Amount} credited to user's wallet.",
                refund 
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund {RefundId}", id);
            return StatusCode(500, new { message = "Error processing refund" });
        }
    }

    /// <summary>
    /// Approve and immediately process a refund (credits wallet)
    /// </summary>
    // FIX: Removed :guid constraint
    [HttpPost("{id}/approve-and-process")]
    // FIX: Changed Guid to string
    public async Task<ActionResult<RefundRequest>> ApproveAndProcessRefund(string id, [FromBody] ReviewRefundDto? dto = null)
    {
        if (!IsAdminRequest())
        {
            return AdminForbidden();
        }

        try
        {
            // First approve the refund
            var reviewDto = dto ?? new ReviewRefundDto { Action = "approve", ReviewedBy = "Admin" };
            reviewDto.Action = "approve";
            
            var refund = await _refundService.ReviewRefundAsync(id, reviewDto);
            if (refund == null)
            {
                return NotFound(new { message = "Refund not found" });
            }

            // Then process it to wallet
            refund = await _refundService.ProcessRefundToWalletAsync(id);
            
            return Ok(new 
            { 
                message = $"Refund approved and processed! ₱{refund!.Amount} credited to user's wallet.",
                refund 
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving and processing refund {RefundId}", id);
            return StatusCode(500, new { message = "Error processing refund" });
        }
    }

    /// <summary>
    /// Contact customer about a refund
    /// </summary>
    [HttpPost("contact")]
    public async Task<ActionResult> ContactCustomer([FromBody] ContactCustomerDto dto)
    {
        if (!IsAdminRequest())
        {
            return AdminForbidden();
        }

        var success = await _refundService.ContactCustomerAsync(dto);
        if (!success)
        {
            return NotFound(new { message = "Refund not found" });
        }
        return Ok(new { message = "Customer contacted successfully" });
    }

    /// <summary>
    /// Get refund statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<RefundStats>> GetRefundStats()
    {
        if (!IsAdminRequest())
        {
            return AdminForbidden();
        }

        var stats = await _refundService.GetRefundStatsAsync();
        return Ok(stats);
    }
}
