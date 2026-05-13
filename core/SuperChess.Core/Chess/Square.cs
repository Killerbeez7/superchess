namespace SuperChess.Core.Chess;

/// <summary>
/// Represents a chess square using file (0–7 = a–h) and rank (0–7 = 1–8) indices.
/// Provides conversion to/from algebraic notation ("e4") and index-based access.
/// </summary>
internal readonly struct Square(int file, int rank) : IEquatable<Square>
{
    public int File { get; } = file;
    public int Rank { get; } = rank;


    public bool IsValid => File is >= 0 and <= 7 && Rank is >= 0 and <= 7;

    public string ToAlgebraic() => $"{(char)('a' + File)}{Rank + 1}";

    public static Square? FromAlgebraic(string s)
    {
        if (s.Length != 2) return null;
        var file = s[0] - 'a';
        var rank = s[1] - '1';
        if (file is < 0 or > 7 || rank is < 0 or > 7) return null;
        return new Square(file, rank);
    }

    public Square Offset(int df, int dr) => new(File + df, Rank + dr);

    public override string ToString() => ToAlgebraic();

    public bool Equals(Square other) => File == other.File && Rank == other.Rank;
    public override bool Equals(object? obj) => obj is Square s && Equals(s);
    public override int GetHashCode() => File * 8 + Rank;

    public static bool operator ==(Square a, Square b) => a.Equals(b);
    public static bool operator !=(Square a, Square b) => !a.Equals(b);
}
