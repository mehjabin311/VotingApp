using System.ComponentModel.DataAnnotations;

namespace VotingAppApi.Models
{
    public class Candidate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Party { get; set; }

        [Required]
        public int Votes { get; set; }
    }

}
