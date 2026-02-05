using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("noticeboard")]
public class Noticeboard
{
    [Key]
    [Column("notice_id")]
    public int NoticeId { get; set; }

    [Required]
    [Column("notice_title")]
    public string NoticeTitle { get; set; } = string.Empty;

    [Column("notice")]
    public string? Notice { get; set; }

    [Column("create_timestamp")]
    public DateTime CreateTimestamp { get; set; }
}

