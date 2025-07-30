using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Server_chat.apis;
using Server_chat.contract;
using Server_chat.domain.Handler;
using Server_chat.domain.repositories;
using System.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();


builder.Services.AddOpenApi();
builder.Services.AddCors();
builder.Services.AddMediatR(f =>
{
    f.RegisterServicesFromAssemblies(AppDomain.CurrentDomain.GetAssemblies());
});

builder.Services.AddAutoMapper(typeof(Server_chat.mapper.map));
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddScoped<IUserRepositories, UserRepositories>();
builder.Services.AddScoped<IMessageRepositories, MessageRepositories>();
builder.Services.AddTransient<ICurrenUserRepositories, CurrenUserRepositories>();
builder.Services.AddHttpClient(EnvConst.URL_MEET, (context) =>
{
    var Uri = new Uri(builder.Environment.IsProduction() ? Environment.GetEnvironmentVariable(EnvConst.URL_MEET) : builder.Configuration.GetSection("Url:meet").Value);
    var key = builder.Environment.IsProduction() ? Environment.GetEnvironmentVariable(EnvConst.API_KEY_MEET) : builder.Configuration.GetSection("Url:apikey").Value;
    context.BaseAddress = Uri;
    context.DefaultRequestHeaders.Add("API-KEY",key);
    context.DefaultRequestHeaders.Add("Accept", "application/json");
});
builder.Services.AddSignalR();


builder.Services.AddTransient<IDbConnection>((sp) =>
new SqlConnection(builder.Environment.IsProduction() ? Environment.GetEnvironmentVariable(EnvConst.SqlEnviromentProduction) : builder.Configuration.GetConnectionString("sqlconnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Environment.IsProduction() ? Environment.GetEnvironmentVariable(EnvConst.ValidIssuerProduction) : builder.Configuration.GetSection("secured:Issuer").Value,
        ValidAudience = builder.Environment.IsProduction() ? Environment.GetEnvironmentVariable(EnvConst.ValidAudienceProcduction) : builder.Configuration.GetSection("secured:Audience").Value,
        IssuerSigningKey = builder.Environment.IsProduction() ? new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable(EnvConst.IssuerSigningKeyProcduction))) : new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetSection("secured:signature").Value))
    };
});
Console.WriteLine(builder.Environment.IsProduction() ? Environment.GetEnvironmentVariable(EnvConst.URL_MEET) : builder.Configuration.GetSection("Url:meet").Value);
Console.WriteLine(builder.Environment.IsProduction() ? Environment.GetEnvironmentVariable(EnvConst.SqlEnviromentProduction) : builder.Configuration.GetConnectionString("sqlconnection"));
var app = builder.Build();



if (app.Environment.IsStaging() || app.Environment.IsDevelopment())
{
    app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().SetIsOriginAllowed(origin => true).AllowCredentials());
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1 open api");
    });
    app.MapScalarApiReference();
}

// Buộc môi trường https trên server product
if (app.Environment.IsProduction())
{
    app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().SetIsOriginAllowed(origin => true).AllowCredentials());
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();


app.MapMessageApis();
app.MapUsersApis();

app.MapHub<ChatHub>("/chathub");


app.Run();
