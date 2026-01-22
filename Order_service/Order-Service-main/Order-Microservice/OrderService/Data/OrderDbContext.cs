using Microsoft.EntityFrameworkCore;
using OrderService.Models;

namespace OrderService.Data
{
    public class OrderDbContext : DbContext
    {
        public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options) { }

        public DbSet<Cart> Cart { get; set; }
        public DbSet<CartItem> CartItem { get; set; }
        public DbSet<Orders> Orders { get; set; }
        public DbSet<OrderItem> OrderItem { get; set; }
        public DbSet<OrderFeedback> OrderFeedback { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Mapping for Cart & Items 🛒
            modelBuilder.Entity<Cart>().HasKey(c => c.cart_id);
            modelBuilder.Entity<CartItem>().HasKey(c => c.cart_item_id);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.cart_id)
                .OnDelete(DeleteBehavior.Cascade);

            // Mapping for Order Items 🥐
            modelBuilder.Entity<OrderItem>().HasKey(oi => oi.order_item_id);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.orders_id)
                .OnDelete(DeleteBehavior.Cascade);

            // Mapping for Order Feedback ⭐️
            modelBuilder.Entity<OrderFeedback>().HasKey(of => of.order_feedback_id);

            modelBuilder.Entity<OrderFeedback>()
                .HasOne(of => of.Order)
                .WithMany(o => o.OrderFeedbacks)
                .HasForeignKey(of => of.orders_id)
                .OnDelete(DeleteBehavior.Cascade);

            // The Main Event: Orders Table 👑
            modelBuilder.Entity<Orders>(entity =>
            {
                entity.HasKey(e => e.orders_id);

                // Mapping the cancellation vibes 🚩
                entity.Property(e => e.cancellation_requested)
                      .HasDefaultValue(false);

                entity.Property(e => e.cancellation_reason)
                      .HasMaxLength(500)
                      .IsRequired(false);

                entity.Property(e => e.status)
                      .IsRequired();

                // Mapping refund_status as an int for that SSMS sync! 💸🔢
                // 0 = None, 1 = Pending, 2 = Complete
                entity.Property(o => o.refund_status)
                      .HasColumnName("refund_status")
                      .HasColumnType("int")
                      .IsRequired(false);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}