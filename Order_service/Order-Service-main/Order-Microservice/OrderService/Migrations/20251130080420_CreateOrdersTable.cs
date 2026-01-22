using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrderService.Migrations
{
    /// <inheritdoc />
    public partial class CreateOrdersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE Orders (
                    orders_id INT IDENTITY(1,1) PRIMARY KEY,
                    users_id INT NOT NULL,
                    payment_id INT,
                    status TINYINT NOT NULL DEFAULT 0,
                    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
                    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
                    placed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    fulfilled_at DATETIME2,
                    cancellation_requested BIT DEFAULT 0,
                    cancellation_reason NVARCHAR(255),
                    payment_method NVARCHAR(50) NOT NULL
                );
        
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE Orders;");
        }
    }
}
