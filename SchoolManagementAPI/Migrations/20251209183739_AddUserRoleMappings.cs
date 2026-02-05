using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleMappings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_student_class_class_id",
                table: "student");

            migrationBuilder.DropForeignKey(
                name: "FK_student_parent_parent_id",
                table: "student");

            migrationBuilder.DropForeignKey(
                name: "FK_student_section_section_id",
                table: "student");

            migrationBuilder.DropTable(
                name: "admin");

            migrationBuilder.DropTable(
                name: "teacher");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    login_status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    level = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    department_id = table.Column<int>(type: "int", nullable: true),
                    designation_id = table.Column<int>(type: "int", nullable: true),
                    birthday = table.Column<DateTime>(type: "datetime2", nullable: true),
                    age = table.Column<int>(type: "int", nullable: true),
                    sex = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    section_id = table.Column<int>(type: "int", nullable: true),
                    parent_id = table.Column<int>(type: "int", nullable: true),
                    roll = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    session = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    profession = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_users_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_users_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "department_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_users_section_section_id",
                        column: x => x.section_id,
                        principalTable: "section",
                        principalColumn: "section_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_users_users_parent_id",
                        column: x => x.parent_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_role_mappings",
                columns: table => new
                {
                    user_role_mapping_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    role = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_role_mappings", x => x.user_role_mapping_id);
                    table.ForeignKey(
                        name: "FK_user_role_mappings_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_user_role_mappings_user_id_role",
                table: "user_role_mappings",
                columns: new[] { "user_id", "role" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_class_id",
                table: "users",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_department_id",
                table: "users",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_parent_id",
                table: "users",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_section_id",
                table: "users",
                column: "section_id");

            migrationBuilder.AddForeignKey(
                name: "FK_student_class_class_id",
                table: "student",
                column: "class_id",
                principalTable: "class",
                principalColumn: "class_id");

            migrationBuilder.AddForeignKey(
                name: "FK_student_parent_parent_id",
                table: "student",
                column: "parent_id",
                principalTable: "parent",
                principalColumn: "parent_id");

            migrationBuilder.AddForeignKey(
                name: "FK_student_section_section_id",
                table: "student",
                column: "section_id",
                principalTable: "section",
                principalColumn: "section_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_student_class_class_id",
                table: "student");

            migrationBuilder.DropForeignKey(
                name: "FK_student_parent_parent_id",
                table: "student");

            migrationBuilder.DropForeignKey(
                name: "FK_student_section_section_id",
                table: "student");

            migrationBuilder.DropTable(
                name: "user_role_mappings");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.CreateTable(
                name: "admin",
                columns: table => new
                {
                    admin_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    login_status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    phone = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin", x => x.admin_id);
                });

            migrationBuilder.CreateTable(
                name: "teacher",
                columns: table => new
                {
                    teacher_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    department_id = table.Column<int>(type: "int", nullable: true),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    designation_id = table.Column<int>(type: "int", nullable: true),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    login_status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    phone = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_teacher", x => x.teacher_id);
                    table.ForeignKey(
                        name: "FK_teacher_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "department_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_teacher_department_id",
                table: "teacher",
                column: "department_id");

            migrationBuilder.AddForeignKey(
                name: "FK_student_class_class_id",
                table: "student",
                column: "class_id",
                principalTable: "class",
                principalColumn: "class_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_student_parent_parent_id",
                table: "student",
                column: "parent_id",
                principalTable: "parent",
                principalColumn: "parent_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_student_section_section_id",
                table: "student",
                column: "section_id",
                principalTable: "section",
                principalColumn: "section_id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
