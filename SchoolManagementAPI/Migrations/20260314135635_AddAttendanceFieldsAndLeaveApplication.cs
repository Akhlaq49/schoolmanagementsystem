using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceFieldsAndLeaveApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Attendance fields and LeaveApplication only - users table changes already in RemoveUserProfileColumns
            migrationBuilder.AddColumn<string>(
                name: "leave_reason",
                table: "attendance",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "marked_at",
                table: "attendance",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "marked_by",
                table: "attendance",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "remarks",
                table: "attendance",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "time_in",
                table: "attendance",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "time_out",
                table: "attendance",
                type: "time",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "leave_application",
                columns: table => new
                {
                    leave_application_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    applicant_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    applicant_id = table.Column<int>(type: "int", nullable: false),
                    leave_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    leave_from = table.Column<DateTime>(type: "datetime2", nullable: false),
                    leave_to = table.Column<DateTime>(type: "datetime2", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    reviewer_id = table.Column<int>(type: "int", nullable: true),
                    reviewer_remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    attachment_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_leave_application", x => x.leave_application_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "leave_application");

            migrationBuilder.DropColumn(
                name: "leave_reason",
                table: "attendance");

            migrationBuilder.DropColumn(
                name: "marked_at",
                table: "attendance");

            migrationBuilder.DropColumn(
                name: "marked_by",
                table: "attendance");

            migrationBuilder.DropColumn(
                name: "remarks",
                table: "attendance");

            migrationBuilder.DropColumn(
                name: "time_in",
                table: "attendance");

            migrationBuilder.DropColumn(
                name: "time_out",
                table: "attendance");
        }
    }
}
