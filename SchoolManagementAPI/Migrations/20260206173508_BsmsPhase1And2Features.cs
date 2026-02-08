using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class BsmsPhase1And2Features : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "discount_amount",
                table: "invoice",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "due_date",
                table: "invoice",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "fee_type_id",
                table: "invoice",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "final_amount",
                table: "invoice",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "fine_amount",
                table: "invoice",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "fee_type",
                columns: table => new
                {
                    fee_type_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_recurring = table.Column<bool>(type: "bit", nullable: false),
                    default_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    created_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    modified_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fee_type", x => x.fee_type_id);
                });

            migrationBuilder.CreateTable(
                name: "grading_scale",
                columns: table => new
                {
                    scale_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    class_id = table.Column<int>(type: "int", nullable: false),
                    min_marks = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    max_marks = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    grade = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    grade_point = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    modified_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_grading_scale", x => x.scale_id);
                    table.ForeignKey(
                        name: "FK_grading_scale_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_result",
                columns: table => new
                {
                    result_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    exam_id = table.Column<int>(type: "int", nullable: false),
                    total_marks = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    obtained_marks = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    gpa = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    grade = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    position = table.Column<int>(type: "int", nullable: false),
                    is_passed = table.Column<bool>(type: "bit", nullable: false),
                    remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    calculated_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student_result", x => x.result_id);
                    table.ForeignKey(
                        name: "FK_student_result_exam_exam_id",
                        column: x => x.exam_id,
                        principalTable: "exam",
                        principalColumn: "exam_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_student_result_users_student_id",
                        column: x => x.student_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "discount_rule",
                columns: table => new
                {
                    rule_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    discount_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    calculation_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    conditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fee_type_id = table.Column<int>(type: "int", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    modified_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_discount_rule", x => x.rule_id);
                    table.ForeignKey(
                        name: "FK_discount_rule_fee_type_fee_type_id",
                        column: x => x.fee_type_id,
                        principalTable: "fee_type",
                        principalColumn: "fee_type_id");
                });

            migrationBuilder.CreateTable(
                name: "fee_schedule",
                columns: table => new
                {
                    schedule_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    class_id = table.Column<int>(type: "int", nullable: false),
                    section_id = table.Column<int>(type: "int", nullable: true),
                    fee_type_id = table.Column<int>(type: "int", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    due_day = table.Column<int>(type: "int", nullable: false),
                    recurrence_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    modified_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fee_schedule", x => x.schedule_id);
                    table.ForeignKey(
                        name: "FK_fee_schedule_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_fee_schedule_fee_type_fee_type_id",
                        column: x => x.fee_type_id,
                        principalTable: "fee_type",
                        principalColumn: "fee_type_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_fee_schedule_section_section_id",
                        column: x => x.section_id,
                        principalTable: "section",
                        principalColumn: "section_id");
                });

            migrationBuilder.CreateTable(
                name: "fine_rule",
                columns: table => new
                {
                    rule_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fee_type_id = table.Column<int>(type: "int", nullable: true),
                    days_after_due = table.Column<int>(type: "int", nullable: false),
                    fine_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fine_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    modified_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fine_rule", x => x.rule_id);
                    table.ForeignKey(
                        name: "FK_fine_rule_fee_type_fee_type_id",
                        column: x => x.fee_type_id,
                        principalTable: "fee_type",
                        principalColumn: "fee_type_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_invoice_fee_type_id",
                table: "invoice",
                column: "fee_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_discount_rule_fee_type_id",
                table: "discount_rule",
                column: "fee_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_schedule_class_id",
                table: "fee_schedule",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_schedule_fee_type_id",
                table: "fee_schedule",
                column: "fee_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_fee_schedule_section_id",
                table: "fee_schedule",
                column: "section_id");

            migrationBuilder.CreateIndex(
                name: "IX_fine_rule_fee_type_id",
                table: "fine_rule",
                column: "fee_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_grading_scale_class_id",
                table: "grading_scale",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_result_exam_id",
                table: "student_result",
                column: "exam_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_result_student_id",
                table: "student_result",
                column: "student_id");

            migrationBuilder.AddForeignKey(
                name: "FK_invoice_fee_type_fee_type_id",
                table: "invoice",
                column: "fee_type_id",
                principalTable: "fee_type",
                principalColumn: "fee_type_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_invoice_fee_type_fee_type_id",
                table: "invoice");

            migrationBuilder.DropTable(
                name: "discount_rule");

            migrationBuilder.DropTable(
                name: "fee_schedule");

            migrationBuilder.DropTable(
                name: "fine_rule");

            migrationBuilder.DropTable(
                name: "grading_scale");

            migrationBuilder.DropTable(
                name: "student_result");

            migrationBuilder.DropTable(
                name: "fee_type");

            migrationBuilder.DropIndex(
                name: "IX_invoice_fee_type_id",
                table: "invoice");

            migrationBuilder.DropColumn(
                name: "discount_amount",
                table: "invoice");

            migrationBuilder.DropColumn(
                name: "due_date",
                table: "invoice");

            migrationBuilder.DropColumn(
                name: "fee_type_id",
                table: "invoice");

            migrationBuilder.DropColumn(
                name: "final_amount",
                table: "invoice");

            migrationBuilder.DropColumn(
                name: "fine_amount",
                table: "invoice");
        }
    }
}
