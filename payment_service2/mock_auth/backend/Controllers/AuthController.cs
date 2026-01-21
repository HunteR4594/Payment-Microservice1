using Microsoft.AspNetCore.Mvc;
using MockAuthService.Models;
using MockAuthService.Services;

namespace MockAuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserStore _userStore;
    private readonly JwtService _jwtService;

    public AuthController(UserStore userStore, JwtService jwtService)
    {
        _userStore = userStore;
        _jwtService = jwtService;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public ActionResult<AuthResponse> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Email and password are required"
            });
        }

        if (_userStore.EmailExists(request.Email))
        {
            return Conflict(new AuthResponse
            {
                Success = false,
                Message = "Email already registered"
            });
        }

        var user = _userStore.CreateUser(
            request.Email,
            request.Password,
            request.Name ?? request.Email.Split('@')[0],
            request.Role ?? "user"
        );

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Registration successful",
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            }
        });
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Email and password are required"
            });
        }

        var user = _userStore.GetByEmail(request.Email);
        
        if (user == null || !_userStore.ValidatePassword(user, request.Password))
        {
            return Unauthorized(new AuthResponse
            {
                Success = false,
                Message = "Invalid email or password"
            });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Login successful",
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            }
        });
    }

    /// <summary>
    /// Get list of seeded users for testing
    /// </summary>
    [HttpGet("test-users")]
    public ActionResult GetTestUsers()
    {
        return Ok(new
        {
            message = "Use these credentials for testing",
            users = new[]
            {
                new { email = "user@example.com", password = "password123", role = "user" },
                new { email = "admin@example.com", password = "admin123", role = "admin" }
            }
        });
    }
}
