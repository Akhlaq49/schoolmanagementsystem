using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class ClassCascadeDeleteForSubjectSection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_section_class_class_id",
                table: "section");

            migrationBuilder.DropForeignKey(
                name: "FK_subject_class_class_id",
                table: "subject");

            migrationBuilder.AddForeignKey(
                name: "FK_section_class_class_id",
                table: "section",
                column: "class_id",
                principalTable: "class",
                principalColumn: "class_id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_section_class_class_id",
                table: "section");

            migrationBuilder.DropForeignKey(
                name: "FK_subject_class_class_id",
                table: "subject");

            migrationBuilder.AddForeignKey(
                name: "FK_section_class_class_id",
                table: "section",
                column: "class_id",
                principalTable: "class",
                principalColumn: "class_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_subject_class_class_id",
                table: "subject",
                column: "class_id",
                principalTable: "class",
                principalColumn: "class_id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
