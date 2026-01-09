using Microsoft.AspNetCore.Mvc;
using backend_admin_refund.Models;
using backend_admin_refund.Services;

namespace backend_admin_refund.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RefundsController : ControllerBase
{
    private readonly IRefundService _refundService;
    private readonly ILogger<RefundsController> _logger;

    public RefundsController(IRefundService refundService, ILogger<RefundsController> logger)
    {
        _refundService = refundService;
        _logger = logger;
    }

    /// <summary>
    /// Get all refund requests
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<RefundRequest>>> GetAllRefunds()
    {
        var refunds = await _refundService.GetAllRefundsAsync();
        return Ok(refunds);
    }

    /// <summary>
    /// Get refund request by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RefundRequest>> GetRefundById(Guid id)
    {
        var refund = await _refundService.GetRefundByIdAsync(id);
        if (refund == null)
        {
            return NotFound(new { message = "Refund request not found" });
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
            return BadRequest(new { message = "Invalid status. Valid values: Pending, UnderReview, Approved, Rejected, Completed" });
        }

        var refunds = await _refundService.GetRefundsByStatusAsync(refundStatus);
        return Ok(refunds);
    }

    /// <summary>
    /// Create a new refund request (customer-facing)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RefundRequest>> CreateRefund([FromBody] RefundRequestDto dto)
    {
        if (string.IsNullOrEmpty(dto.OrderId) || dto.Amount <= 0)
        {
            return BadRequest(new { message = "OrderId and valid Amount are required" });
        }

        var refund = await _refundService.CreateRefundRequestAsync(dto);
        return CreatedAtAction(nameof(GetRefundById), new { id = refund.Id }, refund);
    }

    /// <summary>
    /// Review a refund request (approve/reject)
    /// </summary>
    [HttpPut("{id:guid}/review")]
    public async Task<ActionResult<RefundRequest>> ReviewRefund(Guid id, [FromBody] ReviewRefundDto dto)
    {
        if (string.IsNullOrEmpty(dto.Action) || (dto.Action.ToLower() != "approve" && dto.Action.ToLower() != "reject"))
        {
            return BadRequest(new { message = "Action must be 'approve' or 'reject'" });
        }

        if (dto.Action.ToLower() == "reject" && string.IsNullOrEmpty(dto.RejectionReason))
        {
            return BadRequest(new { message = "Rejection reason is required when rejecting a refund" });
        }

        var refund = await _refundService.ReviewRefundAsync(id, dto);
        if (refund == null)
        {
            return NotFound(new { message = "Refund request not found" });
        }

        return Ok(refund);
    }

    /// <summary>
    /// Contact customer about their refund request
    /// </summary>
    [HttpPost("contact")]
    public async Task<ActionResult> ContactCustomer([FromBody] ContactCustomerDto dto)
    {
        if (string.IsNullOrEmpty(dto.Subject) || string.IsNullOrEmpty(dto.Message))
        {
            return BadRequest(new { message = "Subject and Message are required" });
        }

        var success = await _refundService.ContactCustomerAsync(dto);
        if (!success)
        {
            return NotFound(new { message = "Refund request not found" });
        }

        return Ok(new { message = "Customer contacted successfully" });
    }

    /// <summary>
    /// Get refund statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<RefundStats>> GetRefundStats()
    {
        var stats = await _refundService.GetRefundStatsAsync();
        return Ok(stats);
    }
}
