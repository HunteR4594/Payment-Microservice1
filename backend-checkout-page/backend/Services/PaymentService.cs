using PaymentService.Domain.DTOs;
using PaymentService.Domain.Entities;
using PaymentService.Data;
using PaymentService.Integrations;

namespace PaymentService.Services;

public class PaymentService
{
    private readonly PaymentRepository _repo;
    private readonly PayMongoAdapter _payMongo;

    public PaymentService(PaymentRepository repo, PayMongoAdapter payMongo)
    {
        _repo = repo;
        _payMongo = payMongo;
    }

    public async Task<string> ProcessPaymentRequest(CreatePaymentRequest request)
    {
        // 1. Create a local record in our Database (Status: Pending)
        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            OrderId = request.OrderId,
            UserId = request.UserId,
            TotalAmount = request.Amount,
            Currency = request.Currency,
            Status = "Pending",
            PaymentMethod = request.PaymentMethod,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            await _repo.CreatePaymentAsync(payment);
        }
        catch (Exception ex)
        {
            // Log repository failures but continue the flow so the frontend can still get a checkout URL
            Console.WriteLine($"[PaymentService] Warning: failed to create payment record: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }

        // 2. Call PayMongo to get the Checkout Link
        string checkoutUrl = await _payMongo.CreateCheckoutSessionAsync(
            request.Amount,
            request.Description,
            request.PaymentMethod,
            request.Currency
        );
        
        // 3. (Optional) Update DB with the PayMongo Transaction ID if you extracted it
        // await _repo.UpdateProviderIdAsync(payment.PaymentId, payMongoId);

        // 4. Return the link to the Frontend so they can redirect the user
        return checkoutUrl;
    }

    public async Task<List<string>> GetPaymentMethodsAsync()
    {
        // Pass-through to adapter
        return await _payMongo.GetAvailablePaymentMethodsAsync();
    }
}