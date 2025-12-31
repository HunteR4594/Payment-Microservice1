using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using PaymentService.Domain.DTOs;
using Services = PaymentService.Services;
using PaymentService.Integrations;

namespace PaymentService.Controllers;

public static class PaymentEndpoints
{
    public static void MapPaymentRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments");

        // GET /api/payments/methods
        group.MapGet("/methods", async (PayMongoAdapter adapter) =>
        {
            try 
            {
                var methods = await adapter.GetAvailablePaymentMethodsAsync();
                return Results.Ok(methods);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching payment methods: {ex.Message}");
                // Fallback to mock methods if PayMongo fails
                return Results.Ok(new[] { "Card", "Gcash", "Maya", "GrabPay" });
            }
        });

        // POST /api/payments/checkout
        group.MapPost("/checkout", async (
            [FromBody] CreatePaymentRequest request, 
            Services.PaymentService service) =>
        {
            try
            {
                // Log the incoming request for debugging
                try
                {
                    var raw = JsonSerializer.Serialize(request);
                    Console.WriteLine($"Received checkout request: {raw}");
                }
                catch (Exception jex)
                {
                    Console.WriteLine($"Failed to serialize request for logging: {jex.Message}");
                }

                // Call service
                string url = await service.ProcessPaymentRequest(request);
                
                // Return 200 OK with the URL
                return Results.Ok(new { checkoutUrl = url });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing checkout: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                // Return error details for debugging
                return Results.Problem(
                    detail: ex.Message,
                    statusCode: 500,
                    title: "Checkout Processing Error"
                );
            }
        });
    }
}
