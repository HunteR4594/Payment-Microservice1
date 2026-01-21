using System.Collections.Concurrent;
using MockAuthService.Models;

namespace MockAuthService.Services;

public class UserStore
{
    private readonly ConcurrentDictionary<string, User> _users = new();

    public UserStore()
    {
        // Seed default users
        var defaultUser = new User
        {
            Id = "user_001",
            Email = "user@example.com",
            PasswordHash = HashPassword("password123"),
            Name = "Test User",
            Role = "user"
        };
        
        var adminUser = new User
        {
            Id = "admin_001",
            Email = "admin@example.com",
            PasswordHash = HashPassword("admin123"),
            Name = "Admin User",
            Role = "admin"
        };
        
        _users[defaultUser.Email.ToLower()] = defaultUser;
        _users[adminUser.Email.ToLower()] = adminUser;
    }

    public User? GetByEmail(string email)
    {
        _users.TryGetValue(email.ToLower(), out var user);
        return user;
    }

    public bool EmailExists(string email) => _users.ContainsKey(email.ToLower());

    public User CreateUser(string email, string password, string name, string role = "user")
    {
        var user = new User
        {
            Id = $"user_{Guid.NewGuid().ToString()[..8]}",
            Email = email,
            PasswordHash = HashPassword(password),
            Name = name,
            Role = role
        };
        
        _users[email.ToLower()] = user;
        return user;
    }

    public bool ValidatePassword(User user, string password)
    {
        return user.PasswordHash == HashPassword(password);
    }

    private static string HashPassword(string password)
    {
        // Simple hash for mock purposes - NOT FOR PRODUCTION
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(password + "mock_salt_123");
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
