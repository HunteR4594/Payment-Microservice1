using Microsoft.AspNetCore.Mvc;
using PaymentService.Models;
using PaymentService.Services;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopUpController : ControllerBase
{
    private readonly ITopUpService _topUpService;
    private readonly ILogger<TopUpController> _logger;

    public TopUpController(ITopUpService topUpService, ILogger<TopUpController> logger)
    {
        _topUpService = topUpService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new top-up request
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TopUpResponse>> CreateTopUp(
        [FromBody] TopUpRequest request,
        [FromQuery] string userId = "user_001")
    {
        try
        {
            if (request.Amount <= 0)
            {
                return BadRequest(new TopUpResponse
                {
                    Success = false,
                    Message = "Amount must be greater than 0"
                });
            }

            var topUp = await _topUpService.CreateTopUpAsync(userId, request);

            return Ok(new TopUpResponse
            {
                Success = true,
                Data = topUp,
                Message = "Top-up created successfully",
                CheckoutUrl = topUp.PaymentLinkUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating top-up");
            return StatusCode(500, new TopUpResponse
            {
                Success = false,
                Message = $"Error creating top-up: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Get top-up by ID
    /// </summary>
    [HttpGet("{topUpId}")]
    public async Task<ActionResult<TopUpResponse>> GetTopUp(string topUpId)
    {
        var topUp = await _topUpService.GetTopUpAsync(topUpId);
        if (topUp == null)
        {
            return NotFound(new TopUpResponse
            {
                Success = false,
                Message = "Top-up not found"
            });
        }

        return Ok(new TopUpResponse
        {
            Success = true,
            Data = topUp
        });
    }

    /// <summary>
    /// Get all top-ups for a user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<TopUpListResponse>> GetTopUps(
        [FromQuery] string userId = "user_001",
        [FromQuery] int limit = 10)
    {
        var topUps = await _topUpService.GetTopUpsAsync(userId, limit);
        return Ok(new TopUpListResponse
        {
            Success = true,
            Data = topUps,
            Total = topUps.Count
        });
    }

    /// <summary>
    /// Complete a pending top-up (simulate successful payment)
    /// </summary>
    [HttpPost("{topUpId}/complete")]
    public async Task<ActionResult<TopUpResponse>> CompleteTopUp(string topUpId)
    {
        try
        {
            var topUp = await _topUpService.CompleteTopUpAsync(topUpId);
            return Ok(new TopUpResponse
            {
                Success = true,
                Data = topUp,
                Message = "Top-up completed successfully! Balance has been added to your wallet."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new TopUpResponse
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing top-up {TopUpId}", topUpId);
            return StatusCode(500, new TopUpResponse
            {
                Success = false,
                Message = $"Error completing top-up: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Fail a pending top-up
    /// </summary>
    [HttpPost("{topUpId}/fail")]
    public async Task<ActionResult<TopUpResponse>> FailTopUp(string topUpId)
    {
        try
        {
            var topUp = await _topUpService.FailTopUpAsync(topUpId);
            return Ok(new TopUpResponse
            {
                Success = true,
                Data = topUp,
                Message = "Top-up marked as failed."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new TopUpResponse
            {
                Success = false,
                Message = ex.Message
            });
        }
    }
}
