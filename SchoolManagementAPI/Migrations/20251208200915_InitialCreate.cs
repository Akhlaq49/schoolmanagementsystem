using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "academic_syllabus",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    academic_syllabus_code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    file_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_academic_syllabus", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "admin",
                columns: table => new
                {
                    admin_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    login_status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin", x => x.admin_id);
                });

            migrationBuilder.CreateTable(
                name: "circular",
                columns: table => new
                {
                    circular_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    reference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_circular", x => x.circular_id);
                });

            migrationBuilder.CreateTable(
                name: "class",
                columns: table => new
                {
                    class_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    name_numeric = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_class", x => x.class_id);
                });

            migrationBuilder.CreateTable(
                name: "club",
                columns: table => new
                {
                    club_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    club_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    desc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_club", x => x.club_id);
                });

            migrationBuilder.CreateTable(
                name: "department",
                columns: table => new
                {
                    department_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_department", x => x.department_id);
                });

            migrationBuilder.CreateTable(
                name: "dormitory",
                columns: table => new
                {
                    dormitory_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    number_of_room = table.Column<int>(type: "int", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dormitory", x => x.dormitory_id);
                });

            migrationBuilder.CreateTable(
                name: "exam",
                columns: table => new
                {
                    exam_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    comment = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_exam", x => x.exam_id);
                });

            migrationBuilder.CreateTable(
                name: "exam_question",
                columns: table => new
                {
                    exam_question_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_id = table.Column<int>(type: "int", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: false),
                    question = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    file_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    file_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_exam_question", x => x.exam_question_id);
                });

            migrationBuilder.CreateTable(
                name: "expense_category",
                columns: table => new
                {
                    expense_category_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_expense_category", x => x.expense_category_id);
                });

            migrationBuilder.CreateTable(
                name: "noticeboard",
                columns: table => new
                {
                    notice_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    notice_title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    notice = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    create_timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_noticeboard", x => x.notice_id);
                });

            migrationBuilder.CreateTable(
                name: "parent",
                columns: table => new
                {
                    parent_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    profession = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    login_status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_parent", x => x.parent_id);
                });

            migrationBuilder.CreateTable(
                name: "settings",
                columns: table => new
                {
                    settings_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_settings", x => x.settings_id);
                });

            migrationBuilder.CreateTable(
                name: "transport",
                columns: table => new
                {
                    transport_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    route_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    number_of_vehicle = table.Column<int>(type: "int", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    route_fare = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transport", x => x.transport_id);
                });

            migrationBuilder.CreateTable(
                name: "section",
                columns: table => new
                {
                    section_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_section", x => x.section_id);
                    table.ForeignKey(
                        name: "FK_section_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "subject",
                columns: table => new
                {
                    subject_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    teacher_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subject", x => x.subject_id);
                    table.ForeignKey(
                        name: "FK_subject_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "teacher",
                columns: table => new
                {
                    teacher_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    department_id = table.Column<int>(type: "int", nullable: true),
                    designation_id = table.Column<int>(type: "int", nullable: true),
                    login_status = table.Column<string>(type: "nvarchar(max)", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "student",
                columns: table => new
                {
                    student_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    birthday = table.Column<DateTime>(type: "datetime2", nullable: true),
                    age = table.Column<int>(type: "int", nullable: true),
                    sex = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    section_id = table.Column<int>(type: "int", nullable: true),
                    parent_id = table.Column<int>(type: "int", nullable: true),
                    roll = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    session = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    login_status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student", x => x.student_id);
                    table.ForeignKey(
                        name: "FK_student_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_student_parent_parent_id",
                        column: x => x.parent_id,
                        principalTable: "parent",
                        principalColumn: "parent_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_student_section_section_id",
                        column: x => x.section_id,
                        principalTable: "section",
                        principalColumn: "section_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "assignment",
                columns: table => new
                {
                    assignment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: false),
                    class_id = table.Column<int>(type: "int", nullable: false),
                    teacher_id = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    file_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    file_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assignment", x => x.assignment_id);
                    table.ForeignKey(
                        name: "FK_assignment_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_assignment_subject_subject_id",
                        column: x => x.subject_id,
                        principalTable: "subject",
                        principalColumn: "subject_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "study_material",
                columns: table => new
                {
                    study_material_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    class_id = table.Column<int>(type: "int", nullable: true),
                    subject_id = table.Column<int>(type: "int", nullable: true),
                    file_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    file_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_study_material", x => x.study_material_id);
                    table.ForeignKey(
                        name: "FK_study_material_class_class_id",
                        column: x => x.class_id,
                        principalTable: "class",
                        principalColumn: "class_id");
                    table.ForeignKey(
                        name: "FK_study_material_subject_subject_id",
                        column: x => x.subject_id,
                        principalTable: "subject",
                        principalColumn: "subject_id");
                });

            migrationBuilder.CreateTable(
                name: "attendance",
                columns: table => new
                {
                    attendance_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    status = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    session = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_attendance", x => x.attendance_id);
                    table.ForeignKey(
                        name: "FK_attendance_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "invoice",
                columns: table => new
                {
                    invoice_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    amount_paid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    due = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    creation_timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoice", x => x.invoice_id);
                    table.ForeignKey(
                        name: "FK_invoice_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mark",
                columns: table => new
                {
                    mark_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    exam_id = table.Column<int>(type: "int", nullable: false),
                    subject_id = table.Column<int>(type: "int", nullable: false),
                    class_score1 = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    class_score2 = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    class_score3 = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    exam_score = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    comment = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mark", x => x.mark_id);
                    table.ForeignKey(
                        name: "FK_mark_exam_exam_id",
                        column: x => x.exam_id,
                        principalTable: "exam",
                        principalColumn: "exam_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_mark_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_mark_subject_subject_id",
                        column: x => x.subject_id,
                        principalTable: "subject",
                        principalColumn: "subject_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payment",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    invoice_id = table.Column<int>(type: "int", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    transaction_id = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    payment_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    expense_category_id = table.Column<int>(type: "int", nullable: true),
                    method = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    year = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    student_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment", x => x.payment_id);
                    table.ForeignKey(
                        name: "FK_payment_invoice_invoice_id",
                        column: x => x.invoice_id,
                        principalTable: "invoice",
                        principalColumn: "invoice_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_assignment_class_id",
                table: "assignment",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_assignment_subject_id",
                table: "assignment",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_attendance_student_id",
                table: "attendance",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoice_student_id",
                table: "invoice",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_mark_exam_id",
                table: "mark",
                column: "exam_id");

            migrationBuilder.CreateIndex(
                name: "IX_mark_student_id",
                table: "mark",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_mark_subject_id",
                table: "mark",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_invoice_id",
                table: "payment",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_section_class_id",
                table: "section",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_class_id",
                table: "student",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_parent_id",
                table: "student",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_section_id",
                table: "student",
                column: "section_id");

            migrationBuilder.CreateIndex(
                name: "IX_study_material_class_id",
                table: "study_material",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_study_material_subject_id",
                table: "study_material",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_subject_class_id",
                table: "subject",
                column: "class_id");

            migrationBuilder.CreateIndex(
                name: "IX_teacher_department_id",
                table: "teacher",
                column: "department_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "academic_syllabus");

            migrationBuilder.DropTable(
                name: "admin");

            migrationBuilder.DropTable(
                name: "assignment");

            migrationBuilder.DropTable(
                name: "attendance");

            migrationBuilder.DropTable(
                name: "circular");

            migrationBuilder.DropTable(
                name: "club");

            migrationBuilder.DropTable(
                name: "dormitory");

            migrationBuilder.DropTable(
                name: "exam_question");

            migrationBuilder.DropTable(
                name: "expense_category");

            migrationBuilder.DropTable(
                name: "mark");

            migrationBuilder.DropTable(
                name: "noticeboard");

            migrationBuilder.DropTable(
                name: "payment");

            migrationBuilder.DropTable(
                name: "settings");

            migrationBuilder.DropTable(
                name: "study_material");

            migrationBuilder.DropTable(
                name: "teacher");

            migrationBuilder.DropTable(
                name: "transport");

            migrationBuilder.DropTable(
                name: "exam");

            migrationBuilder.DropTable(
                name: "invoice");

            migrationBuilder.DropTable(
                name: "subject");

            migrationBuilder.DropTable(
                name: "department");

            migrationBuilder.DropTable(
                name: "student");

            migrationBuilder.DropTable(
                name: "parent");

            migrationBuilder.DropTable(
                name: "section");

            migrationBuilder.DropTable(
                name: "class");
        }
    }
}
