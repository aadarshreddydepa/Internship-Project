using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class User
{
    [Key]
    public long UserId { get; set; }
    public string AccountType { get; set; } = null!;

    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }

    public string PasswordHash { get; set; } = null!;

    public ICollection<Business> Businesses { get; set; } = new List<Business>();
}