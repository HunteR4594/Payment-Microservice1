using Microsoft.AspNetCore.Mvc;
using PaymentApi.Models;
using PaymentApi.Services;

namespace PaymentApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VouchersController : ControllerBase
{
    private readonly IVoucherService _voucherService;

    public VouchersController(IVoucherService voucherService)
    {
        _voucherService = voucherService;
    }

    /// <summary>
    /// Get all available vouchers
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<VoucherListResponse>> GetVouchers()
    {
        var vouchers = await _voucherService.GetVouchersAsync();
        return Ok(new VoucherListResponse
        {
            Success = true,
            Data = vouchers,
            Total = vouchers.Count
        });
    }

    /// <summary>
    /// Get voucher by code
    /// </summary>
    [HttpGet("{code}")]
    public async Task<ActionResult<VoucherResponse>> GetVoucher(string code)
    {
        var voucher = await _voucherService.GetVoucherByCodeAsync(code);
        if (voucher == null)
        {
            return NotFound(new VoucherResponse
            {
                Success = false,
                Message = "Voucher not found"
            });
        }

        return Ok(new VoucherResponse
        {
            Success = true,
            Data = voucher
        });
    }

    /// <summary>
    /// Apply a voucher to an order
    /// </summary>
    [HttpPost("apply")]
    public async Task<ActionResult<ApplyVoucherResponse>> ApplyVoucher([FromBody] ApplyVoucherRequest request)
    {
        var result = await _voucherService.ApplyVoucherAsync(request);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
