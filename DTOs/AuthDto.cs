namespace alg_dashboard_server.DTOs;


public class LoginRequestDto
{
    public required string Name { get; init; }
    public required string Password { get; init; }
}

public sealed record LoginResponseDto(string Token);

public sealed record SuccessResponse<T>(string Message, T Data);

public sealed record ErrorResponse<T>(string Message);