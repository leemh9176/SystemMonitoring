using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Sockets;
using System.Diagnostics;
using System.Management;
using System.Net.Json;

namespace Data_Collector_Win_Form_ver
{
    class Data_Collect
    {
        OS_Information os_info = new OS_Information();
        Process_Information proc_info = new Process_Information();
        DataTime datatime = new DataTime();
        public JsonObjectCollection Collection(string id, string pw)
        {
            try
            {
                JsonObjectCollection returnObj = new JsonObjectCollection();
                JsonObjectCollection user = new JsonObjectCollection();
                user.Name = "User";
                user.Add(new JsonStringValue("id", id));
                user.Add(new JsonStringValue("pw", pw));
                returnObj.Add(user);
                returnObj.Add(datatime.getData());          //시간 데이터 수집
                returnObj.Add(os_info.getData());           //전체 시스템 데이터 수집
                returnObj.Add(proc_info.getData());         //프로세스별 데이터 수집
                return returnObj;   
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }
    }
}
