using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VotingAppApi.Data;
using VotingAppApi.Models;

namespace VotingAppApi.Controllers
{
    [Route("/[controller]")]
    [ApiController]
    [EnableCors("AllowAll")]
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
        public async Task<ActionResult<User>> Register([FromBody] User user)
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);  // Hash password
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return StatusCode(201, user);

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
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                result = user
            });
        }

        [HttpGet("info")]
        [Authorize]  // Only authenticated users can access this endpoint
        public async Task<IActionResult> GetUserInfo()
        {
            // Retrieve the user ID from the JWT token's claims
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Fetch the user from the database using the user ID
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Return the user's information including DateOfBirth
            return Ok(new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                role = user.Role,
                status = user.Status,
                dob = user.Dob // Include DOB in the response
            });
        }


        [HttpPatch("update-status/{uid}")]
        public async Task<IActionResult> UpdateUserStatus([FromRoute] int uid)
        {
            var user = await _context.Users.FindAsync(uid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            user.Status = 1;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User status updated successfully." });
        }


        [HttpPut("change-password")]
        [Authorize]  // Only authenticated users can change their password
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            var user = await _context.Users.FindAsync(int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value));

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Verify the old password
            if (!BCrypt.Net.BCrypt.Verify(model.CurrentPassword, user.Password))
            {
                return Unauthorized(new { message = "Old password is incorrect." });
            }

            // Hash the new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
        }

        [HttpPut("update-profile")]
        [Authorize]  // Only authenticated users can access this endpoint
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            // Retrieve the user ID from the JWT token's claims
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Fetch the user from the database using the user ID
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Update the user profile fields, excluding Role and Status
            user.FirstName = model.FirstName ?? user.FirstName;
            user.LastName = model.LastName ?? user.LastName;
            user.Email = model.Email ?? user.Email;
            user.Dob = model.Dob ?? user.Dob;

            // Save the changes to the database
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully." });
        }

        public class UpdateProfileModel
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Email { get; set; }
            public DateTime? Dob { get; set; }  
        }




        // Model for changing password
        public class ChangePasswordModel
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
        }
        public class LoginModel
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }
    }
}
