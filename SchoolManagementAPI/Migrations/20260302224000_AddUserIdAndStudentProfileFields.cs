using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdAndStudentProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "user_id",
                table: "student",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "school_reg_num",
                table: "student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "b_form_cnic",
                table: "student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "religion",
                table: "student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "blood_group",
                table: "student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "family_id",
                table: "student",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_student_user_id",
                table: "student",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_student_family_id",
                table: "student",
                column: "family_id");

            migrationBuilder.AddForeignKey(
                name: "FK_student_users_user_id",
                table: "student",
                column: "user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_student_family_family_id",
                table: "student",
                column: "family_id",
                principalTable: "family",
                principalColumn: "family_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.Sql(@"
                INSERT INTO student (user_id, name, birthday, age, sex, email, phone, address, password, class_id, section_id, parent_id, roll, session, login_status, status, school_reg_num, b_form_cnic, religion, blood_group, family_id)
                SELECT u.user_id, u.name, u.birthday, u.age, u.sex, u.email, u.phone, u.address, u.password, u.class_id, u.section_id,
                    CASE WHEN p.parent_id IS NOT NULL THEN u.parent_id ELSE NULL END,
                    u.roll, u.session, u.login_status, ISNULL(u.status, 'Active'), u.school_reg_num, u.b_form_cnic, u.religion, u.blood_group, u.family_id
                FROM users u
                INNER JOIN user_role_mappings urm ON u.user_id = urm.user_id AND urm.role = 3
                LEFT JOIN parent p ON u.parent_id = p.parent_id
                WHERE NOT EXISTS (SELECT 1 FROM student s WHERE s.user_id = u.user_id)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_student_users_user_id",
                table: "student");

            migrationBuilder.DropForeignKey(
                name: "FK_student_family_family_id",
                table: "student");

            migrationBuilder.DropIndex(
                name: "IX_student_user_id",
                table: "student");

            migrationBuilder.DropIndex(
                name: "IX_student_family_id",
                table: "student");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "student");

            migrationBuilder.DropColumn(
                name: "status",
                table: "student");

            migrationBuilder.DropColumn(
                name: "school_reg_num",
                table: "student");

            migrationBuilder.DropColumn(
                name: "b_form_cnic",
                table: "student");

            migrationBuilder.DropColumn(
                name: "religion",
                table: "student");

            migrationBuilder.DropColumn(
                name: "blood_group",
                table: "student");

            migrationBuilder.DropColumn(
                name: "family_id",
                table: "student");
        }
    }
}
