using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "admission_date",
                table: "users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "b_form_cnic",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "blood_group",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "family_id",
                table: "users",
                type: "int",
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
                name: "religion",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "school_reg_num",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "sms_number",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "transport_charges",
                table: "users",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "student_previous_institute",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    previous_institute_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    passing_class = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    passing_percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    passing_year = table.Column<int>(type: "int", nullable: true),
                    institute_address = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_previous_institute", x => x.id);
                    table.ForeignKey(
                        name: "FK_student_previous_institute_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_users_family_id",
                table: "users",
                column: "family_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_previous_institute_user_id",
                table: "student_previous_institute",
                column: "user_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_users_family_family_id",
                table: "users",
                column: "family_id",
                principalTable: "family",
                principalColumn: "family_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_family_family_id",
                table: "users");

            migrationBuilder.DropTable(
                name: "student_previous_institute");

            migrationBuilder.DropIndex(
                name: "IX_users_family_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "admission_date",
                table: "users");

            migrationBuilder.DropColumn(
                name: "b_form_cnic",
                table: "users");

            migrationBuilder.DropColumn(
                name: "blood_group",
                table: "users");

            migrationBuilder.DropColumn(
                name: "family_id",
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
                name: "religion",
                table: "users");

            migrationBuilder.DropColumn(
                name: "school_reg_num",
                table: "users");

            migrationBuilder.DropColumn(
                name: "sms_number",
                table: "users");

            migrationBuilder.DropColumn(
                name: "status",
                table: "users");

            migrationBuilder.DropColumn(
                name: "transport_charges",
                table: "users");
        }
    }
}
