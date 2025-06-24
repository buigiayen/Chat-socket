using Server_chat.contract;
using Server_chat.domain.repositories;
using System.IdentityModel.Tokens.Jwt;
namespace Server_chat.domain.Handler
{
    public class CurrenUserRepositories(IHttpContextAccessor httpContextAccessor, IUserRepositories userRepositories) : ICurrenUserRepositories
    {
        public async Task<(Guid?, string)> GetCurrentUserIDAsync()
        {
            httpContextAccessor.HttpContext.Request.Headers.TryGetValue("Authorization", out var authHeader);
            var token = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();

            if (string.IsNullOrEmpty(token))
                return (null, string.Empty);

            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
                return (null, string.Empty);

            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c =>
                c.Type == contract.AuthenticationConst.SubID);

            if (userIdClaim == null)
                throw new UnauthorizedAccessException(ErrorConst.ReturnLogin);
            Guid.TryParse(userIdClaim.Value, out var userId) ;
            var socketCurren = await userRepositories.GetConnectionIdAsync(userId);

            return (userId, socketCurren);
        }

        public async Task<(Guid?, string)> GetCurrentUserSocketAsync()
        {
            httpContextAccessor.HttpContext.Request.Query.TryGetValue("Authorization", out var authHeader);
            var token = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();

            if (string.IsNullOrEmpty(token))
                return (null, string.Empty);

            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
                return (null, string.Empty);

            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c =>
                c.Type == contract.AuthenticationConst.SubID);

            if (userIdClaim == null)
                throw new UnauthorizedAccessException(ErrorConst.ReturnLogin);
            Guid.TryParse(userIdClaim.Value, out var userId);
            var socketCurren = await userRepositories.GetConnectionIdAsync(userId);

            return (userId, socketCurren);
        }
    }
}
