using MediatR;
using Microsoft.Extensions.Logging;
using Server_chat.domain.enities;
using Server_chat.domain.repositories;

namespace Server_chat.vm.authentication.meet
{
    public class AuthenticationHandler(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        IUserRepositories userRepositories,
        ILogger<AuthenticationHandler> logger)
        : IRequestHandler<AuthenticationRequest, AuthenticationResponse>
    {
        public async Task<AuthenticationResponse> Handle(AuthenticationRequest request, CancellationToken cancellationToken)
        {
            var client = httpClientFactory.CreateClient(contract.EnvConst.URL_MEET);

            using var form = new MultipartFormDataContent();
            form.Add(new StringContent(request.password ?? ""), "password");
            form.Add(new StringContent(request.code ?? ""), "code");

            using var httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login_chat")
            {
                Content = form
            };
            logger.LogInformation("http request {0}" + System.Text.Json.JsonSerializer.Serialize(client));

            using var response = await client.SendAsync(httpRequestMessage, cancellationToken);
            logger.LogInformation("http response {0}" + System.Text.Json.JsonSerializer.Serialize(response));

            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
            var authResponse = System.Text.Json.JsonSerializer.Deserialize<AuthenticationMeet>(responseString, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            var datameet = DecodeJwtPayload<JWTMeet>(authResponse.data);
            Guid? userID = await userRepositories.SyncUser(new Domain.enities.User
            {
                Name = datameet.data.name,
                CenterID = request.code,
                UserMeet = Int32.Parse(datameet.sub),
            });

            var mapper = new AuthenticationResponse
            {
                code = authResponse.code,
                UserInfo = new JWTMeet
                {
                    userID = userID.Value,
                    aud = datameet.aud,
                    data = datameet.data,
                    exp = datameet.exp,
                    iat = datameet.iat,
                    iss = datameet.iss,
                    sub = datameet.sub
                },
                message = authResponse.message,
                status = authResponse.status,
                token = authResponse.data
            };
            return mapper ?? new AuthenticationResponse { status = "error", message = "Null response", code = -1 };
        }
        private static T? DecodeJwtPayload<T>(string jwt)
        {
            if (string.IsNullOrWhiteSpace(jwt)) return default;

            var parts = jwt.Split('.');
            if (parts.Length != 3) return default;

            var payload = parts[1];
            payload = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=');
            var bytes = Convert.FromBase64String(payload.Replace('-', '+').Replace('_', '/'));
            var json = System.Text.Encoding.UTF8.GetString(bytes);
            return System.Text.Json.JsonSerializer.Deserialize<T>(json, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

    }
}
