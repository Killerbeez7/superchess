using SuperChess.Api.Common.Errors;

namespace SuperChess.Api.Common;

public sealed class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public ErrorKind Kind { get; }

    private Result(bool isSuccess, T? value, string? error, ErrorKind kind)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        Kind = kind;
    }

    public static Result<T> Success(T value) =>
        new(true, value, null, ErrorKind.None);

    public static Result<T> NotFound(string error) =>
        new(false, default, error, ErrorKind.NotFound);

    public static Result<T> Validation(string error) =>
        new(false, default, error, ErrorKind.Validation);

    public static Result<T> Conflict(string error) =>
        new(false, default, error, ErrorKind.Conflict);

    public static Result<T> Forbidden(string error) =>
        new(false, default, error, ErrorKind.Forbidden);
}