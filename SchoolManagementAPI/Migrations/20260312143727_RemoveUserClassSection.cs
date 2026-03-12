using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUserClassSection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_payment_expense_category_id",
                table: "payment",
                column: "expense_category_id");

            migrationBuilder.AddForeignKey(
                name: "FK_payment_expense_category_expense_category_id",
                table: "payment",
                column: "expense_category_id",
                principalTable: "expense_category",
                principalColumn: "expense_category_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_payment_expense_category_expense_category_id",
                table: "payment");

            migrationBuilder.DropIndex(
                name: "IX_payment_expense_category_id",
                table: "payment");
        }
    }
}
