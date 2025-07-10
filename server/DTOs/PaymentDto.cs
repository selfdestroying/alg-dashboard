using alg_dashboard_server.Models;

namespace alg_dashboard_server.DTOs;

public class PaymentResponseDto
{
    public required Student Student { get; init; }
    public required Group Group { get; init; }
    public required int TotalPaidClasses { get; init; }
    public required int ClassesLeft { get; init; }
}

public class PaymentCreateDto
{
    public required int StudentId { get; init; }
    public required int GroupId { get; init; }
    public required int classesAmount { get; init; }
}

public class PaymentUpdateDto
{
    public required int StudentId { get; init; }
    public required int GroupId { get; init; }
    public required int clasesAmount { get; init; }
}