namespace Server_chat
{
    public class ConfigEnviroment(string sqlConnectionString)
    {
        public string sqlconnecion { get; set; } = sqlConnectionString;
    }
}
