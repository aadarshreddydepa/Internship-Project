using System.ComponentModel.DataAnnotations;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Validation
{
    public class UpdateUserProfileValidationTests
    {
        private List<ValidationResult> Validate(UpdateUserProfileDto model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }

        [Fact]
        public void ValidProfile_PassesValidation()
        {
            var model = new UpdateUserProfileDto
            {
                FullName = "John Doe",
                Phone = "9876543210",
                Address = new AddressDto { City = "Hyderabad" }
            };
            var results = Validate(model);
            results.Should().BeEmpty();
        }

        [Fact]
        public void NameTooLong_FailsValidation()
        {
            var model = new UpdateUserProfileDto
            {
                FullName = new string('A', 101),
                Address = new AddressDto()
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("FullName"));
        }

        [Fact]
        public void PhoneTooLong_FailsValidation()
        {
            var model = new UpdateUserProfileDto
            {
                FullName = "John",
                Phone = new string('1', 16),
                Address = new AddressDto()
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Phone"));
        }

        [Fact]
        public void MissingFullName_FailsValidation()
        {
            var model = new UpdateUserProfileDto
            {
                FullName = "",
                Address = new AddressDto()
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("FullName"));
        }
    }
}
