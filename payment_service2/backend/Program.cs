using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PaymentService2.Data;
using PaymentService2.Services;

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
            var value = trimmed[(eqIndex + 1)..].Trim().Trim('"');
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

// Get connection string
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\MSSQLLocalDB;Database=PaymentService2;Trusted_Connection=True;TrustServerCertificate=True;";

// Register SqlHelper
builder.Services.AddSingleton(new SqlHelper(connectionString));

// Register HttpClientFactory (required for PayMongo)
builder.Services.AddHttpClient();

// Register Services
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ITopUpService, TopUpService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IRefundService, RefundService>();
builder.Services.AddScoped<IPayMongoService, PayMongoService>();
builder.Services.AddScoped<IPaymentProvider, PayMongoPaymentProvider>();

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Payment Service 2 API (Stored Procedures)",
        Version = "v1",
        Description = "Payment Service using ADO.NET and Stored Procedures"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// JWT Authentication
var jwtSecret = Environment.GetEnvironmentVariable("JwtSettings__Secret")
                ?? builder.Configuration["JwtSettings:Secret"]
                ?? "YourSuperSecretKeyHereAtLeast32CharactersLong!";
var jwtIssuer = Environment.GetEnvironmentVariable("JwtSettings__Issuer")
                ?? builder.Configuration["JwtSettings:Issuer"]
                ?? "FoodDeliverySystem";
var jwtAudience = Environment.GetEnvironmentVariable("JwtSettings__Audience")
                ?? builder.Configuration["JwtSettings:Audience"]
                ?? "FoodDeliveryClients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateLifetime = true
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()  // Allow tunnel URLs
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Payment Service 2 API v1");
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Get tunnel URL from environment
var tunnelUrl = Environment.GetEnvironmentVariable("TUNNEL_URL");

// Startup message
Console.WriteLine("===========================================");
Console.WriteLine("Payment Service 2 (Stored Procedures)");
Console.WriteLine("-------------------------------------------");
Console.WriteLine("Swagger UI: http://localhost:5201/swagger");
Console.WriteLine("-------------------------------------------");
Console.WriteLine("Architecture: ADO.NET + Stored Procedures");
Console.WriteLine("Database: " + (connectionString.Contains("PaymentService2") ? "PaymentService2" : "Custom"));

