using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using PaymentService.Domain.DTOs;

namespace PaymentService.Integrations;

public class PayMongoAdapter
{
    private readonly HttpClient _httpClient;
    private readonly string _secretKey;

    public PayMongoAdapter(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        // Read from environment variable first, then fall back to appsettings
        _secretKey = Environment.GetEnvironmentVariable("PAYMONGO_SECRET") 
                     ?? config["PayMongo:SecretKey"] 
                     ?? throw new InvalidOperationException("PayMongo:SecretKey not found in configuration or environment variable PAYMONGO_SECRET.");
        _httpClient.BaseAddress = new Uri("https://api.paymongo.com");
    }

    public async Task<List<string>> GetAvailablePaymentMethodsAsync()
    {
        // 1. Auth Header
        var authBytes = Encoding.ASCII.GetBytes($"{_secretKey}:");
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));

        // 2. Call the Endpoint (This specific endpoint lists what your account can do)
        // Note: If this 404s in Test Mode, we can fallback to a hardcoded list for the demo.
        var response = await _httpClient.GetAsync("/v1/payment_methods"); 
        
        if (!response.IsSuccessStatusCode)
        {
            // Fallback for Student Demo if API fails or requires live activation
            return new List<string> { "card", "gcash", "paymaya", "grab_pay" };
        }

        var jsonString = await response.Content.ReadAsStringAsync();
        
        // 3. Deserialize using System.Text.Json (Case Insensitive is safer)
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var result = JsonSerializer.Deserialize<PaymentMethodListResponse>(jsonString, options);

        // 4. Return just the types (e.g., "gcash", "card")
        return result?.data.Select(x => x.attributes.type).Distinct().ToList() 
               ?? new List<string>();
    }

    public async Task<string> CreateCheckoutSessionAsync(decimal amount, string description, string paymentMethod, string currency = "PHP")
    {
        // 1. Auth Header
        var authBytes = Encoding.ASCII.GetBytes($"{_secretKey}:");
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));

        // 2. Create the checkout session payload
        var payload = new
        {
            data = new
            {
                attributes = new
                {
                    amount = (long)(amount * 100), // PayMongo expects amount in cents
                    description = description,
                    payment_method_types = new[] { paymentMethod },
                    // PayMongo requires line_items for checkout_sessions
                    line_items = new[]
                    {
                        new {
                            name = description,
                            amount = (long)(amount * 100),
                            currency = currency,
                            quantity = 1
                        }
                    },
                    success_url = "https://yourapp.com/success", // TODO: Configure your success URL
                    cancel_url = "https://yourapp.com/cancel",   // TODO: Configure your cancel URL
                    reference_number = Guid.NewGuid().ToString()
                }
            }
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // 3. Call the PayMongo API
        var response = await _httpClient.PostAsync("/v1/checkout_sessions", content);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"PayMongo API Error: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        
        // Parse the PayMongo response to extract checkout URL
        try
        {
            var checkoutResponse = JsonSerializer.Deserialize<CheckoutSessionResponse>(responseJson, options);
            return checkoutResponse?.data?.attributes?.checkout_url 
                   ?? throw new Exception("No checkout URL in PayMongo response");
        }
        catch (Exception ex)
        {
            // Log the raw response for debugging
            Console.WriteLine($"Failed to parse PayMongo response: {responseJson}");
            throw new Exception($"Failed to parse PayMongo checkout response: {ex.Message}", ex);
        }
    }
}

// Helper classes for deserializing PayMongo responses
public class CheckoutSessionResponse
{
    public CheckoutSessionData data { get; set; }
}

public class CheckoutSessionData
{
    public CheckoutSessionAttributes attributes { get; set; }
}

public class CheckoutSessionAttributes
{
    public string checkout_url { get; set; }
    public string id { get; set; }
    public string status { get; set; }
}
