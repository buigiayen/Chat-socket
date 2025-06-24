using MediatR;

namespace Server_chat.vm.authentication.meet
{
    public class AuthenticationHandler(IHttpClientFactory httpClientFactory, IConfiguration configuration) : IRequestHandler<AuthenticationRequest, AuthenticationResponse>
    {
        public async Task<AuthenticationResponse> Handle(AuthenticationRequest request, CancellationToken cancellationToken)
        {
            var client = httpClientFactory.CreateClient();
            client.BaseAddress = new Uri(configuration.GetSection("Url:meet").Value);

            using var form = new MultipartFormDataContent();
            form.Add(new StringContent(request.username ?? ""), "username");
            form.Add(new StringContent(request.password ?? ""), "password");
            form.Add(new StringContent(request.code ?? ""), "code");

            using var httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
            {
                Content = form
            };

            using var response = await client.SendAsync(httpRequestMessage, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
            var authResponse = System.Text.Json.JsonSerializer.Deserialize<AuthenticationResponse>(responseString, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return authResponse ?? new AuthenticationResponse { status = "error", message = "Null response", code = -1 };
        }
    }
}
