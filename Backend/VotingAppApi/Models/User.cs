using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace VotingAppApi.Models
{
    public class User
    {
        [Key] 
        public int Id { get; set; }

        [Required] 
        [StringLength(50)] 
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress] 
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(255)] 
        public string Password { get; set; }

        [Required]
        public DateTime Dob { get; set; }

        [Required]
        public int Status { get; set; } 

        [Required]
        [StringLength(20)]
        public string Role { get; set; } 
    }

}
