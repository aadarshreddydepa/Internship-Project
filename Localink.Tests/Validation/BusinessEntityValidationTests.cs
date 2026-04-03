using System.ComponentModel.DataAnnotations;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Validation
{
    public class BusinessEntityValidationTests
    {
        private List<ValidationResult> Validate(Business model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }

        private Business ValidBusiness() => new()
        {
            BusinessName = "Johns Restaurant",
            Description = "A lovely family restaurant serving fresh food",
            CategoryId = 1,
            SubcategoryId = 1,
            UserId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        [Fact]
        public void ValidBusiness_PassesValidation()
        {
            var results = Validate(ValidBusiness());
            results.Should().BeEmpty();
        }

        [Fact]
        public void MissingBusinessName_FailsValidation()
        {
            var model = ValidBusiness();
            model.BusinessName = null!;
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("BusinessName"));
        }

        [Fact]
        public void BusinessNameWithSpecialChars_FailsValidation()
        {
            var model = ValidBusiness();
            model.BusinessName = "Biz@#$%";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("BusinessName"));
        }

        [Fact]
        public void BusinessNameWithAllowedSpecialChars_PassesValidation()
        {
            var model = ValidBusiness();
            model.BusinessName = "John's Biz & Co";
            var results = Validate(model);
            results.Should().BeEmpty();
        }

        [Fact]
        public void DescriptionTooShort_FailsValidation()
        {
            var model = ValidBusiness();
            model.Description = "Short";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Description"));
        }

        [Fact]
        public void DescriptionStartingWithNumber_FailsValidation()
        {
            var model = ValidBusiness();
            model.Description = "1 Great restaurant with fine dining";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Description"));
        }

        [Fact]
        public void MissingDescription_FailsValidation()
        {
            var model = ValidBusiness();
            model.Description = null!;
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Description"));
        }
    }
}
