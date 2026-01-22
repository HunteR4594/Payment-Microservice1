using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrderService.Migrations
{
    /// <inheritdoc />
    public partial class CreateOrderFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE OrderFeedback (
                    order_feedback_id INT IDENTITY(1,1) PRIMARY KEY,
                    orders_id INT NOT NULL,
                    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                    comment NVARCHAR(255),
                    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    is_read BIT NOT NULL DEFAULT 0,
                    CONSTRAINT FK_Orders FOREIGN KEY (orders_id) REFERENCES Orders(orders_id)
                );            
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE OrderFeedback;");
        }
    }
}
