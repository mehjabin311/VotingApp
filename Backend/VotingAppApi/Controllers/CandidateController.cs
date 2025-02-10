using Microsoft.AspNetCore.Authorization; using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VotingAppApi.Data;
using VotingAppApi.Models;

namespace VotingAppApi.Controllers
{
    [Route("/[controller]")]
    [ApiController]
    [EnableCors("AllowAll")]

    public class CandidateController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CandidateController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getCandidateList")]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidates()
        {
            return await _context.Candidates.ToListAsync();
        }

        //[HttpPost("addCandidate")]
        //[Authorize(Roles = "admin")]
        //public async Task<ActionResult<Candidate>> AddCandidate([FromBody] Candidate candidate)
        //{
        //    _context.Candidates.Add(candidate);
        //    await _context.SaveChangesAsync();

        //    return StatusCode(201, candidate);
        //}

        [HttpPatch("update-vote/{id}")]
        public async Task<IActionResult> UpdateVotes([FromRoute] int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);

            if (candidate == null)
                return NotFound();

            candidate.Votes++;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Votes updated successfully." });
        }

        [HttpGet("top-three")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetTopThreeCandidates()
        {
            // Fetch top 3 candidates based on the highest number of votes
            var topCandidates = await _context.Candidates
                .OrderByDescending(c => c.Votes)   // Sort candidates by votes in descending order
                .Take(3)                           // Take the top 3 candidates
                .ToListAsync();

            // Return the result as a JSON response
            return Ok(topCandidates);
        }

        //[HttpDelete("deleteCandidate/{id}")]
        //[Authorize(Roles = "admin")]
        //public async Task<IActionResult> DeleteCandidate([FromRoute] int id)
        //{
        //    var candidate = await _context.Candidates.FindAsync(id);
        //    if (candidate == null)
        //        return NotFound(new { message = "Candidate not found." });

        //    _context.Candidates.Remove(candidate);
        //    await _context.SaveChangesAsync();

        //    return Ok(new { message = "Candidate deleted successfully." });
        //}

        [HttpPost("addCandidate")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Candidate>> AddCandidate([FromBody] Candidate candidate)
        {
            try
            {
                Console.WriteLine($"Adding candidate: {candidate.Name}, Party: {candidate.Party}");
                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();
                return StatusCode(201, candidate);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding candidate: {ex.Message}");
                return StatusCode(500, new { message = "Internal Server Error" });
            }
        }

        [HttpDelete("deleteCandidate/{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCandidate([FromRoute] int id)
        {
            try
            {
                Console.WriteLine($"Deleting candidate with ID: {id}");
                var candidate = await _context.Candidates.FindAsync(id);
                if (candidate == null)
                    return NotFound(new { message = "Candidate not found." });

                _context.Candidates.Remove(candidate);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Candidate deleted successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting candidate: {ex.Message}");
                return StatusCode(500, new { message = "Internal Server Error" });
            }
        }

    }
}
