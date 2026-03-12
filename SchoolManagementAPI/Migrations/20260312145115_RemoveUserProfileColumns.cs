using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUserProfileColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Drop foreign keys from users to other tables
            migrationBuilder.DropForeignKey(
                 name: "FK_users_class_class_id",
                 table: "users");
            migrationBuilder.DropForeignKey(
                name: "FK_users_section_section_id",
                table: "users");
            migrationBuilder.DropForeignKey(
                name: "FK_users_users_parent_id",
                table: "users");
            migrationBuilder.DropForeignKey(
                name: "FK_users_family_family_id",
                table: "users");
            migrationBuilder.DropForeignKey(
                name: "FK_users_department_department_id",
                table: "users");
            // FK_users_designation_designation_id was never created - designation_id has no FK
            // 2) Drop indexes on those FK columns (if they exist)
            migrationBuilder.DropIndex(
                name: "IX_users_class_id",
                table: "users");
            migrationBuilder.DropIndex(
                name: "IX_users_section_id",
                table: "users");
            migrationBuilder.DropIndex(
                name: "IX_users_parent_id",
                table: "users");
            migrationBuilder.DropIndex(
                name: "IX_users_family_id",
                table: "users");
            migrationBuilder.DropIndex(
                name: "IX_users_department_id",
                table: "users");
            // IX_users_designation_id was never created
            // 3) Drop the columns on users
            migrationBuilder.DropColumn(
                name: "department_id",
                table: "users");
            migrationBuilder.DropColumn(
                name: "designation_id",
                table: "users");
            migrationBuilder.DropColumn(
                name: "birthday",
                table: "users");
            migrationBuilder.DropColumn(
                name: "age",
                table: "users");
            migrationBuilder.DropColumn(
                name: "sex",
                table: "users");
            migrationBuilder.DropColumn(
                name: "class_id",
                table: "users");
            migrationBuilder.DropColumn(
                name: "section_id",
                table: "users");
            migrationBuilder.DropColumn(
                name: "parent_id",
                table: "users");
            migrationBuilder.DropColumn(
                name: "roll",
                table: "users");
            migrationBuilder.DropColumn(
                name: "session",
                table: "users");
            migrationBuilder.DropColumn(
                name: "profession",
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
                name: "religion",
                table: "users");
            migrationBuilder.DropColumn(
                name: "school_reg_num",
                table: "users");
            migrationBuilder.DropColumn(
                name: "status",
                table: "users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1) Re-add columns
            migrationBuilder.AddColumn<int>(
                name: "department_id",
                table: "users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "designation_id",
                table: "users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "birthday",
                table: "users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "age",
                table: "users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "sex",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "class_id",
                table: "users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "section_id",
                table: "users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "parent_id",
                table: "users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "roll",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "session",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "profession",
                table: "users",
                type: "nvarchar(max)",
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
                name: "status",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            // 2) Recreate indexes if needed
            migrationBuilder.CreateIndex(
                name: "IX_users_class_id",
                table: "users",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_section_id",
                table: "users",
                column: "section_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_parent_id",
                table: "users",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_family_id",
                table: "users",
                column: "family_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_department_id",
                table: "users",
                column: "department_id");

            // IX_users_designation_id never existed - skip

            // 3) Recreate foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_users_class_class_id",
                table: "users",
                column: "class_id",
                principalTable: "class",
                principalColumn: "class_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_users_section_section_id",
                table: "users",
                column: "section_id",
                principalTable: "section",
                principalColumn: "section_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_users_users_parent_id",
                table: "users",
                column: "parent_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_users_family_family_id",
                table: "users",
                column: "family_id",
                principalTable: "family",
                principalColumn: "family_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_users_department_department_id",
                table: "users",
                column: "department_id",
                principalTable: "department",
                principalColumn: "department_id",
                onDelete: ReferentialAction.Restrict);

            // FK_users_designation_designation_id never existed - designation_id has no FK
        }
    }
}
