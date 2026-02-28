using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicSessionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_subject_class_class_id",
                table: "subject");

            migrationBuilder.CreateTable(
                name: "academic_session",
                columns: table => new
                {
                    academic_session_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_current = table.Column<bool>(type: "bit", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_academic_session", x => x.academic_session_id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_subject_class_class_id",
                table: "subject",
                column: "class_id",
                principalTable: "class",
                principalColumn: "class_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_subject_class_class_id",
                table: "subject");

            migrationBuilder.DropTable(
                name: "academic_session");

            migrationBuilder.AddForeignKey(
                name: "FK_subject_class_class_id",
                table: "subject",
                column: "class_id",
                principalTable: "class",
                principalColumn: "class_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
