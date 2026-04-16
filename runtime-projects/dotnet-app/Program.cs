using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var settings = AppSettings.Load(builder.Configuration);

var app = builder.Build();

var tasks = new List<TaskItem>
{
    new(1, "Prepare deployment", "high", false),
    new(2, "Validate backups", "medium", false),
};

var nextTaskId = 3;

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = settings.AppName,
    environment = settings.AppEnv,
    timeUtc = DateTimeOffset.UtcNow,
}));

app.MapGet("/config", () => Results.Ok(new
{
    appName = settings.AppName,
    appEnv = settings.AppEnv,
    port = settings.Port,
    apiKey = Mask(settings.ApiKey),
    signingSecret = Mask(settings.SigningSecret),
}));

app.MapGet("/tasks", () => Results.Ok(new { tasks }));

app.MapPost("/tasks", (CreateTaskRequest request, HttpRequest httpRequest) =>
{
    var requestApiKey = httpRequest.Headers["x-api-key"].ToString();
    if (!string.Equals(requestApiKey, settings.ApiKey, StringComparison.Ordinal))
    {
        return Results.Json(
            new { error = "Unauthorized: invalid API key." },
            statusCode: StatusCodes.Status401Unauthorized
        );
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.Json(
            new { error = "Field 'title' is required." },
            statusCode: StatusCodes.Status400BadRequest
        );
    }

    var normalizedPriority = string.IsNullOrWhiteSpace(request.Priority) ? "normal" : request.Priority.Trim();
    var task = new TaskItem(nextTaskId, request.Title.Trim(), normalizedPriority, false);
    var signature = SignTask(task, settings.SigningSecret);

    tasks.Add(task);
    nextTaskId += 1;

    return Results.Json(new { task, signature }, statusCode: StatusCodes.Status201Created);
});

app.Run($"http://0.0.0.0:{settings.Port}");

static string SignTask(TaskItem task, string signingSecret)
{
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(signingSecret));
    var payload = $"{task.Id}:{task.Title}:{task.Priority}";
    var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
    return Convert.ToHexString(hash)[..16].ToLowerInvariant();
}

static string Mask(string value)
{
    if (string.IsNullOrWhiteSpace(value))
    {
        return string.Empty;
    }

    if (value.Length <= 4)
    {
        return "****";
    }

    return $"{value[..2]}****{value[^2..]}";
}

sealed record TaskItem(int Id, string Title, string Priority, bool Completed);
sealed record CreateTaskRequest(string Title, string? Priority);

sealed record AppSettings(
    string AppName,
    string AppEnv,
    int Port,
    string ApiKey,
    string SigningSecret)
{
    public static AppSettings Load(IConfiguration configuration)
    {
        var appName = configuration["APP_NAME"] ?? configuration["App:Name"] ?? "dotnet-app";
        var appEnv = configuration["APP_ENV"] ?? configuration["App:Environment"] ?? "development";
        var portRaw = configuration["APP_PORT"] ?? configuration["App:Port"] ?? "5050";
        if (!int.TryParse(portRaw, out var port))
        {
            throw new InvalidOperationException("APP_PORT or App:Port must be a number.");
        }

        var apiKey = ReadRequiredSecret(configuration, "APP_API_KEY");
        var signingSecret = ReadRequiredSecret(configuration, "APP_SIGNING_SECRET");

        return new AppSettings(appName, appEnv, port, apiKey, signingSecret);
    }

    private static string ReadRequiredSecret(IConfiguration configuration, string key)
    {
        var direct = configuration[key];
        if (!string.IsNullOrWhiteSpace(direct))
        {
            return direct.Trim();
        }

        var filePath = configuration[$"{key}_FILE"];
        if (!string.IsNullOrWhiteSpace(filePath))
        {
            var resolvedPath = Path.GetFullPath(filePath);
            if (!File.Exists(resolvedPath))
            {
                throw new InvalidOperationException($"Secret file for {key} was not found at: {resolvedPath}");
            }

            return File.ReadAllText(resolvedPath).Trim();
        }

        throw new InvalidOperationException($"Missing required secret {key}. Set {key} or {key}_FILE.");
    }
}
