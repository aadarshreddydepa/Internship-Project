using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;

    public AdminService(AppDbContext db, IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }

    public async Task<List<AdminBusinessDto>> GetAllAsync()
    {
        return await _db.AdminDashboards
            .Include(a => a.Business)
                .ThenInclude(b => b.Category)
            .Include(a => a.Business.Subcategory)
            .Select(a => new AdminBusinessDto
            {
                Id = a.BusinessId,
                Name = a.Business.BusinessName,
                Category = a.Business.Category.CategoryName,
                Description = a.Business.Description,
                Phone = _db.BusinessContacts
                    .Where(c => c.BusinessId == a.BusinessId)
                    .Select(c => c.PhoneCode+c.PhoneNumber)
                    .FirstOrDefault(),

                Email = _db.BusinessContacts
                    .Where(c => c.BusinessId == a.BusinessId)
                    .Select(c => c.Email)
                    .FirstOrDefault(),

                Address = _db.BusinessContacts
                    .Where(c => c.BusinessId == a.BusinessId)
                    .Select(c => c.City + ", " + c.State) 
                    .FirstOrDefault(),

                Status = a.Status.ToString(),
                RejectionComment = a.RejectionReason
            })
            .ToListAsync();
    }
    public async Task UpdateStatusAsync(long businessId, UpdateStatusDto dto, long adminId)
    {
        var record = await _db.AdminDashboards
            .FirstOrDefaultAsync(a => a.BusinessId == businessId);

        if (record == null)
            throw new Exception("Business not found in admin dashboard");

        record.Status = dto.Status;
        record.RejectionReason = dto.RejectionReason;
        record.ActionBy = adminId;
        record.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.BusinessId == businessId);

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.UserId == business.UserId);

        var categoryName = await _db.Categories
            .Where(c => c.CategoryId == business.CategoryId)
            .Select(c => c.CategoryName)
            .FirstOrDefaultAsync();

        await _emailService.SendBusinessStatusUpdateToUserAsync(
            user.Email,
            user.FullName,
            business.BusinessName,
            categoryName ?? "",
            record.Status.ToString(),
            record.RejectionReason
        );
    }

    public async Task<byte[]> ExportAsync(string status)
    {
        if (!Enum.TryParse<BusinessStatus>(status, true, out var parsedStatus))
        {
            throw new Exception("Invalid status");
        }

        var data = await _db.AdminDashboards
            .Include(a => a.Business)
                .ThenInclude(b => b.Category)
            .Include(a => a.Business.Subcategory)
            .Where(a => a.Status == parsedStatus)
            .Select(a => new
            {
                BusinessName = a.Business.BusinessName,

                OwnerName = _db.Users
                    .Where(u => u.UserId == a.Business.UserId)
                    .Select(u => u.FullName)
                    .FirstOrDefault(),

                RegisteredDate = a.Business.CreatedAt,

                Category = a.Business.Category.CategoryName,
                Subcategory = a.Business.Subcategory.SubcategoryName,
                Description = a.Business.Description,

                Email = _db.BusinessContacts
                    .Where(c => c.BusinessId == a.BusinessId)
                    .Select(c => c.Email)
                    .FirstOrDefault(),

                Phone = _db.BusinessContacts
                    .Where(c => c.BusinessId == a.BusinessId)
                    .Select(c => c.PhoneCode+c.PhoneNumber)
                    .FirstOrDefault(),

                Address = _db.BusinessContacts
                    .Where(c => c.BusinessId == a.BusinessId)
                    .Select(c => c.StreetAddress)
                    .FirstOrDefault(),

                Status = a.Status.ToString(),

                RejectionReason = a.RejectionReason 
                            })
            .ToListAsync();

        using var package = new OfficeOpenXml.ExcelPackage();
        var sheet = package.Workbook.Worksheets.Add("Businesses");

        sheet.Cells.LoadFromCollection(data, true);

        int totalColumns = sheet.Dimension.Columns;
        int totalRows = sheet.Dimension.Rows;

        
        using (var header = sheet.Cells[1, 1, 1, totalColumns])
        {
            header.Style.Font.Bold = true;
            header.Style.Font.Color.SetColor(System.Drawing.Color.White);
            header.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            header.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(44, 62, 80));
        }

        sheet.Column(3).Style.Numberformat.Format = "dd-MMM-yyyy";

        using (var range = sheet.Cells[1, 1, totalRows, totalColumns])
        {
            range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
        }

        sheet.Cells[1, 1, totalRows, totalColumns].AutoFilter = true;

        sheet.View.FreezePanes(2, 1);

        sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

        return package.GetAsByteArray();
    }
}