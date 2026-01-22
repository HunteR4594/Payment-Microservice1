using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrderService.Migrations
{
    /// <inheritdoc />
    public partial class CreateCartTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE Cart (
                    cart_id INT IDENTITY(1,1) PRIMARY KEY,
                    users_id INT NOT NULL,
                    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
                    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
                );            
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE Cart;");
        }
    }
}
