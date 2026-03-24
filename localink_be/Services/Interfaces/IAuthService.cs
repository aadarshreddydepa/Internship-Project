public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest request);
    Task<object> LoginAsync(LoginRequest request);
    Task<string> VerifyEmailAsync(string email);
   Task<string> ResetPasswordAsync(ForgotPasswordRequest request);
}
    