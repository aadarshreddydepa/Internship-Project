using System.Threading.Tasks;

namespace localink_be.Services.Interfaces
{
    public interface ICaptchaService
    {
        Task<bool> VerifyTokenAsync(string token);
    }
}
