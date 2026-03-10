using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFeeChallanTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "fee_challan",
                columns: table => new
                {
                    fee_challan_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    challan_number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    fee_structure_id = table.Column<int>(type: "int", nullable: true),
                    month = table.Column<int>(type: "int", nullable: false),
                    year = table.Column<int>(type: "int", nullable: false),
                    due_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    base_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    addons_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    late_fine = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    paid_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_pro_rated = table.Column<bool>(type: "bit", nullable: false),
                    remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fee_challan", x => x.fee_challan_id);
                    table.ForeignKey(
                        name: "FK_fee_challan_fee_structure_fee_structure_id",
                        column: x => x.fee_structure_id,
                        principalTable: "fee_structure",
                        principalColumn: "fee_structure_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_fee_challan_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "fee_payment",
                columns: table => new
                {
                    fee_payment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fee_challan_id = table.Column<int>(type: "int", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    transaction_reference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    received_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    paid_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fee_payment", x => x.fee_payment_id);
                    table.ForeignKey(
                        name: "FK_fee_payment_fee_challan_fee_challan_id",
                        column: x => x.fee_challan_id,
                        principalTable: "fee_challan",
                        principalColumn: "fee_challan_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_fee_challan_fee_structure_id",
                table: "fee_challan",
                column: "fee_structure_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_challan_student_id",
                table: "fee_challan",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_payment_fee_challan_id",
                table: "fee_payment",
                column: "fee_challan_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "fee_payment");

            migrationBuilder.DropTable(
                name: "fee_challan");
        }
    }
}
