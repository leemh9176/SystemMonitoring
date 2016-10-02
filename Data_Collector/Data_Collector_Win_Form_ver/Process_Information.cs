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
    public class Process_Information
    {       
        static ProcessCPUUsage _processCPUUsage = new ProcessCPUUsage();
        static bool[] flag_arr = new bool[32800];
        static string[] process_name = new string[32800];
        public JsonArrayCollection getData()
        {
            JsonArrayCollection returnObj = new JsonArrayCollection();            
            returnObj.Name = "Processes_Information";
            Process[] allProcess = Process.GetProcesses();      //현 PC에 가동중인 전체 프로세스 가져오기
            //float total_mem = 0.0f;
            //float total_cpu = 0.0f;
            foreach (Process _process in allProcess)
            {
                try
                {
                    int id = _process.Id;
                    if (id == 0) continue;
                    bool flag;
                    JsonObjectCollection procInfo = new JsonObjectCollection();

                    //해당 프로세스 탐색 여부 확인
                    if (!flag_arr[id]) { flag = false; flag_arr[id] = true; process_name[id] = _process.ProcessName; }
                    else if (flag_arr[id] && process_name[id] != _process.ProcessName)
                    {
                        flag = false; flag_arr[id] = true; process_name[id] = _process.ProcessName;
                    }
                    else flag = true;

                    //프로세스 정보 구하기
                    float procCpuUsage = _processCPUUsage.GetProcessCPUUsage(_process, id, flag);
                    procInfo.Add(new JsonStringValue("Process_Name", _process.ProcessName));
                    procInfo.Add(new JsonStringValue("Process_ID", _process.Id.ToString()));
                    procInfo.Add(new JsonStringValue("Process_CPU", string.Format("{0:F2}", procCpuUsage)));
                    procInfo.Add(new JsonStringValue("Process_Memory", string.Format("{0:F2}", (float)_process.WorkingSet64 / (1024 * 1024))));
                    procInfo.Add(new JsonStringValue("Process_Threads", _process.Threads.Count.ToString()));
                    //total_mem += (float)((float)_process.WorkingSet64 / (1024 * 1024 * 1024));
                    //total_cpu += procCpuUsage;

                    returnObj.Add(procInfo);
                }
                catch(Exception e)
                {
                    continue;
                }
            }
            //Console.WriteLine("Process Total Memory : {0} GByte, Total cpu : {1} %", string.Format("{0:F2}", total_mem), string.Format("{0:F2}", total_cpu));
            return returnObj;
        }
    }
}
