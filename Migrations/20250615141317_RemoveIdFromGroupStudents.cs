using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace alg_dashboard_server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIdFromGroupStudents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Id",
                table: "GroupStudent");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "GroupStudent",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
