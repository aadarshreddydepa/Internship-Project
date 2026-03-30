public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest request);
    Task<object> LoginAsync(LoginRequest request);
    Task<string> VerifyEmailAsync(string email);
    Task<string> ResetPasswordAsync(ForgotPasswordRequest request);
    Task<string> SendResetOtpAsync(string email);
    Task<string> VerifyOtpAndResetPasswordAsync(string email, string otp, string newPassword);

}
    