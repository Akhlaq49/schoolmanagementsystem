using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFeeStructureTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "fee_structure",
                columns: table => new
                {
                    fee_structure_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: false),
                    academic_session_id = table.Column<int>(type: "int", nullable: false),
                    monthly_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    due_day_of_month = table.Column<int>(type: "int", nullable: false),
                    late_fine_per_day = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fee_structure", x => x.fee_structure_id);
                    table.ForeignKey(
                        name: "FK_fee_structure_academic_session_academic_session_id",
                        column: x => x.academic_session_id,
                        principalTable: "academic_session",
                        principalColumn: "academic_session_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_fee_structure_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "fee_structure_addon",
                columns: table => new
                {
                    fee_structure_addon_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fee_structure_id = table.Column<int>(type: "int", nullable: false),
                    fee_addon_id = table.Column<int>(type: "int", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fee_structure_addon", x => x.fee_structure_addon_id);
                    table.ForeignKey(
                        name: "FK_fee_structure_addon_fee_addon_fee_addon_id",
                        column: x => x.fee_addon_id,
                        principalTable: "fee_addon",
                        principalColumn: "fee_addon_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_fee_structure_addon_fee_structure_fee_structure_id",
                        column: x => x.fee_structure_id,
                        principalTable: "fee_structure",
                        principalColumn: "fee_structure_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_fee_structure_academic_session_id",
                table: "fee_structure",
                column: "academic_session_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_structure_class_id",
                table: "fee_structure",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_structure_addon_fee_addon_id",
                table: "fee_structure_addon",
                column: "fee_addon_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_structure_addon_fee_structure_id",
                table: "fee_structure_addon",
                column: "fee_structure_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "fee_structure_addon");

            migrationBuilder.DropTable(
                name: "fee_structure");
        }
    }
}
