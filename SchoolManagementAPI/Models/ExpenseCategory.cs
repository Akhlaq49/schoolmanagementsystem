using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("expense_category")]
public class ExpenseCategory
{
    [Key]
    [Column("expense_category_id")]
    public int ExpenseCategoryId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;
}

