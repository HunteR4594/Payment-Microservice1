using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PaymentService.Services;

/// <summary>
/// PayMongo payment provider - Real payment processing via PayMongo API
/// </summary>
public class PayMongoPaymentProvider : IPaymentProvider
{
    private readonly HttpClient _httpClient;
    private readonly string _secretKey;
    private readonly string _apiUrl;
    private readonly ILogger<PayMongoPaymentProvider> _logger;

    public string ProviderName => "PayMongo";

    public PayMongoPaymentProvider(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<PayMongoPaymentProvider> logger)
    {
        // Check environment variable first, then fall back to appsettings
        _secretKey = Environment.GetEnvironmentVariable("PAYMONGO_SECRET_KEY") 
            ?? configuration["PayMongo:SecretKey"] 
            ?? throw new InvalidOperationException("PayMongo secret key not configured. Set PAYMONGO_SECRET_KEY env var or PayMongo:SecretKey in appsettings.");
        
        _apiUrl = Environment.GetEnvironmentVariable("PAYMONGO_BASE_URL") 
            ?? configuration["PayMongo:BaseUrl"] 
            ?? "https://api.paymongo.com/v1";
        
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
        
        // Set up Basic Auth with secret key
        var authBytes = Encoding.ASCII.GetBytes($"{_secretKey}:");
        var authHeader = Convert.ToBase64String(authBytes);
        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authHeader);
    }

    public async Task<CreatePaymentLinkResponse> CreatePaymentLinkAsync(decimal amount, string description, string referenceId)
    {
        try
        {
            var amountInCentavos = (long)(amount * 100);
            
            var payload = new
            {
                data = new
                {
                    attributes = new
                    {
                        amount = amountInCentavos,
                        description,
                        reference_number = referenceId
                    }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            _logger.LogInformation($"Creating PayMongo payment link with payload: {json}");

            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_apiUrl}/links", content);
            
            var responseBody = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"PayMongo error ({response.StatusCode}): {responseBody}");
                throw new InvalidOperationException($"Failed to create payment link: {responseBody}");
            }

            var options = new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true
            };
            var result = JsonSerializer.Deserialize<PayMongoLinkResponse>(responseBody, options);

            _logger.LogInformation($"Successfully created PayMongo link: {result?.Data?.Id}");

            return new CreatePaymentLinkResponse
            {
                Success = true,
                Data = new PaymentLink
                {
                    Id = result?.Data?.Id ?? string.Empty,
                    Url = result?.Data?.Attributes?.CheckoutUrl ?? string.Empty,
                    Amount = amount,
                    Status = "active",
                    CreatedAt = DateTime.UtcNow
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating PayMongo payment link: {ex.Message}");
            return new CreatePaymentLinkResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    public async Task<PaymentIntentResponse> GetPaymentIntentAsync(string paymentIntentId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_apiUrl}/payment_intents/{paymentIntentId}");
            
            var responseBody = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Payment intent not found: {paymentIntentId}");
                throw new InvalidOperationException("Payment intent not found");
            }

            var options = new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true
            };
            var result = JsonSerializer.Deserialize<PayMongoPaymentIntentResponse>(responseBody, options);

            return new PaymentIntentResponse
            {
                Success = true,
                Data = new PaymentIntent
                {
                    Id = result?.Data?.Id ?? string.Empty,
                    Status = result?.Data?.Attributes?.Status ?? "unknown",
                    Amount = (result?.Data?.Attributes?.Amount ?? 0) / 100m
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting PayMongo payment intent: {ex.Message}");
            return new PaymentIntentResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }
}

// PayMongo API Response Models
public class PayMongoLinkResponse
{
    [JsonPropertyName("data")]
    public PayMongoLinkData? Data { get; set; }
}

public class PayMongoLinkData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public PayMongoLinkAttributes? Attributes { get; set; }
}

public class PayMongoLinkAttributes
{
    [JsonPropertyName("checkout_url")]
    public string CheckoutUrl { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public long Amount { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
}

public class PayMongoPaymentIntentResponse
{
    [JsonPropertyName("data")]
    public PayMongoPaymentIntentData? Data { get; set; }
}

public class PayMongoPaymentIntentData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public PayMongoPaymentIntentAttributes? Attributes { get; set; }
}

public class PayMongoPaymentIntentAttributes
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public long Amount { get; set; }

    [JsonPropertyName("payment_method")]
    public string? PaymentMethod { get; set; }
}
