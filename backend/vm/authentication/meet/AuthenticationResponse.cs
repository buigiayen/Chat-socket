namespace Server_chat.vm.authentication.meet
{
    public record class AuthenticationResponse
    {

        public string status { get; set; }
        public string message { get; set; }
        public Data data { get; set; }
        public int code { get; set; }

        public class Data
        {
            public string user_id { get; set; }
            public string auth_token { get; set; }
            public string identification { get; set; }
            public string name { get; set; }
            public string ma_csdt { get; set; }
            public string school_name { get; set; }
            public string ma_dk { get; set; }
            public string email { get; set; }
            public string phone { get; set; }
            public string meeting_code { get; set; }
            public string image_url { get; set; }
            public string gender { get; set; }
            public string role { get; set; }
            public string birthday { get; set; }
            public string training_code { get; set; }
            public string identification_address { get; set; }
            public string name_course { get; set; }
            public string code_course { get; set; }
            public string date_start { get; set; }
            public string img_school { get; set; }
            public string block_subject_showtime { get; set; }
            public string opening_day { get; set; }
            public string closing_day { get; set; }
            public string daily_study_time { get; set; }
            public string allow_takePicture { get; set; }
            public string version { get; set; }
            public object join_date { get; set; }
            public string last_login { get; set; }
        }

    }
}
