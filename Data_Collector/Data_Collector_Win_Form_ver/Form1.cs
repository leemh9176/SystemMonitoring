using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Net.Json;
using System.Net;
using System.Net.Sockets;
using MySql.Data;
using MySql.Data.MySqlClient;
using System.Threading;

namespace Data_Collector_Win_Form_ver
{
    public partial class Form1 : Form
    {
        static bool login_chk = false;
        static bool sending = false;
        //static string server = "192.168.0.173"; //Jennifer IP Server
        //static string server = "192.168.0.3";   //Home IP Server
        //static string server = "192.168.72.82";
        static string server = "192.168.0.20"; // Samsung Membership Wifi ip

        static Data_Collect data_collect = new Data_Collect();
        static SystemCoreCpu systemCoreCpu = new SystemCoreCpu();
        static JsonTextParser parser = new JsonTextParser();

        public Form1()
        {
            systemCoreCpu.prepare();
            InitializeComponent();
        }

        //중지 버튼
        private void Stop_btn_Click(object sender, EventArgs e)
        {
            sending = false;
            Send_btn.Enabled = true;
            Stop_btn.Enabled = false;
            program_status_txt.Text = "전송 중지 : " + System.DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss");
        }

        //로그인 버튼
        private void user_chk_btn_Click(object sender, EventArgs e)
        {
            if (!login_chk)
            {
                string id = user_id_txt.Text;
                string pw = user_pw_txt.Text;

                string mysql_connect = "Server=" + server + ";Port=3306;DataBase=user_sample;Uid=root;Pwd=111111";
                MySqlConnection connection = new MySqlConnection(mysql_connect);
                connection.Open();
                string sql = "SELECT * FROM user WHERE id='" + id + "'";
                try
                {
                    MySqlCommand cmd = new MySqlCommand(sql, connection);
                    MySqlDataReader reader = cmd.ExecuteReader();

                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            if (reader["pw"].ToString() != pw)
                            {
                                program_status_txt.Text = "비밀번호가 틀렸습니다.";
                            }
                            else
                            {
                                program_status_txt.Text = "Login Success";
                                user_chk_btn.Text = "로그아웃";
                                login_chk = true;
                                Send_btn.Enabled = true;
                            }
                        }
                    }
                    else
                    {
                        program_status_txt.Text = "아이디가 잘못 되었습니다.";
                    }
                    reader.Close();
                }
                catch (Exception ex)
                {
                    program_status_txt.Text = ex.ToString();
                }
            }
            else
            {
                user_id_txt.Text = "";
                user_pw_txt.Text = "";
                user_chk_btn.Text = "확인";
                Send_btn.Enabled = false;
                Stop_btn.Enabled = false;
                program_status_txt.Text = "로그아웃";
                login_chk = false;
            }
        }

        //전송 버튼
        private void Send_btn_Click(object sender, EventArgs e)
        {
            sending = true;
            if (sending)
            {
                Thread loopThread = new Thread(loop);
                loopThread.Start();
                Send_btn.Enabled = false;
                Stop_btn.Enabled = true;
            }
        }

        //전송 루프 함수
        private void loop()
        {
            try
            {
                while (sending)
                {
                    Thread clientThread = new Thread(Connection);
                    //clientThread.IsBackground = true;
                    clientThread.Start();
                    clientThread.Join();
                    Thread.Sleep(2000);
                }
            }
            catch (Exception ex)
            {
                program_status_txt.Text = "프로그램 오류\n";
                program_status_txt.Text += ex.ToString();
            }
            return;
        }

        //Tcp 통신 함수
        private void Connection()
        {
            string datetime = System.DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss");
            string id = user_id_txt.Text;
            string pw = user_pw_txt.Text;
            //string server = "192.168.71.11";
            int port = 28000;
            TcpClient client;
            try
            {
                client = new TcpClient(server, port);
                NetworkStream stream = client.GetStream();

                JsonObjectCollection jsonObj = new JsonObjectCollection();                
                jsonObj = data_collect.Collection(id, pw);
                

                program_status_txt.Text = "전송 중\r\n";
                program_status_txt.Text += datetime;

                byte[] data = Encoding.UTF8.GetBytes(jsonObj.ToString());
                stream.Write(data, 0, data.Length);
                
                stream.Close();
                client.Close();
            }
            catch(ArgumentNullException argEx)
            {
                program_status_txt.Text = "프로그램 오류 : "+ datetime +"\r\n";
                program_status_txt.Text += argEx.ToString();
            }
            catch(SocketException socketEx)
            {
                program_status_txt.Text = "전송 오류 : "+ datetime +"\r\n";
                program_status_txt.Text += socketEx.ToString();
            }
            return;
        }

        //종료 버튼
        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            if(MessageBox.Show("정말 종료합니까?", "종료", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                sending = false;
                Application.ExitThread();
                System.Diagnostics.Process.GetCurrentProcess().Kill();
                Application.Exit();
            }
            else
            {
                e.Cancel = true;
                return;
            }
        }
    }
}
