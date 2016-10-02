using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Threading;

namespace Data_Collector_Win_Form_ver
{
    static class Program
    {
        /// <summary>
        /// 해당 응용 프로그램의 주 진입점입니다.
        /// </summary>
        [STAThread]
        static void Main()
        {
            bool createNew;
            Mutex dup = new Mutex(true, "Focus Exploerer Mutex", out createNew);    //Mutex 생성

            if (createNew)
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new Form1());
                dup.ReleaseMutex(); //Mutex 해제
            }
            else
            {
                //중복 실행 시
                MessageBox.Show("이미 프로그램이 실행 중입니다.", "Focus Explorer");
            }
        }
    }
}
