using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VotingAppApi.Data;
using VotingAppApi.Models;

namespace VotingAppApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class CandidateController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CandidateController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidates()
        {
            return await _context.Candidates.ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Candidate>> AddCandidate(Candidate candidate)
        {
            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(AddCandidate), new { id = candidate.Id }, candidate);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateVotes(int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);

            if (candidate == null)
                return NotFound();

            candidate.Votes++;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("top-three")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetTopTwoCandidates()
        {
            // Fetch top 2 candidates based on the highest number of votes
            var topCandidates = await _context.Candidates
                .OrderByDescending(c => c.Votes)   // Sort candidates by votes in descending order
                .Take(3)                           // Take the top 3 candidates
                .ToListAsync();

            // Return the result as a JSON response
            return Ok(topCandidates);
        }
    }
}
