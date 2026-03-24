using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Subcategory> Subcategories { get; set; }
    public DbSet<Business> Businesses { get; set; }
    public DbSet<BusinessContact> BusinessContacts { get; set; }
    public DbSet<BusinessPhoto> BusinessPhotos { get; set; }

    public DbSet<Address> Addresses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // CATEGORY
        modelBuilder.Entity<Category>().ToTable("category")
            .Property(c => c.CategoryId).HasColumnName("category_id");

        modelBuilder.Entity<Category>()
            .Property(c => c.CategoryName).HasColumnName("category_name");
        modelBuilder.Entity<Category>().Property(c => c.IconUrl).HasColumnName("icon_url");

        // SUBCATEGORY
        modelBuilder.Entity<Subcategory>().ToTable("subcategory");
        modelBuilder.Entity<Subcategory>()
            .Property(s => s.SubcategoryId).HasColumnName("subcategory_id");
        modelBuilder.Entity<Subcategory>()
            .Property(s => s.SubcategoryName).HasColumnName("subcategory_name");
        modelBuilder.Entity<Subcategory>()
            .Property(s => s.CategoryId).HasColumnName("category_id");
        modelBuilder.Entity<Subcategory>().Property(s => s.IconUrl).HasColumnName("icon_url");

        // BUSINESS
        modelBuilder.Entity<Business>().ToTable("business");
        modelBuilder.Entity<Business>()
            .Property(b => b.BusinessId).HasColumnName("business_id");
        modelBuilder.Entity<Business>()
            .Property(b => b.BusinessName).HasColumnName("business_name");
        modelBuilder.Entity<Business>()
            .Property(b => b.Description).HasColumnName("description");
        modelBuilder.Entity<Business>()
            .Property(b => b.CategoryId).HasColumnName("category_id");
        modelBuilder.Entity<Business>()
            .Property(b => b.SubcategoryId).HasColumnName("subcategory_id");
        modelBuilder.Entity<Business>()
            .Property(b => b.UserId).HasColumnName("user_id");

        // BUSINESS CONTACT
        modelBuilder.Entity<BusinessContact>().ToTable("business_contact");
        modelBuilder.Entity<BusinessContact>()
            .Property(c => c.ContactId).HasColumnName("contact_id");
        modelBuilder.Entity<BusinessContact>()
            .Property(c => c.BusinessId).HasColumnName("business_id");
        modelBuilder.Entity<BusinessContact>()
            .Property(c => c.PhoneNumber).HasColumnName("phone_number");
        modelBuilder.Entity<BusinessContact>()
            .Property(c => c.Email).HasColumnName("email");
        modelBuilder.Entity<BusinessContact>()
            .Property(c => c.City).HasColumnName("city");
        modelBuilder.Entity<BusinessContact>()
            .Property(c => c.State).HasColumnName("state");

        // BUSINESS PHOTO
        modelBuilder.Entity<BusinessPhoto>().ToTable("business_photos");
        modelBuilder.Entity<BusinessPhoto>()
            .Property(p => p.PhotoId).HasColumnName("photo_id");
        modelBuilder.Entity<BusinessPhoto>()
            .Property(p => p.BusinessId).HasColumnName("business_id");
        modelBuilder.Entity<BusinessPhoto>()
            .Property(p => p.ImageUrl).HasColumnName("image_url");
        modelBuilder.Entity<BusinessPhoto>()
            .Property(p => p.IsPrimary).HasColumnName("is_primary");

        modelBuilder.Entity<User>(entity =>
{
    entity.ToTable("users");

    entity.HasKey(u => u.UserId);

    entity.Property(u => u.UserId).HasColumnName("user_id");
    entity.Property(u => u.AccountType).HasColumnName("account_type");
    entity.Property(u => u.FullName).HasColumnName("full_name");
    entity.Property(u => u.Email).HasColumnName("email");
    entity.Property(u => u.PhoneNumber).HasColumnName("phone_number");
    entity.HasIndex(u => u.PhoneNumber).IsUnique();
    entity.Property(u => u.PasswordHash).HasColumnName("password_hash");
    entity.Property(u => u.CountryCode).HasColumnName("country_code");
});
    }
}