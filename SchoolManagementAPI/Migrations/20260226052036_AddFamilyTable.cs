using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "family",
                columns: table => new
                {
                    family_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    father_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    father_phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    father_cnic = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    mother_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    mother_phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    mother_cnic = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sms_number = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_family", x => x.family_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "family");
        }
    }
}
