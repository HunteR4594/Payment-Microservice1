using Microsoft.AspNetCore.Mvc;
using PaymentService.Domain.DTOs;

namespace PaymentService.Controllers;

public static class VoucherEndpoints
{
    // In-memory voucher storage for demo purposes
    private static List<VoucherDto> _vouchers = new List<VoucherDto>
    {
        new VoucherDto { Id = 1, Name = "SAVE20", MinSpend = 15.00m, HoursLeft = 48, IsUsed = false, DiscountAmount = 20.00m },
        new VoucherDto { Id = 2, Name = "FREESHIP", MinSpend = 50.00m, HoursLeft = 72, IsUsed = false, DiscountAmount = 30.00m },
        new VoucherDto { Id = 3, Name = "NEWYEAR25", MinSpend = 100.00m, HoursLeft = 24, IsUsed = false, DiscountAmount = 25.00m },
    };

    public static void MapVoucherRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/vouchers");

        // GET /api/vouchers - Get all available vouchers
        group.MapGet("/", () =>
        {
            var availableVouchers = _vouchers.Where(v => !v.IsUsed).ToList();
            return Results.Ok(availableVouchers);
        });

        // GET /api/vouchers/{id} - Get a specific voucher
        group.MapGet("/{id:int}", (int id) =>
        {
            var voucher = _vouchers.FirstOrDefault(v => v.Id == id);
            if (voucher == null)
                return Results.NotFound(new { message = "Voucher not found" });
            return Results.Ok(voucher);
        });

        // POST /api/vouchers/redeem - Redeem a voucher by code
        group.MapPost("/redeem", ([FromBody] RedeemVoucherRequest request) =>
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return Results.BadRequest(new { message = "Voucher code is required" });

            var voucher = _vouchers.FirstOrDefault(v => 
                v.Name.Equals(request.Code, StringComparison.OrdinalIgnoreCase) && !v.IsUsed);

            if (voucher == null)
                return Results.NotFound(new { message = "Voucher not found or already used" });

            return Results.Ok(voucher);
        });

        // POST /api/vouchers/apply - Apply a voucher to an order
        group.MapPost("/apply", ([FromBody] ApplyVoucherRequest request) =>
        {
            var voucher = _vouchers.FirstOrDefault(v => v.Id == request.VoucherId && !v.IsUsed);
            
            if (voucher == null)
                return Results.NotFound(new { message = "Voucher not found or already used" });

            if (request.OrderTotal < voucher.MinSpend)
                return Results.BadRequest(new { 
                    message = $"Minimum spend of ₱{voucher.MinSpend:F2} required to use this voucher" 
                });

            // Calculate discount
            var discount = Math.Min(voucher.DiscountAmount, request.OrderTotal);
            var newTotal = request.OrderTotal - discount;

            return Results.Ok(new ApplyVoucherResponse
            {
                VoucherId = voucher.Id,
                VoucherName = voucher.Name,
                OriginalTotal = request.OrderTotal,
                Discount = discount,
                NewTotal = newTotal,
                Message = $"Voucher '{voucher.Name}' applied successfully!"
            });
        });

        // POST /api/vouchers/use - Mark a voucher as used
        group.MapPost("/use/{id:int}", (int id) =>
        {
            var voucher = _vouchers.FirstOrDefault(v => v.Id == id);
            
            if (voucher == null)
                return Results.NotFound(new { message = "Voucher not found" });

            if (voucher.IsUsed)
                return Results.BadRequest(new { message = "Voucher has already been used" });

            voucher.IsUsed = true;
            return Results.Ok(new { message = "Voucher marked as used", voucher });
        });

        // POST /api/vouchers/add - Add a new voucher (for demo)
        group.MapPost("/add", ([FromBody] AddVoucherRequest request) =>
        {
            var newVoucher = new VoucherDto
            {
                Id = _vouchers.Count > 0 ? _vouchers.Max(v => v.Id) + 1 : 1,
                Name = request.Code.ToUpper(),
                MinSpend = request.MinSpend,
                HoursLeft = request.HoursLeft,
                IsUsed = false,
                DiscountAmount = request.DiscountAmount
            };

            _vouchers.Add(newVoucher);
            return Results.Created($"/api/vouchers/{newVoucher.Id}", newVoucher);
        });
    }
}

// DTOs for Voucher operations
public class VoucherDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal MinSpend { get; set; }
    public int HoursLeft { get; set; }
    public bool IsUsed { get; set; }
    public decimal DiscountAmount { get; set; }
}

public class RedeemVoucherRequest
{
    public string Code { get; set; } = string.Empty;
}

public class ApplyVoucherRequest
{
    public int VoucherId { get; set; }
    public decimal OrderTotal { get; set; }
}

public class ApplyVoucherResponse
{
    public int VoucherId { get; set; }
    public string VoucherName { get; set; } = string.Empty;
    public decimal OriginalTotal { get; set; }
    public decimal Discount { get; set; }
    public decimal NewTotal { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class AddVoucherRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal MinSpend { get; set; }
    public int HoursLeft { get; set; }
    public decimal DiscountAmount { get; set; }
}
