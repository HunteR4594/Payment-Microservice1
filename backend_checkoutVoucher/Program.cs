using PaymentService.Data;
using PaymentService.Integrations;
using Services = PaymentService.Services;
using PaymentService.Controllers;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env.local BEFORE any DI container is built
if (builder.Environment.IsDevelopment())
{
    try
    {
        var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env.local");
        Console.WriteLine($"[STARTUP] Looking for .env.local at: {envPath}");
        if (File.Exists(envPath))
        {
            Console.WriteLine($"[STARTUP] Found .env.local, loading variables...");
            // Manually parse and set environment variables
            foreach (var line in File.ReadAllLines(envPath))
            {
                if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#"))
                    continue;
                
                var parts = line.Split('=', 2);
                if (parts.Length == 2)
                {
                    var key = parts[0].Trim();
                    var value = parts[1].Trim().Trim('"').Trim('\'');
                    Environment.SetEnvironmentVariable(key, value);
                    Console.WriteLine($"[STARTUP] Set: {key}={value?.Substring(0, Math.Min(20, value?.Length ?? 0))}...");
                }
            }
            Console.WriteLine($"[STARTUP] .env.local loaded successfully");
        }
        else
        {
            Console.WriteLine($"[STARTUP] Warning: .env.local NOT found at {envPath}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[STARTUP] Error loading .env.local: {ex.Message}");
    }
}

// Verify critical env vars are available
var paymongoSecret = Environment.GetEnvironmentVariable("PAYMONGO_SECRET");
var dbConnection = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
Console.WriteLine($"[STARTUP] PAYMONGO_SECRET available: {!string.IsNullOrEmpty(paymongoSecret)}");
Console.WriteLine($"[STARTUP] DB_CONNECTION_STRING available: {!string.IsNullOrEmpty(dbConnection)}");

// 1. Add Services to container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

// 2. Add CORS policy for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "http://localhost:3000",
                "http://localhost:5259"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 3. Register custom services
builder.Services.AddScoped<PaymentRepository>();
builder.Services.AddScoped<PayMongoAdapter>();
builder.Services.AddScoped<Services.PaymentService>();

var app = builder.Build();

// 4. Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

// 5. Register lifetime events
app.Lifetime.ApplicationStarted.Register(() => 
    Console.WriteLine("[STARTUP] ✓ Application started and listening"));
app.Lifetime.ApplicationStopping.Register(() => 
    Console.WriteLine("[STARTUP] ✓ Application shutting down"));

// 6. Map endpoints
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("Health");

try
{
    app.MapPaymentRoutes();
    app.MapMockPaymentRoutes();
    app.MapVoucherRoutes();
    Console.WriteLine("[STARTUP] ✓ All payment and voucher routes mapped successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"[STARTUP] ✗ Error mapping routes: {ex.Message}");
    throw;
}

Console.WriteLine("[STARTUP] ✓ Starting web server...");
app.Run();
