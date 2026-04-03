using System.ComponentModel.DataAnnotations;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Validation
{
    public class RegisterRequestValidationTests
    {
        private List<ValidationResult> Validate(RegisterRequest model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }

        private RegisterRequest ValidRequest() => new()
        {
            UserType = "user",
            Name = "John Doe",
            Email = "john@example.com",
            Phone = "9876543210",
            CountryCode = "+91",
            Password = "Password1",
            Country = "India",
            State = "Telangana",
            City = "Hyderabad"
        };

        [Fact]
        public void ValidRequest_PassesValidation()
        {
            var results = Validate(ValidRequest());
            results.Should().BeEmpty();
        }

        [Fact]
        public void MissingName_FailsValidation()
        {
            var model = ValidRequest();
            model.Name = "";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Name"));
        }

        [Fact]
        public void InvalidEmailFormat_FailsValidation()
        {
            var model = ValidRequest();
            model.Email = "not-an-email";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Email"));
        }

        [Fact]
        public void ShortPassword_FailsValidation()
        {
            var model = ValidRequest();
            model.Password = "Abc1";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Password"));
        }

        [Fact]
        public void PasswordWithoutUppercase_FailsValidation()
        {
            var model = ValidRequest();
            model.Password = "password1";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Password"));
        }

        [Fact]
        public void PasswordWithoutNumber_FailsValidation()
        {
            var model = ValidRequest();
            model.Password = "Passwordx";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Password"));
        }

        [Fact]
        public void PasswordWithoutLowercase_FailsValidation()
        {
            var model = ValidRequest();
            model.Password = "PASSWORD1";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Password"));
        }

        [Fact]
        public void MissingCountry_FailsValidation()
        {
            var model = ValidRequest();
            model.Country = "";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Country"));
        }

        [Fact]
        public void MissingState_FailsValidation()
        {
            var model = ValidRequest();
            model.State = "";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("State"));
        }

        [Fact]
        public void MissingCity_FailsValidation()
        {
            var model = ValidRequest();
            model.City = "";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("City"));
        }

        [Fact]
        public void NameExceedingMaxLength_FailsValidation()
        {
            var model = ValidRequest();
            model.Name = new string('A', 101);
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Name"));
        }
    }
}
