using System.Net.Http.Json;
using System.Text.Json;
using PaymentService2.Models;

namespace PaymentService2.Services;

public interface IOrderServiceClient
{
    bool IsConfigured { get; }
    Task<ExternalOrderDto> GetOrderAsync(string orderId, CancellationToken ct = default);
    Task<int> GetPendingCountAsync(string userId, CancellationToken ct = default);
    Task<bool> ConfirmPaymentAsync(bool success, string userId, CancellationToken ct = default);
}

public class OrderServiceClient : IOrderServiceClient
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<OrderServiceClient> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public OrderServiceClient(HttpClient http, IConfiguration config, ILogger<OrderServiceClient> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public bool IsConfigured
    {
        get
        {
            var enabledRaw = _config["OrderService:Enabled"];
            var enabled = bool.TryParse(enabledRaw, out var parsedEnabled) && parsedEnabled;
            var baseUrl = _config["OrderService:BaseUrl"];
            return enabled && !string.IsNullOrWhiteSpace(baseUrl);
        }
    }

    private Uri BuildUri(string template, Dictionary<string, string> tokens)
    {
        var baseUrl = _config["OrderService:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException("OrderService is not configured. Set OrderService:BaseUrl in appsettings.");
        }

        var path = template;
        foreach (var kv in tokens)
        {
            path = path.Replace("{" + kv.Key + "}", Uri.EscapeDataString(kv.Value));
        }

        return new Uri(new Uri(baseUrl.TrimEnd('/')), path.TrimStart('/'));
    }

    private void AddAuthHeader()
    {
        // Generate a minimal JWT or API Key for internal service-to-service auth
        // Use the same JWT Secret as the main app for simplicity, assuming OrderService validates it similarly
        var secret = _config["JwtSettings:Secret"] ?? _config["Jwt:Key"] ?? "YourSuperSecretKeyHereAtLeast32CharactersLong!";
        var issuer = _config["JwtSettings:Issuer"] ?? _config["Jwt:Issuer"] ?? "PaymentService";
        var audience = _config["JwtSettings:Audience"] ?? _config["Jwt:Audience"] ?? "OrderService";

        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var key = System.Text.Encoding.UTF8.GetBytes(secret);

        var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, "system"), // Generic system ID for non-user calls
                new System.Security.Claims.Claim("sub", "system"),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, "admin")
            }),
            Expires = DateTime.UtcNow.AddMinutes(5),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key), Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        _http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwt);
    }

    public async Task<ExternalOrderDto> GetOrderAsync(string orderId, CancellationToken ct = default)
    {
        var path = _config["OrderService:GetOrderPath"] ?? "api/orders/{orderId}/items";
        var uri = BuildUri(path, new Dictionary<string, string> { { "orderId", orderId } });

        _logger.LogInformation("Fetching order {OrderId} from OrderService: {Uri}", orderId, uri);

        AddAuthHeader();

        try
        {
            var res = await _http.GetAsync(uri, ct);
            
            if (!res.IsSuccessStatusCode)
            {
                 var body = await res.Content.ReadAsStringAsync(ct);
                 _logger.LogWarning("OrderService returned {StatusCode}: {Body}", res.StatusCode, body);
                 throw new InvalidOperationException($"OrderService returned {(int)res.StatusCode}: {body}");
            }

            var dto = await res.Content.ReadFromJsonAsync<ExternalOrderDto>(JsonOptions, ct);
            return dto ?? throw new InvalidOperationException("OrderService returned empty response");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get order from OrderService");
            throw;
        }
    }

    public async Task<int> GetPendingCountAsync(string userId, CancellationToken ct = default)
    {
        var path = _config["OrderService:ListOrdersByUserPath"] ?? "api/orders/history";
        // Implementation stubbed as 0 for now as per previous logic
        return await Task.FromResult(0);
    }

    public async Task<bool> ConfirmPaymentAsync(bool success, string userId, CancellationToken ct = default)
    {
        var path = _config["OrderService:ConfirmPaymentPath"] ?? "api/orders/payments/confirm";
        var uri = BuildUri(path + $"?Success={success.ToString().ToLower()}", new Dictionary<string, string>());

        _logger.LogInformation("Confirming payment for user {UserId} to OrderService: {Uri}", userId, uri);

        // IMPERSONATION TOKEN
        var secret = _config["JwtSettings:Secret"] ?? _config["Jwt:Key"] ?? "YourSuperSecretKeyHereAtLeast32CharactersLong!";
        var issuer = _config["JwtSettings:Issuer"] ?? _config["Jwt:Issuer"] ?? "PaymentService";
        var audience = _config["JwtSettings:Audience"] ?? _config["Jwt:Audience"] ?? "OrderService";

        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var key = System.Text.Encoding.UTF8.GetBytes(secret);

        var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, userId),
                new System.Security.Claims.Claim("sub", userId),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, "customer")
            }),
            Expires = DateTime.UtcNow.AddMinutes(5),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key), Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        _http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwt);

        try
        {
            var res = await _http.PostAsync(uri, null, ct);
            
            if (!res.IsSuccessStatusCode)
            {
                 var body = await res.Content.ReadAsStringAsync(ct);
                 _logger.LogError("OrderService payment confirmation failed {StatusCode}: {Body}", res.StatusCode, body);
                 return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to confirm payment with OrderService");
            throw;
        }
    }
}

public class ExternalOrderDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public List<ExternalOrderItemDto> Items { get; set; } = new();
}

public class ExternalOrderItemDto
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
