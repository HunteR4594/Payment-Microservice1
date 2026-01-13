using Microsoft.EntityFrameworkCore;
using PaymentService.Models;

namespace PaymentService.Data;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options) { }

    // Register ALL your tables here
    public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<RefundRequest> Refunds { get; set; } = null!; // Use RefundRequest class for the 'Refunds' table
    public DbSet<TopUp> TopUps { get; set; } = null!;
    public DbSet<Voucher> Vouchers { get; set; } = null!;
    public DbSet<Wallet> Wallets { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // This fixes the "List<OrderItem>" error
        // It tells EF that OrderItems belong strictly to an Order
        modelBuilder.Entity<Order>().OwnsMany(o => o.Items);

        // Optional: Configure decimal precision (money) to avoid warnings
        modelBuilder.Entity<Order>().Property(o => o.Amount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Transaction>().Property(t => t.Amount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Wallet>().Property(w => w.Balance).HasColumnType("decimal(18,2)");
    }
}