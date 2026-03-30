public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string otp);
    Task SendWelcomeEmailAsync(string toEmail, string name);
}