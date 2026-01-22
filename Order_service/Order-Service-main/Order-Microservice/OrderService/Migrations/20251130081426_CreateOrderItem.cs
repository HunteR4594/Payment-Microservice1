using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrderService.Migrations
{
    /// <inheritdoc />
    public partial class CreateOrderItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE OrderItem (
                    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
                    orders_id INT NOT NULL,
                    menu_item_id INT NOT NULL,
                    item_variant_id INT NOT NULL,
                    item_name NVARCHAR(255) NOT NULL,
                    item_description NVARCHAR(255),
                    img_url NVARCHAR(500),
                    variant_name NVARCHAR(50),
                    variant_price DECIMAL(10,2) NOT NULL,
                    quantity INT NOT NULL CHECK (quantity > 0),
                    special_instructions NVARCHAR(255),
                    line_subtotal DECIMAL(10,2) NOT NULL,
                    CONSTRAINT FK_Order FOREIGN KEY (orders_id) REFERENCES Orders(orders_id)
                );              

            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE OrderItem");
        }
    }
}
