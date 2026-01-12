using System.Text.Json.Serialization;
using PaymentService.Services;

var builder = WebApplication.CreateBuilder(args);

// Load .env.local if exists
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

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register Payment Provider (use Mock by default, PayMongo if secret key is set)
var payMongoSecretKey = Environment.GetEnvironmentVariable("PAYMONGO_SECRET_KEY") 
    ?? builder.Configuration["PayMongo:SecretKey"];
if (!string.IsNullOrEmpty(payMongoSecretKey) && !payMongoSecretKey.StartsWith("your_"))
{
    builder.Services.AddHttpClient();
    builder.Services.AddSingleton<IPaymentProvider, PayMongoPaymentProvider>();
    Console.WriteLine("Using PayMongo Payment Provider");
}
else
{
    builder.Services.AddSingleton<IPaymentProvider, MockPaymentProvider>();
    Console.WriteLine("Using Mock Payment Provider (set PAYMONGO_SECRET_KEY for real payments)");
}

// Register Domain Services
builder.Services.AddSingleton<IWalletService, WalletService>();
builder.Services.AddSingleton<ITopUpService, TopUpService>();
builder.Services.AddSingleton<IOrderService, OrderService>();
builder.Services.AddSingleton<IVoucherService, VoucherService>();
builder.Services.AddSingleton<IRefundService, RefundService>();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

app.Run();
