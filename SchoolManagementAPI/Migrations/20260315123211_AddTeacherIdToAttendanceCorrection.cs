using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherIdToAttendanceCorrection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_attendance_correction_student_student_id",
                table: "attendance_correction");

            migrationBuilder.AlterColumn<int>(
                name: "student_id",
                table: "attendance_correction",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "teacher_id",
                table: "attendance_correction",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_attendance_correction_teacher_id",
                table: "attendance_correction",
                column: "teacher_id");

            migrationBuilder.AddForeignKey(
                name: "FK_attendance_correction_student_student_id",
                table: "attendance_correction",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id");

            migrationBuilder.AddForeignKey(
                name: "FK_attendance_correction_users_teacher_id",
                table: "attendance_correction",
                column: "teacher_id",
                principalTable: "users",
                principalColumn: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_attendance_correction_student_student_id",
                table: "attendance_correction");

            migrationBuilder.DropForeignKey(
                name: "FK_attendance_correction_users_teacher_id",
                table: "attendance_correction");

            migrationBuilder.DropIndex(
                name: "IX_attendance_correction_teacher_id",
                table: "attendance_correction");

            migrationBuilder.DropColumn(
                name: "teacher_id",
                table: "attendance_correction");

            migrationBuilder.AlterColumn<int>(
                name: "student_id",
                table: "attendance_correction",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_attendance_correction_student_student_id",
                table: "attendance_correction",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
