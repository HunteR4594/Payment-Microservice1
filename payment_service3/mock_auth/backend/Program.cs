using MockAuthService.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddSingleton<UserStore>();
builder.Services.AddSingleton<JwtService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Mock Auth Service",
        Version = "v1",
        Description = "Mock authentication service for Payment Service testing"
    });
});

// CORS - allow frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3001", "http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mock Auth Service v1");
});

app.UseCors();
app.MapControllers();

// Startup message
Console.WriteLine("===========================================");
Console.WriteLine("Mock Auth Service");
Console.WriteLine("-------------------------------------------");
Console.WriteLine("Swagger UI: http://localhost:5300/swagger");
Console.WriteLine("-------------------------------------------");
Console.WriteLine("Endpoints:");
Console.WriteLine("  POST /api/auth/register");
Console.WriteLine("  POST /api/auth/login");
Console.WriteLine("  GET  /api/auth/test-users");
Console.WriteLine("-------------------------------------------");
Console.WriteLine("Test Users:");
Console.WriteLine("  user@example.com / password123 (user)");
Console.WriteLine("  admin@example.com / admin123 (admin)");
Console.WriteLine("===========================================");

app.Run("http://localhost:5300");
