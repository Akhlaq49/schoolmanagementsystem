using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("department")]
public class Department
{
    [Key]
    [Column("department_id")]
    public int DepartmentId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;
}

