using System.Text.Json.Serialization;
using PaymentService.Services;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using Microsoft.OpenApi.Models; // <-- IMPORTANTE: Added this for OpenApiInfo

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Load .env.local if exists
var envPath = Path.Combine(builder.Environment.ContentRootPath, ".env.local");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
        
        var eqIndex = trimmed.IndexOf('=');
        if (eqIndex > 0)
        {
            var key = trimmed[..eqIndex].Trim();
            var value = trimmed[(eqIndex + 1)..].Trim();
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

// 3. Add Services & Swagger Config
builder.Services.AddEndpointsApiExplorer();

// FIXED: Explicit Swagger Configuration to prevent "Unable to render" error
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Payment Service API", 
        Version = "v1",
        Description = "API for handling payments and transactions." 
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 4. CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 5. Payment Provider Registration
var payMongoSecretKey = Environment.GetEnvironmentVariable("PAYMONGO_SECRET_KEY") 
    ?? builder.Configuration["PayMongo:SecretKey"];

if (!string.IsNullOrEmpty(payMongoSecretKey) && !payMongoSecretKey.StartsWith("your_"))
{
    builder.Services.AddHttpClient();
    builder.Services.AddSingleton<IPaymentProvider, PayMongoPaymentProvider>(); // Singleton is okay here if provider is stateless
    Console.WriteLine("Using PayMongo Payment Provider");
}
else
{
    builder.Services.AddSingleton<IPaymentProvider, MockPaymentProvider>();
    Console.WriteLine("Using Mock Payment Provider");
}

// 6. Register Domain Services (SCOPED - Correct implementation)
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<ITopUpService, TopUpService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IRefundService, RefundService>();

var app = builder.Build();

// 7. Configure Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    // FIXED: Explicit Endpoint for Swagger UI
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Payment Service API v1");
    });
}

app.UseCors();
app.MapControllers();

app.Run();
