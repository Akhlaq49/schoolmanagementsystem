using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeStudentGuardianAndAdmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "admission_date",
                table: "users");

            migrationBuilder.DropColumn(
                name: "father_guardian_cnic",
                table: "users");

            migrationBuilder.DropColumn(
                name: "father_name",
                table: "users");

            migrationBuilder.DropColumn(
                name: "father_occupation",
                table: "users");

            migrationBuilder.DropColumn(
                name: "fee",
                table: "users");

            migrationBuilder.DropColumn(
                name: "fee_discount",
                table: "users");

            migrationBuilder.DropColumn(
                name: "fee_type",
                table: "users");

            migrationBuilder.DropColumn(
                name: "guardian_name",
                table: "users");

            migrationBuilder.DropColumn(
                name: "mother_cnic",
                table: "users");

            migrationBuilder.DropColumn(
                name: "mother_name",
                table: "users");

            migrationBuilder.DropColumn(
                name: "mother_phone",
                table: "users");

            migrationBuilder.DropColumn(
                name: "sms_number",
                table: "users");

            migrationBuilder.DropColumn(
                name: "transport_charges",
                table: "users");

            migrationBuilder.AddColumn<string>(
                name: "father_occupation",
                table: "family",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guardian_name",
                table: "family",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "student_admission",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    admission_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    fee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    fee_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fee_discount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    transport_charges = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_admission", x => x.id);
                    table.ForeignKey(
                        name: "FK_student_admission_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_student_admission_user_id",
                table: "student_admission",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "student_admission");

            migrationBuilder.DropColumn(
                name: "father_occupation",
                table: "family");

            migrationBuilder.DropColumn(
                name: "guardian_name",
                table: "family");

            migrationBuilder.AddColumn<DateTime>(
                name: "admission_date",
                table: "users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "father_guardian_cnic",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "father_name",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "father_occupation",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "fee",
                table: "users",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "fee_discount",
                table: "users",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "fee_type",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guardian_name",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "mother_cnic",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "mother_name",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "mother_phone",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "sms_number",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "transport_charges",
                table: "users",
                type: "decimal(18,2)",
                nullable: true);
        }
    }
}
