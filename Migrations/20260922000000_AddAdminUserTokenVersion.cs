using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MyProject2.Admin;

#nullable disable

namespace MyProject2.Migrations;

[DbContext(typeof(AdminDbContext))]
[Migration("20260922000000_AddAdminUserTokenVersion")]
public partial class AddAdminUserTokenVersion : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "TokenVersion",
            table: "AdminUsers",
            type: "integer",
            nullable: false,
            defaultValue: 0);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "TokenVersion",
            table: "AdminUsers");
    }
}
