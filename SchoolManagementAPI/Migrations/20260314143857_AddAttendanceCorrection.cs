using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceCorrection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "attendance_correction",
                columns: table => new
                {
                    attendance_correction_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    attendance_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    requested_status = table.Column<int>(type: "int", nullable: true),
                    requested_time_in = table.Column<TimeSpan>(type: "time", nullable: true),
                    requested_time_out = table.Column<TimeSpan>(type: "time", nullable: true),
                    requested_remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    reviewed_by = table.Column<int>(type: "int", nullable: true),
                    reviewer_remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    requested_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    reviewed_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_attendance_correction", x => x.attendance_correction_id);
                    table.ForeignKey(
                        name: "FK_attendance_correction_attendance_attendance_id",
                        column: x => x.attendance_id,
                        principalTable: "attendance",
                        principalColumn: "attendance_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_attendance_correction_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_attendance_correction_attendance_id",
                table: "attendance_correction",
                column: "attendance_id");

            migrationBuilder.CreateIndex(
                name: "IX_attendance_correction_student_id",
                table: "attendance_correction",
                column: "student_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "attendance_correction");
        }
    }
}
