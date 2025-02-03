using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VotingAppApi.Data;
using VotingAppApi.Models;

namespace VotingAppApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public UserController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(User user)
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);  // Hash password
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Register), new { id = user.Id }, user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] LoginModel login)
        {
            // Fetch user based on email from database
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == login.Email);

            // Check if user exists and if password matches
            if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
            {
                return Unauthorized(); // Unauthorized if user doesn't exist or password doesn't match
            }

            // Create claims for the JWT
            var claims = new[]
            {
            new Claim(ClaimTypes.Name, user.FirstName),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };

            // Generate the key and credentials for signing the JWT
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Create the JWT token with claims and expiry time
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30), // 30 minutes expiry
                signingCredentials: creds
            );

            // Return the token
            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }

        [HttpPost("vote/{candidateId}")]
        [Authorize] // Ensure the user is authenticated before voting
        public async Task<IActionResult> Vote(int candidateId)
        {
            // Get user ID from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized("User ID claim is missing.");
            }

            // Parse the userId from string to int
            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("Invalid User ID claim.");
            }


            // Start a transaction to ensure atomic operations
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Check if the candidate exists
                    var candidate = await _context.Candidates.FindAsync(candidateId);
                    if (candidate == null)
                    {
                        return NotFound("Candidate not found.");
                    }

                    // Check if the user exists and their voting status
                    var user = await _context.Users.FindAsync(userId);
                    if (user == null)
                    {
                        return NotFound("User not found.");
                    }

                    // If the user has already voted, return an error
                    if (user.Status == 1) // Assuming 1 means user has voted
                    {
                        return BadRequest("You have already voted.");
                    }

                    // Update the candidate's vote count
                    candidate.Votes += 1;

                    // Update the user's status to indicate they have voted
                    user.Status = 1; // Assuming 1 means user has voted

                    // Save changes to both Candidate and User
                    await _context.SaveChangesAsync();

                    // Commit the transaction
                    await transaction.CommitAsync();

                    return Ok(new { message = "Vote cast successfully." });
                }
                catch (Exception ex)
                {
                    // Rollback the transaction if something goes wrong
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { error = ex.Message });
                }
            }
        }
        public class LoginModel
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }
    }
}