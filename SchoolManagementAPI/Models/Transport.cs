using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("transport")]
public class Transport
{
    [Key]
    [Column("transport_id")]
    public int TransportId { get; set; }

    [Required]
    [Column("route_name")]
    public string RouteName { get; set; } = string.Empty;

    [Column("number_of_vehicle")]
    public int? NumberOfVehicle { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("route_fare")]
    public decimal? RouteFare { get; set; }
}

