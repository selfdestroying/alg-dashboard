namespace alg_dashboard_server.DTOs;

public class AuthRequestDto
{
    public required string Name { get; set; }
    public required string Password { get; set; }
}

public sealed record AuthResponseDto(string Token)
{
}

public sealed record SuccessResponse<T>(string Message, T Data, bool Success = true)
{
}

public sealed record ErrorResponse(string Message, bool Success = false)
{
};