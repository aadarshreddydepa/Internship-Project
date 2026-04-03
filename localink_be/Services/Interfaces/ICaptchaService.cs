namespace localink_be.Services.Interfaces
{
    public interface ICaptchaService
    {
        Task<bool> VerifyAsync(string token);
    }
}
