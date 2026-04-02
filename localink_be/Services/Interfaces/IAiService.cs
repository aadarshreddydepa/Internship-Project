using System.Collections.Generic;
using System.Threading.Tasks;

namespace localink_be.Services.Interfaces
{
    public interface IAiService
    {
        Task<List<string>> GetReviewSuggestionsAsync(string keywords);
    }
}
