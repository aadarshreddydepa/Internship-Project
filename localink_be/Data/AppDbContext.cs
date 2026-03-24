using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    
    // DbSets (Combined)
    
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Subcategory> Subcategories { get; set; }
    public DbSet<Business> Businesses { get; set; }
    public DbSet<BusinessContact> BusinessContacts { get; set; }
    public DbSet<BusinessPhoto> BusinessPhotos { get; set; }
    public DbSet<AdminDashboard> AdminDashboards { get; set; }

    public DbSet<BusinessHour> BusinessHours { get; set; }
    public DbSet<BusinessHourSlot> BusinessHourSlots { get; set; }

    
    // Model Configuration
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
        // CATEGORY
        
        modelBuilder.Entity<Category>().ToTable("category")
            .Property(c => c.CategoryId).HasColumnName("category_id");

        modelBuilder.Entity<Category>()
            .Property(c => c.CategoryName).HasColumnName("category_name");

        modelBuilder.Entity<Category>()
            .Property(c => c.IconUrl).HasColumnName("icon_url");

        
        // SUBCATEGORY
        
        modelBuilder.Entity<Subcategory>().ToTable("subcategory");

        modelBuilder.Entity<Subcategory>()
            .Property(s => s.SubcategoryId).HasColumnName("subcategory_id");

        modelBuilder.Entity<Subcategory>()
            .Property(s => s.SubcategoryName).HasColumnName("subcategory_name");

        modelBuilder.Entity<Subcategory>()
            .Property(s => s.CategoryId).HasColumnName("category_id");

        modelBuilder.Entity<Subcategory>()
            .Property(s => s.IconUrl).HasColumnName("icon_url");

        
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

        // USER
      
        modelBuilder.Entity<User>().ToTable("users");

    
        // BUSINESS HOURS RELATION (FROM FILE 2)
       
        modelBuilder.Entity<BusinessHour>()
            .HasMany(b => b.Slots)
            .WithOne()
            .HasForeignKey(s => s.BusinessHourId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}