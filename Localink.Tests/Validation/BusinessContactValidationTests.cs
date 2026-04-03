using System.ComponentModel.DataAnnotations;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Validation
{
    public class BusinessContactValidationTests
    {
        private List<ValidationResult> Validate(BusinessContact model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }

        private BusinessContact ValidContact() => new()
        {
            BusinessId = 1,
            PhoneCode = "+91",
            PhoneNumber = "9876543210",
            Email = "biz@example.com",
            Website = "example.com",
            StreetAddress = "123 Main Street",
            City = "Hyderabad",
            State = "Telangana",
            Country = "India",
            Pincode = "500001"
        };

        [Fact]
        public void ValidContact_PassesValidation()
        {
            var results = Validate(ValidContact());
            results.Should().BeEmpty();
        }

        [Fact]
        public void InvalidPhoneNumber_ShortLength_FailsValidation()
        {
            var model = ValidContact();
            model.PhoneNumber = "12345";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("PhoneNumber"));
        }

        [Fact]
        public void InvalidPhoneNumber_StartsWithLowDigit_FailsValidation()
        {
            var model = ValidContact();
            model.PhoneNumber = "1234567890";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("PhoneNumber"));
        }

        [Fact]
        public void InvalidEmail_FailsValidation()
        {
            var model = ValidContact();
            model.Email = "not-an-email";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Email"));
        }

        [Fact]
        public void EmailStartingWithNumber_FailsRegexValidation()
        {
            var model = ValidContact();
            model.Email = "123email@test.com";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Email"));
        }

        [Fact]
        public void InvalidPincode_TooShort_FailsValidation()
        {
            var model = ValidContact();
            model.Pincode = "123";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Pincode"));
        }

        [Fact]
        public void InvalidPincode_StartsWithZero_FailsValidation()
        {
            var model = ValidContact();
            model.Pincode = "012345";
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Pincode"));
        }

        [Fact]
        public void StreetAddressTooLong_FailsValidation()
        {
            var model = ValidContact();
            model.StreetAddress = new string('A', 201);
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("StreetAddress"));
        }

        [Fact]
        public void MissingCity_FailsValidation()
        {
            var model = ValidContact();
            model.City = null!;
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("City"));
        }

        [Fact]
        public void MissingState_FailsValidation()
        {
            var model = ValidContact();
            model.State = null!;
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("State"));
        }

        [Fact]
        public void MissingCountry_FailsValidation()
        {
            var model = ValidContact();
            model.Country = null!;
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Country"));
        }
    }
}
