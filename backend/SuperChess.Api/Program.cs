using Microsoft.EntityFrameworkCore;
using SuperChess.Api.Data;
using SuperChess.Api.Data.Repositories;
using SuperChess.Api.Realtime;
using SuperChess.Api.Services.Games;
using SuperChess.Core.Chess;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- Database ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? throw new InvalidOperationException("DefaultConnection is not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(NormalizePostgresUrl(connectionString)));

// --- DI ---
builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<IGameNotifier, SignalRGameNotifier>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddSingleton<IChessEngine, ChessEngine>();

// --- CORS ---
const string frontendCorsPolicy = "FrontendCorsPolicy";

var allowedOrigins = builder.Configuration["AllowedOrigins"]?
                         .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                     ?? ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.5:3000"];


builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// --- Apply migrations on startup ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(frontendCorsPolicy);
app.UseAuthorization();
app.MapControllers();
app.MapHub<GameHub>("/gamehub");

app.Run();

return;

static string NormalizePostgresUrl(string connectionString)
{
    if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return connectionString;
    }

    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);

    return $"Host={uri.Host};" +
           $"Port={(uri.Port == -1 ? 5432 : uri.Port)};" +
           $"Database={uri.AbsolutePath.TrimStart('/')};" +
           $"Username={Uri.UnescapeDataString(userInfo[0])};" +
           $"Password={Uri.UnescapeDataString(userInfo.Length > 1 ? userInfo[1] : string.Empty)};" +
           $"SSL Mode=Require;" +
           $"Trust Server Certificate=true";
}