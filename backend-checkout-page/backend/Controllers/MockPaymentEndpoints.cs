using Microsoft.AspNetCore.Mvc;
using PaymentService.Domain.DTOs;
using Services = PaymentService.Services;

namespace PaymentService.Controllers;

public static class MockPaymentEndpoints
{
    public static void MapMockPaymentRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/mock/payments");

        // Mock GET /api/mock/payments/methods
        group.MapGet("/methods", () =>
        {
            var methods = new[] { "card", "gcash", "paymaya", "grab_pay" };
            return Results.Ok(methods);
        });

        // Mock POST /api/mock/payments/checkout - returns fake checkout URL
        group.MapPost("/checkout", async ([FromBody] CreatePaymentRequest request) =>
        {
            try
            {
                // Simulate a short delay
                await Task.Delay(300);

                // Return a local mock checkout page so developers don't hit PayMongo's live site
                // This points to a static file served by Vite under `/mock-checkout.html`.
                var sessionId = Guid.NewGuid().ToString("N");
                var localMockUrl = $"/mock-checkout.html?session={sessionId}";

                return Results.Ok(new
                {
                    checkoutUrl = localMockUrl,
                    message = "Mock checkout session created (local mock)",
                    sessionId = sessionId
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Mock checkout error: {ex.Message}");
            }
        });
    }
}
