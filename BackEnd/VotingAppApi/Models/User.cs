using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace VotingAppApi.Models
{
    public class User
    {
        [Key] // Marks this property as the primary key
        public int Id { get; set; }

        [Required] // Makes this property required (NOT NULL in DB)
        [StringLength(50)] // Limits the length of the string (VARCHAR(50) in DB)
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress] // Ensures the property contains a valid email address
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(255)] // You can change the max length to meet your needs
        public string Password { get; set; }

        [Required]
        public DateTime Dob { get; set; }

        [Required]
        public int Status { get; set; } // 0 = not voted, 1 = voted

        [Required]
        [StringLength(20)]
        public string Role { get; set; } // role could be "admin", "voter", etc.
    }

}
