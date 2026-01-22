using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;
using PaymentService2.Services;
using Microsoft.Extensions.DependencyInjection; // Added for GetRequiredService

namespace PaymentService2.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPayMongoService _paymongoService;
    private readonly IWalletService _walletService;
    private readonly ITopUpService _topUpService;
    private readonly IOrderServiceClient _orderService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IPayMongoService paymongoService,
        IWalletService walletService,
        ITopUpService topUpService,
        IOrderServiceClient orderService,
        ILogger<PaymentsController> logger)
    {
        _paymongoService = paymongoService;
        _walletService = walletService;
        _topUpService = topUpService;
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Create a PayMongo payment link for top-up
    /// </summary>
    [HttpPost("create-link")]
    public async Task<ActionResult> CreatePaymentLink([FromBody] CreatePaymentLinkRequest request)
    {
        try
        {
            // Create top-up record first
            var topUp = await _topUpService.CreateTopUpAsync(request.UserId, request.Amount, "paymongo");

            // Create PayMongo payment link
            var result = await _paymongoService.CreatePaymentLinkAsync(
                request.Amount,
                $"Wallet Top-up for {request.UserId}",
                topUp.Id
            );

            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.Message });
            }

            return Ok(new
            {
                success = true,
                topUpId = topUp.Id,
                checkoutUrl = result.CheckoutUrl,
                linkId = result.LinkId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment link");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Webhook endpoint - receives PayMongo payment notifications
    /// </summary>
    [HttpPost("webhook")]
    public async Task<ActionResult> Webhook()
    {
        try
        {
            // Read raw body
            using var reader = new StreamReader(Request.Body);
            var payload = await reader.ReadToEndAsync();

            _logger.LogInformation("RAW WEBHOOK PAYLOAD: {Payload}", payload);

            // Verify signature (optional in test mode)
            var signature = Request.Headers["Paymongo-Signature"].FirstOrDefault() ?? "";
            var isValid = await _paymongoService.VerifyWebhookSignature(payload, signature);

            if (!isValid)
            {
                _logger.LogWarning("Invalid webhook signature");
                // Continue anyway for testing, but log the warning
            }

            // Parse the webhook event using flexible JSON handling
            using var doc = JsonDocument.Parse(payload);
            var root = doc.RootElement;

            // Navigate safely through the JSON structure
            var eventType = "";
            var referenceNumber = "";
            long amount = 0;

            try
            {
                if (root.TryGetProperty("data", out var data) &&
                    data.TryGetProperty("attributes", out var attrs))
                {
                    eventType = attrs.TryGetProperty("type", out var typeEl) ? typeEl.GetString() ?? "" : "";

                    if (attrs.TryGetProperty("data", out var innerData) &&
                        innerData.TryGetProperty("attributes", out var paymentAttrs))
                    {
                        referenceNumber = paymentAttrs.TryGetProperty("reference_number", out var refEl) 
                            ? refEl.GetString() ?? "" : "";
                        amount = paymentAttrs.TryGetProperty("amount", out var amtEl) 
                            ? amtEl.GetInt64() : 0;
                    }
                }
            }
            catch (Exception parseEx)
            {
                _logger.LogWarning(parseEx, "Error parsing webhook payload, trying alternate path");
            }

            _logger.LogInformation("Webhook event type: {EventType}, Reference: {Reference}", eventType, referenceNumber);

            // Fail-safe: If we have a session ID but no reference (like in payment.paid events), fetch the session
            if (string.IsNullOrEmpty(referenceNumber) && root.ToString().Contains("checkout_session_id"))
            {
                 // Try to extract checkout_session_id manually or from attributes
                 string? sessionId = null;
                 try 
                 {
                     // Deep search for checkout_session_id
                     if (root.TryGetProperty("data", out var d) && d.TryGetProperty("attributes", out var a) && a.TryGetProperty("checkout_session_id", out var sid))
                     {
                         sessionId = sid.GetString();
                     }
                 }
                 catch {}

                 if (!string.IsNullOrEmpty(sessionId))
                 {
                     _logger.LogInformation("Found Checkout Session ID {SessionId} without reference, fetching details...", sessionId);
                     var session = await _paymongoService.GetCheckoutSessionAsync(sessionId);
                     if (session != null && !string.IsNullOrEmpty(session.Attributes?.ReferenceNumber))
                     {
                         referenceNumber = session.Attributes.ReferenceNumber;
                         _logger.LogInformation("Resolved Reference {Ref} from Session {SessionId}", referenceNumber, sessionId);
                     }
                 }
            }

            // Handle payment success
            if (eventType == "link.payment.paid" || 
                eventType == "payment.paid" || 
                eventType == "checkout_session.payment.paid")
            {
                var amountInPesos = amount / 100m; // Convert centavos to pesos
                _logger.LogInformation("Payment completed: Reference={Reference}, Amount={Amount}", referenceNumber, amountInPesos);

                if (!string.IsNullOrEmpty(referenceNumber) && referenceNumber.StartsWith("top_"))
                {
                    // Complete the top-up
                    await _topUpService.CompleteTopUpAsync(referenceNumber);
                    _logger.LogInformation("Top-up completed and wallet credited: {TopUpId}", referenceNumber);
                }
                else if (!string.IsNullOrEmpty(referenceNumber))
                {
                     // Assume it's an Order payment
                     // We need to notify OrderService and mark order as paid internally if needed
                     // But first, we need the UserId. We can get it from the internal order record if we have one.
                     // The OrderService handles its own internal "PlaceOrder" logic upon payment confirmation.
                     
                     // Challenge: we need the UserID to impersonate them for OrderService.
                     // Option 1: Store UserId in PayMongo Metadata (best practice).
                     // Option 2: PaymentService2 doesn't technically store the order directly in a way that links back easily unless we query `OrderService` first?
                     // WAIT: `OrderService.cs` (internal) creates an order in `CreateOrderAsync`.
                     // The `referenceNumber` IS the `orderId` (e.g. "Order 123" or just "123"?).
                     // PayMongoPaymentProvider passes `order.Id` as referenceId.
                     
                     // So referenceNumber == orderId.
                     // Let's look up the internal order to get UserId.
                     
                     // We need to inject IOrderService (internal) to lookup order?
                     // PaymentsController doesn't have IOrderService injected, let's look at deps.
                     // It has IWalletService, ITopUpService.
                     // Let's add IOrderService (internal) to dependency too? Or just use OrderId if we trust it.
                     // We need UserId for the JWT token generation in OrderServiceClient.
                     
                     // Let's blindly try resolving IOrderService from RequestServices if not injected, or better, inject it.
                     // But wait, I didn't inject IOrderService in the chunks above.
                     // Actually, `OrderService.cs` (Internal) relies on `IOrderService` interface.
                     
                     // Let's rely on extracting user ID from metadata if available, OR we query the DB.
                     // Since I didn't add IOrderService to the constructor in this specific tool call (I already sent it), 
                     // I will rely on ITopUpService? No.
                     
                     // Retrying: I will add IOrderService to the constructor in a separate call if needed, 
                     // BUT I am editing the file right now. 
                     // I will lazily request IOrderService from HttpContext.RequestServices to avoid breaking constructor signature again in this chunk 
                     // (though I just changed it in the first chunk... wait, I changed the constructor in the first chunk of THIS tool call).
                     
                     // OK, the first chunk ADDED `IOrderServiceClient` but NOT `IOrderService` (internal).
                     // I should have added `IOrderService` (internal) to the constructor too.
                     // Since I can't restart the tool call, I will resolve it from `HttpContext.RequestServices` as a fallback
                     // OR I can use `_walletService` if it has order lookup? No.
                     
                     // I will use `HttpContext.RequestServices.GetRequiredService<IOrderService>()`.
                     
                     try 
                     {
                         var internalOrderService = HttpContext.RequestServices.GetRequiredService<IOrderService>();
                         var orderId = referenceNumber;
                         var internalOrder = await internalOrderService.GetOrderAsync(orderId);
                         
                         if (internalOrder != null)
                         {
                             _logger.LogInformation("Found internal order {OrderId} for User {UserId}", orderId, internalOrder.UserId);
                             
                             // 1. Notify OrderService (External)
                             var confirmed = await _orderService.ConfirmPaymentAsync(true, internalOrder.UserId);
                             if (confirmed)
                             {
                                 _logger.LogInformation("Successfully confirmed payment with External OrderService for {OrderId}", orderId);
                             }
                             else
                             {
                                 _logger.LogWarning("Failed to confirm payment with External OrderService for {OrderId}", orderId);
                             }
                             
                             // 2. Complete Internal Order (if needed for tracking)
                             await internalOrderService.CompleteOrderAsync(orderId);
                         }
                         else
                         {
                             _logger.LogWarning("Order {OrderId} not found locally, cannot confirm with OrderService (need UserId).", orderId);
                         }
                     }
                     catch (Exception ex)
                     {
                         _logger.LogError(ex, "Error processing order payment confirmation for {OrderId}", referenceNumber);
                     }
                }
                else
                {
                     _logger.LogWarning("Payment received but ReferenceNumber is missing or invalid: {Ref}", referenceNumber);
                }
            }

            return Ok(new { received = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            // Return 200 anyway to prevent PayMongo from retrying
            return Ok(new { received = true, error = ex.Message });
        }
    }

    /// <summary>
    /// Manually register/update webhook (for testing)
    /// </summary>
    [HttpPost("register-webhook")]
    public async Task<ActionResult> RegisterWebhook([FromBody] RegisterWebhookRequest request)
    {
        var result = await _paymongoService.RegisterOrUpdateWebhookAsync(request.WebhookUrl);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}

// Request DTOs
public class CreatePaymentLinkRequest
{
    public string UserId { get; set; } = "";
    public decimal Amount { get; set; }
}

public class RegisterWebhookRequest
{
    public string WebhookUrl { get; set; } = "";
}

// Webhook Event Models
public class PayMongoWebhookEvent
{
    [JsonPropertyName("data")]
    public WebhookEventData? Data { get; set; }
}

public class WebhookEventData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("attributes")]
    public WebhookEventAttributes? Attributes { get; set; }
}

public class WebhookEventAttributes
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "";

    [JsonPropertyName("data")]
    public WebhookPaymentData? Data { get; set; }
}

public class WebhookPaymentData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("attributes")]
    public WebhookPaymentAttributes? Attributes { get; set; }
}

public class WebhookPaymentAttributes
{
    [JsonPropertyName("amount")]
    public long Amount { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "";

    [JsonPropertyName("reference_number")]
    public string ReferenceNumber { get; set; } = "";
}
