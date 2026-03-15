using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherIdToAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_attendance_student_student_id",
                table: "attendance");

            migrationBuilder.DropTable(
                name: "teacher_attendance");

            migrationBuilder.AlterColumn<int>(
                name: "student_id",
                table: "attendance",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "teacher_id",
                table: "attendance",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_attendance_teacher_id",
                table: "attendance",
                column: "teacher_id");

            migrationBuilder.AddForeignKey(
                name: "FK_attendance_student_student_id",
                table: "attendance",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id");

            migrationBuilder.AddForeignKey(
                name: "FK_attendance_users_teacher_id",
                table: "attendance",
                column: "teacher_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_attendance_student_student_id",
                table: "attendance");

            migrationBuilder.DropForeignKey(
                name: "FK_attendance_users_teacher_id",
                table: "attendance");

            migrationBuilder.DropIndex(
                name: "IX_attendance_teacher_id",
                table: "attendance");

            migrationBuilder.DropColumn(
                name: "teacher_id",
                table: "attendance");

            migrationBuilder.AlterColumn<int>(
                name: "student_id",
                table: "attendance",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "teacher_attendance",
                columns: table => new
                {
                    teacher_attendance_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    teacher_id = table.Column<int>(type: "int", nullable: false),
                    date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    marked_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    time_in = table.Column<TimeSpan>(type: "time", nullable: true),
                    time_out = table.Column<TimeSpan>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_teacher_attendance", x => x.teacher_attendance_id);
                    table.ForeignKey(
                        name: "FK_teacher_attendance_users_teacher_id",
                        column: x => x.teacher_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_teacher_attendance_teacher_id",
                table: "teacher_attendance",
                column: "teacher_id");

            migrationBuilder.AddForeignKey(
                name: "FK_attendance_student_student_id",
                table: "attendance",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
