using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionBankTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Use raw SQL to create table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[question_bank]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [dbo].[question_bank] (
                        [question_bank_id] INT IDENTITY(1,1) NOT NULL,
                        [subject_id] INT NOT NULL,
                        [class_id] INT NOT NULL,
                        [chapter_name] NVARCHAR(200) NOT NULL,
                        [question_text] NVARCHAR(MAX) NOT NULL,
                        [question_type] NVARCHAR(50) NOT NULL,
                        [option_a] NVARCHAR(MAX) NULL,
                        [option_b] NVARCHAR(MAX) NULL,
                        [option_c] NVARCHAR(MAX) NULL,
                        [option_d] NVARCHAR(MAX) NULL,
                        [correct_answer] NVARCHAR(10) NULL,
                        [explanation] NVARCHAR(MAX) NULL,
                        [marks] DECIMAL(18,2) NOT NULL,
                        [difficulty_level] NVARCHAR(20) NOT NULL,
                        [teacher_id] INT NOT NULL,
                        [created_at] DATETIME2 NOT NULL,
                        [updated_at] DATETIME2 NULL,
                        CONSTRAINT [PK_question_bank] PRIMARY KEY ([question_bank_id]),
                        CONSTRAINT [FK_question_bank_class_class_id] FOREIGN KEY ([class_id]) REFERENCES [dbo].[class] ([class_id]) ON DELETE NO ACTION,
                        CONSTRAINT [FK_question_bank_subject_subject_id] FOREIGN KEY ([subject_id]) REFERENCES [dbo].[subject] ([subject_id]) ON DELETE NO ACTION,
                        CONSTRAINT [FK_question_bank_users_teacher_id] FOREIGN KEY ([teacher_id]) REFERENCES [dbo].[users] ([user_id]) ON DELETE NO ACTION
                    );

                    CREATE INDEX [IX_question_bank_class_id] ON [dbo].[question_bank] ([class_id]);
                    CREATE INDEX [IX_question_bank_subject_id] ON [dbo].[question_bank] ([subject_id]);
                    CREATE INDEX [IX_question_bank_teacher_id] ON [dbo].[question_bank] ([teacher_id]);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "question_bank");
        }
    }
}
