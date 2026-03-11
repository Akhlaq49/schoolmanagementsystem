using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFeeDiscountTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "fee_discount",
                columns: table => new
                {
                    fee_discount_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    scope = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fee_discount", x => x.fee_discount_id);
                });

            migrationBuilder.CreateTable(
                name: "fee_discount_assignment",
                columns: table => new
                {
                    fee_discount_assignment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fee_discount_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: true),
                    family_id = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fee_discount_assignment", x => x.fee_discount_assignment_id);
                    table.ForeignKey(
                        name: "FK_fee_discount_assignment_family_family_id",
                        column: x => x.family_id,
                        principalTable: "family",
                        principalColumn: "family_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_fee_discount_assignment_fee_discount_fee_discount_id",
                        column: x => x.fee_discount_id,
                        principalTable: "fee_discount",
                        principalColumn: "fee_discount_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_fee_discount_assignment_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_fee_discount_assignment_family_id",
                table: "fee_discount_assignment",
                column: "family_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_discount_assignment_fee_discount_id",
                table: "fee_discount_assignment",
                column: "fee_discount_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_discount_assignment_student_id",
                table: "fee_discount_assignment",
                column: "student_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "fee_discount_assignment");

            migrationBuilder.DropTable(
                name: "fee_discount");
        }
    }
}
