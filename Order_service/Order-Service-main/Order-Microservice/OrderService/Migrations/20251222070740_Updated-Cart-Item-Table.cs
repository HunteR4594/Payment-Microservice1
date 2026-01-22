using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrderService.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedCartItemTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE CartItem (
                    cart_item_id INT IDENTITY(1,1) PRIMARY KEY,
                    cart_id INT NOT NULL,
                    menu_item_id INT NOT NULL,
                    variant_id INT NOT NULL,
                    item_name NVARCHAR(255) NOT NULL,
                    item_description NVARCHAR(255),
                    img_url NVARCHAR(500),
                    variant_name NVARCHAR(50),
                    variant_price DECIMAL(10,2) NOT NULL,
                    quantity INT NOT NULL CHECK (quantity > 0),
                    computed_subtotal DECIMAL(10,2) NOT NULL,
                    special_instructions NVARCHAR(255),
                    added_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT FK_Cart FOREIGN KEY (cart_id) REFERENCES Cart(cart_id)
                );                
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE CartItem;");
        }
    }
}