// Dynamic webhook registration
if (!string.IsNullOrEmpty(tunnelUrl))
{
    Console.WriteLine("-------------------------------------------");
    Console.WriteLine($"Tunnel URL: {tunnelUrl}");
    Console.WriteLine("Registering PayMongo webhook...");
    
    try
    {
        using var scope = app.Services.CreateScope();
        var paymongoService = scope.ServiceProvider.GetRequiredService<IPayMongoService>();
        var webhookUrl = $"{tunnelUrl}/api/payments/webhook";
        var result = await paymongoService.RegisterOrUpdateWebhookAsync(webhookUrl);
        
        if (result.Success)
        {
            Console.WriteLine($"✓ Webhook registered: {webhookUrl}");
            Console.WriteLine($"  Webhook ID: {result.WebhookId}");
        }
        else
        {
            Console.WriteLine($"✗ Webhook registration failed: {result.Message}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"✗ Webhook registration error: {ex.Message}");
    }
}
else
{
    Console.WriteLine("-------------------------------------------");
    Console.WriteLine("No TUNNEL_URL set. Webhook not registered.");
    Console.WriteLine("Set TUNNEL_URL in .env.local or environment");
}

Console.WriteLine("===========================================");

// MIGRATION: Ensure SP_UpdateTopUpPaymentUrl exists
using (var scope = app.Services.CreateScope())
{
    var sql = scope.ServiceProvider.GetRequiredService<SqlHelper>();
    try 
    {
        // 1. Add CheckoutSessionId column if it doesn't exist
        await sql.ExecuteRawSqlAsync(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TopUps') AND name = 'CheckoutSessionId')
            BEGIN
                ALTER TABLE TopUps ADD CheckoutSessionId NVARCHAR(100);
            END
        ");
        Console.WriteLine("✓ Migration applied: Alter TopUps table");

        // 2. Update stored procedure to handle the new column
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_UpdateTopUpPaymentUrl
                @TopUpId NVARCHAR(50),
                @PaymentUrl NVARCHAR(MAX),
                @CheckoutSessionId NVARCHAR(100) = NULL
            AS
            BEGIN
                SET NOCOUNT ON;
                
                UPDATE TopUps
                SET PaymentUrl = @PaymentUrl,
                    CheckoutSessionId = @CheckoutSessionId
                WHERE Id = @TopUpId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_UpdateTopUpPaymentUrl");

        // 3. Update SP_GetTopUp to return CheckoutSessionId
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_GetTopUp
                @TopUpId NVARCHAR(50)
            AS
            BEGIN
                SET NOCOUNT ON;
                
                SELECT Id, UserId, Amount, Status, PaymentMethod, PaymentUrl, CheckoutSessionId, CreatedAt, CompletedAt
                FROM TopUps
                WHERE Id = @TopUpId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_GetTopUp");

        // 4. Migration for Orders table (Proactive Verification)
        await sql.ExecuteRawSqlAsync(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'CheckoutSessionId')
            BEGIN
                ALTER TABLE Orders ADD CheckoutSessionId NVARCHAR(100);
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'PaymentUrl')
            BEGIN
                ALTER TABLE Orders ADD PaymentUrl NVARCHAR(MAX);
            END
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'PaymentLinkId')
            BEGIN
                ALTER TABLE Orders ADD PaymentLinkId NVARCHAR(100);
            END
        ");
        Console.WriteLine("✓ Migration applied: Alter Orders table");

        // 4.5. SP_CreateOrder (Missing)
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_CreateOrder
                @UserId NVARCHAR(100),
                @Amount DECIMAL(18,2),
                @PaymentMethod NVARCHAR(50),
                @VoucherCode NVARCHAR(50) = NULL,
                @VoucherDiscount DECIMAL(18,2) = 0,
                @CoinsUsed INT = 0,
                @CoinsDiscount DECIMAL(18,2) = 0,
                @Branch NVARCHAR(200) = NULL
            AS
            BEGIN
                SET NOCOUNT ON;
                
                DECLARE @OrderId NVARCHAR(50) = 'ord_' + REPLACE(NEWID(), '-', '');
                DECLARE @FinalAmount DECIMAL(18,2) = @Amount - @VoucherDiscount - @CoinsDiscount;
                
                INSERT INTO Orders (Id, UserId, Amount, Status, PaymentMethod, PaymentStatus, 
                                  VoucherCode, VoucherDiscount, CoinsUsed, CoinsDiscount, 
                                  FinalAmount, Branch, CreatedAt)
                VALUES (@OrderId, @UserId, @Amount, 'pending', @PaymentMethod, 'pending', 
                        @VoucherCode, @VoucherDiscount, @CoinsUsed, @CoinsDiscount, 
                        @FinalAmount, @Branch, SYSUTCDATETIME());
                
                SELECT @OrderId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_CreateOrder");

        // 4.6. SP_CompleteOrder (Missing)
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_CompleteOrder
                @OrderId NVARCHAR(50)
            AS
            BEGIN
                SET NOCOUNT ON;
                
                UPDATE Orders
                SET Status = 'completed',
                    PaymentStatus = 'paid',
                    CompletedAt = SYSUTCDATETIME()
                WHERE Id = @OrderId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_CompleteOrder");

        // 5. SP_UpdateOrderPaymentData
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_UpdateOrderPaymentData
                @OrderId NVARCHAR(50),
                @PaymentUrl NVARCHAR(MAX) = NULL,
                @PaymentLinkId NVARCHAR(100) = NULL,
                @CheckoutSessionId NVARCHAR(100) = NULL
            AS
            BEGIN
                SET NOCOUNT ON;
                
                UPDATE Orders
                SET PaymentUrl = @PaymentUrl,
                    PaymentLinkId = @PaymentLinkId,
                    CheckoutSessionId = @CheckoutSessionId
                WHERE Id = @OrderId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_UpdateOrderPaymentData");

        // 6. Update SP_GetOrder
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_GetOrder
                @OrderId NVARCHAR(50)
            AS
            BEGIN
                SET NOCOUNT ON;
                
                SELECT Id, UserId, Amount, Status, PaymentMethod, PaymentStatus,
                       VoucherCode, VoucherDiscount, CoinsUsed, CoinsDiscount,
                       FinalAmount, Branch, PaymentUrl, PaymentLinkId, CheckoutSessionId,
                       CreatedAt, CompletedAt
                FROM Orders
                WHERE Id = @OrderId;
                
                SELECT Id, OrderId, Name, Quantity, Price
                FROM OrderItems
                WHERE OrderId = @OrderId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_GetOrder");

        // 7. Update SP_GetOrdersByUser
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_GetOrdersByUser
                @UserId NVARCHAR(100)
            AS
            BEGIN
                SET NOCOUNT ON;
                
                SELECT Id, UserId, Amount, Status, PaymentMethod, PaymentStatus,
                       VoucherCode, VoucherDiscount, CoinsUsed, CoinsDiscount,
                       FinalAmount, Branch, PaymentUrl, PaymentLinkId, CheckoutSessionId,
                       CreatedAt, CompletedAt
                FROM Orders
                WHERE UserId = @UserId
                ORDER BY CreatedAt DESC;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_GetOrdersByUser");

        // 8. SP_AddOrderItem
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_AddOrderItem
                @OrderId NVARCHAR(50),
                @Name NVARCHAR(200),
                @Quantity INT,
                @Price DECIMAL(18,2)
            AS
            BEGIN
                SET NOCOUNT ON;
                
                INSERT INTO OrderItems (OrderId, Name, Quantity, Price)
                VALUES (@OrderId, @Name, @Quantity, @Price);
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_AddOrderItem");

        // 9. SP_GetOrderItems
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_GetOrderItems
                @OrderId NVARCHAR(50)
            AS
            BEGIN
                SET NOCOUNT ON;
                
                SELECT Id, OrderId, Name, Quantity, Price
                FROM OrderItems
                WHERE OrderId = @OrderId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_GetOrderItems");

        // 10. SP_UpdateOrder
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_UpdateOrder
                @OrderId NVARCHAR(50),
                @PaymentMethod NVARCHAR(50),
                @VoucherCode NVARCHAR(50) = NULL,
                @VoucherDiscount DECIMAL(18,2) = 0,
                @CoinsDiscount DECIMAL(18,2) = 0,
                @FinalAmount DECIMAL(18,2),
                @Status NVARCHAR(50),
                @PaymentUrl NVARCHAR(MAX) = NULL,
                @PaymentLinkId NVARCHAR(100) = NULL
            AS
            BEGIN
                SET NOCOUNT ON;
                
                UPDATE Orders
                SET PaymentMethod = @PaymentMethod,
                    VoucherCode = @VoucherCode,
                    VoucherDiscount = @VoucherDiscount,
                    CoinsDiscount = @CoinsDiscount,
                    FinalAmount = @FinalAmount,
                    Status = @Status,
                    PaymentUrl = @PaymentUrl,
                    PaymentLinkId = @PaymentLinkId
                WHERE Id = @OrderId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_UpdateOrder");

        // 11. Refunds Table
        await sql.ExecuteRawSqlAsync(@"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Refunds')
            BEGIN
                CREATE TABLE Refunds (
                    Id NVARCHAR(50) PRIMARY KEY,
                    UserId NVARCHAR(100) NOT NULL,
                    OrderId NVARCHAR(50),
                    Amount DECIMAL(18,2) NOT NULL,
                    Reason NVARCHAR(1000),
                    Category NVARCHAR(100),
                    Status NVARCHAR(50) NOT NULL DEFAULT 'pending',
                    CustomerName NVARCHAR(200),
                    CustomerEmail NVARCHAR(200),
                    CustomerPhone NVARCHAR(50),
                    AdminNotes NVARCHAR(1000),
                    RejectionReason NVARCHAR(500),
                    ReviewedBy NVARCHAR(100),
                    WalletCredited BIT DEFAULT 0,
                    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    ReviewedAt DATETIME2
                );
            END
        ");
        Console.WriteLine("✓ Migration applied: Refunds table");

        // 12. SP_CreateRefund
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_CreateRefund
                @UserId NVARCHAR(100),
                @OrderId NVARCHAR(50) = NULL,
                @Amount DECIMAL(18,2),
                @Reason NVARCHAR(1000) = NULL,
                @Category NVARCHAR(100) = NULL,
                @CustomerName NVARCHAR(200) = NULL,
                @CustomerEmail NVARCHAR(200) = NULL,
                @CustomerPhone NVARCHAR(50) = NULL
            AS
            BEGIN
                SET NOCOUNT ON;
                
                DECLARE @RefundId NVARCHAR(50) = 'ref_' + REPLACE(NEWID(), '-', '');
                
                INSERT INTO Refunds (Id, UserId, OrderId, Amount, Reason, Category, Status,
                                     CustomerName, CustomerEmail, CustomerPhone, CreatedAt)
                VALUES (@RefundId, @UserId, @OrderId, @Amount, @Reason, @Category, 'pending',
                        @CustomerName, @CustomerEmail, @CustomerPhone, SYSUTCDATETIME());
                
                SELECT Id, UserId, OrderId, Amount, Reason, Category, Status,
                       CustomerName, CustomerEmail, CustomerPhone, CreatedAt
                FROM Refunds
                WHERE Id = @RefundId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_CreateRefund");

        // 13. SP_GetRefunds
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_GetRefunds
                @UserId NVARCHAR(100) = NULL,
                @Status NVARCHAR(50) = NULL
            AS
            BEGIN
                SET NOCOUNT ON;
                
                SELECT Id, UserId, OrderId, Amount, Reason, Category, Status,
                       CustomerName, CustomerEmail, CustomerPhone, AdminNotes,
                       RejectionReason, ReviewedBy, WalletCredited, CreatedAt, ReviewedAt
                FROM Refunds
                WHERE (@UserId IS NULL OR UserId = @UserId)
                  AND (@Status IS NULL OR Status = @Status)
                ORDER BY CreatedAt DESC;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_GetRefunds");

        // 14. SP_ReviewRefund
        await sql.ExecuteRawSqlAsync(@"
            CREATE OR ALTER PROCEDURE SP_ReviewRefund
                @RefundId NVARCHAR(50),
                @Action NVARCHAR(20), -- 'approve' or 'reject'
                @AdminNotes NVARCHAR(1000) = NULL,
                @RejectionReason NVARCHAR(500) = NULL,
                @ReviewedBy NVARCHAR(100) = NULL
            AS
            BEGIN
                SET NOCOUNT ON;
                
                DECLARE @NewStatus NVARCHAR(50);
                IF @Action = 'approve'
                    SET @NewStatus = 'approved';
                ELSE
                    SET @NewStatus = 'rejected';
                
                UPDATE Refunds
                SET Status = @NewStatus,
                    AdminNotes = @AdminNotes,
                    RejectionReason = @RejectionReason,
                    ReviewedBy = @ReviewedBy,
                    ReviewedAt = SYSUTCDATETIME()
                WHERE Id = @RefundId;
                
                SELECT Id, UserId, OrderId, Amount, Status, AdminNotes, RejectionReason,
                       ReviewedBy, WalletCredited, ReviewedAt
                FROM Refunds
                WHERE Id = @RefundId;
            END
        ");
        Console.WriteLine("✓ Migration applied: SP_ReviewRefund");

        // 15. SP_ProcessRefundToWallet - Removed to use version from stored_procedures.sql
        // await sql.ExecuteRawSqlAsync(@"..."); 
        Console.WriteLine("✓ Migration applied: SP_ProcessRefundToWallet (Skipped - check SQL file)");

        // Seed Test Order
        await sql.ExecuteRawSqlAsync(@"
            IF NOT EXISTS (SELECT 1 FROM Orders WHERE Id LIKE 'ord_coffee_%')
            BEGIN
                DECLARE @OrderId NVARCHAR(50) = 'ord_coffee_' + REPLACE(NEWID(), '-', '');
                DECLARE @UserId NVARCHAR(100) = 'user_001';

                INSERT INTO Orders (Id, UserId, Amount, Status, PaymentMethod, PaymentStatus, FinalAmount, Branch, CreatedAt)
                VALUES (@OrderId, @UserId, 440.00, 'pending', 'wallet', 'pending', 440.00, 'Kapebara Main', SYSUTCDATETIME());

                INSERT INTO OrderItems (OrderId, Name, Quantity, Price)
                VALUES 
                (@OrderId, 'Caramel Macchiato', 2, 160.00),
                (@OrderId, 'Ham & Cheese Croissant', 1, 120.00);
            END
        ");
        Console.WriteLine("✓ Seeded test order: Coffee");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration warning: {ex.Message}");
    }
}

app.Run();

