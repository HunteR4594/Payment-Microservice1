using PaymentApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Kapebara Payment API", Version = "v1" });
});

// Add HttpClientFactory for PayMongo API calls
builder.Services.AddHttpClient();

// Register payment provider based on configuration
var paymentProvider = builder.Configuration["PaymentProvider"];
if (paymentProvider == "Mock")
{
    builder.Services.AddSingleton<IPaymentProvider, MockPaymentProvider>();
    Console.WriteLine("💰 Payment Provider: MOCK (simulated payments)");
}
else
{
    builder.Services.AddSingleton<IPaymentProvider, PayMongoPaymentProvider>();
    Console.WriteLine("💰 Payment Provider: PAYMONGO (real payments)");
}

// Register services
builder.Services.AddSingleton<IWalletService, MockWalletService>();
builder.Services.AddSingleton<ITopUpService, MockTopUpService>();
builder.Services.AddSingleton<IOrderService, MockOrderService>();
builder.Services.AddSingleton<IVoucherService, MockVoucherService>();

// Configure CORS for frontend_walletFeature
builder.Services.AddCors(options =>
{
    options.AddPolicy("Allowfrontend_walletFeature", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Allowfrontend_walletFeature");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🚀 Kapebara Payment API running on http://localhost:5000");
Console.WriteLine("📖 Swagger UI: http://localhost:5000/swagger");

app.Run();
