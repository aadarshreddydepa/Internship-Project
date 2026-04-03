public interface ICaptchaService
{
    Task<bool> VerifyAsync(string token);
}