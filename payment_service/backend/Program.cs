using System.Text.Json.Serialization;
using PaymentService.Services;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using Microsoft.OpenApi.Models; // <-- IMPORTANTE: Added this for OpenApiInfo
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using PaymentService.Integrations;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Shared HttpClient factory (used by integrations + PayMongo provider)
builder.Services.AddHttpClient();

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
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        // This makes the API send 'code' (camelCase) to React
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

// 6b. Integrations
// Use a typed HttpClient here so upstream Order Service failures surface quickly (instead of hanging for the default timeout).
builder.Services.AddHttpClient<IOrderServiceClient, OrderServiceClient>(client =>
{
    client.Timeout = System.TimeSpan.FromSeconds(5);
});

var app = builder.Build();

// 7. Configure Pipeline
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
    await db.Database.MigrateAsync();
    await DevDataSeeder.SeedAsync(db);

    app.UseSwagger();
    // FIXED: Explicit Endpoint for Swagger UI
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Payment Service API v1");
    });
}

app.UseCors();

// Serve uploaded refund photos (dev only)
var refundPhotosDir = Path.Combine(app.Environment.ContentRootPath, "UploadedRefundPhotos");
Directory.CreateDirectory(refundPhotosDir);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(refundPhotosDir),
    RequestPath = "/refund-photos",
});

app.MapControllers();

app.Run();
