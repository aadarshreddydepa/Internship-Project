using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<string> RegisterAsync(RegisterRequest request)
{
    if (string.IsNullOrWhiteSpace(request.Email))
        throw new ArgumentException("Email is required");

    if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        throw new ArgumentException("Password must be at least 6 characters");

    // Normalize email
    var email = request.Email.Trim().ToLower();

    // Check duplicate email
    var emailExists = await _context.Users
        .AnyAsync(u => u.Email == email);

    if (emailExists)
        throw new InvalidOperationException("Email already exists");

    // Check duplicate phone
    var phoneExists = await _context.Users
        .AnyAsync(u => u.PhoneNumber == request.Phone);

    if (phoneExists)
        throw new InvalidOperationException("Phone number already exists");

    // Create user
    var user = new User
    {
        AccountType = request.UserType?.Trim().ToLower() ?? "user",
        FullName = request.Name,
        Email = email,
        PhoneNumber = request.Phone,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12),
        CountryCode = request.CountryCode
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    // Create address
    var address = new Address
    {
        UserId = user.UserId,
        Country = request.Country,
        State = request.State,
        City = request.City,
        StreetAddress = request.Street,
        Pincode = request.Pincode
    };

    _context.Addresses.Add(address);
    await _context.SaveChangesAsync();

    return "User registered successfully";
}

    // LOGIN
    public async Task<object> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) ||
            string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentException("Invalid credentials");

        var email = request.UsernameOrEmail.Trim().ToLower();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            throw new UnauthorizedAccessException("User not found");

        var isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!isValid)
            throw new UnauthorizedAccessException("Invalid password");

        var token = GenerateJwtToken(user);

        return new
        {
            token,
            userType = user.AccountType,
            name = user.FullName
        };
    }

    // VERIFY EMAIL
    public async Task<string> VerifyEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email required");

        var normalizedEmail = email.Trim().ToLower();

        var exists = await _context.Users
            .AnyAsync(u => u.Email == normalizedEmail);

        if (!exists)
            throw new KeyNotFoundException("Email not found");

        return "Email exists";
    }

    // RESET PASSWORD
   public async Task<string> ResetPasswordAsync(ForgotPasswordRequest request)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email);

    if (user == null)
        throw new Exception("User not found");

    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 12);

    await _context.SaveChangesAsync();

    return "Password updated successfully";
}

    // JWT TOKEN GENERATION
    private string GenerateJwtToken(User user)
    {
        var keyString = _config["Jwt:Key"];

        if (string.IsNullOrEmpty(keyString))
            throw new Exception("JWT Key is missing in configuration!");

        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];
        var expiryMinutes = _config["Jwt:ExpiryMinutes"];

        if (string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience) || string.IsNullOrEmpty(expiryMinutes))
            throw new Exception("JWT configuration is incomplete!");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.AccountType ?? "user"),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(expiryMinutes)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}