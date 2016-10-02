using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Json;
using Microsoft.Win32;
using System.Net;
using System.Runtime.InteropServices.ComTypes;
using System.Threading;

namespace Data_Collector_Win_Form_ver
{    
    public class OS_Information
    {        
        static CPUUsage cpuUsage = new CPUUsage();
        static SystemCoreCpu systemCoreCpu = new SystemCoreCpu();
        public JsonObjectCollection getData()
        {
            try
            {
                //systemCoreCpu.prepare();                
                SYSTEM_CORE_CPU_USAGE temp = systemCoreCpu.GetSystemCpuUsage();
                JsonObjectCollection returnObj = new JsonObjectCollection();            //값을 반환 시킬 JSON 객체
                returnObj.Name = "OS_Information";
                returnObj.Add(new JsonStringValue("Server_Name", get_Server_Name()));
                returnObj.Add(new JsonStringValue("OS_Name", get_OS_Name()));
                returnObj.Add(new JsonStringValue("User_Name", get_User_Name()));
                returnObj.Add(new JsonStringValue("IP_Address", get_IP_Address()));
                returnObj.Add(new JsonStringValue("CPU_Total", temp.allCpuUsage.ToString()));
                returnObj.Add(new JsonStringValue("CPU_Idle_Usage", temp.allIdleUsage.ToString()));
                returnObj.Add(new JsonStringValue("CPU_Kernel_Usage", temp.allKernelUsage.ToString()));
                returnObj.Add(new JsonStringValue("CPU_User_Usage", temp.allUserUsage.ToString()));
                returnObj.Add(new JsonStringValue("CPU_Core_Count", temp.number_of_Core.ToString()));
                JsonArrayCollection coreObj = new JsonArrayCollection();
                coreObj.Name = "CPU_Core_Info";
                for(int i = 0; i < temp.number_of_Core; i++)
                {
                    JsonObjectCollection aCore = new JsonObjectCollection();
                    aCore.Add(new JsonStringValue("Core_Name", temp.coreName[i]));
                    aCore.Add(new JsonStringValue("Core_Total", temp.totalUsage_per_Core[i].ToString()));
                    aCore.Add(new JsonStringValue("Core_Idle_Usage", temp.idleUsage_per_Core[i].ToString()));
                    aCore.Add(new JsonStringValue("Core_User_Usage", temp.userUsage_per_Core[i].ToString()));
                    aCore.Add(new JsonStringValue("Core_Kernel_Usage", temp.kernelUsage_per_Core[i].ToString()));
                    coreObj.Add(aCore);
                }
                returnObj.Add(coreObj);
                returnObj.Add(new JsonStringValue("OS_Memory", get_Memory_Usage()));

                return returnObj;
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        //OS Server Name
        private static string get_Server_Name()
        {
            return Environment.UserDomainName.ToString();
        }
        //OS Name
        private static string get_OS_Name()
        {
            return Registry.GetValue(@"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\", "ProductName", "").ToString();
        }
        //User Name
        private static string get_User_Name()
        {
            return Environment.UserName.ToString();
        }
        //IP Address
        private static string get_IP_Address()
        {
            IPHostEntry host = Dns.GetHostEntry(Dns.GetHostName());
            string _ClientIP = string.Empty;
            for(int i = 0; i < host.AddressList.Length; i++)
            {
                if (host.AddressList[i].AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                    _ClientIP = host.AddressList[i].ToString();
            }
            return _ClientIP;
        }
        //Memory Usage
        private static string get_Memory_Usage()
        {
            MEMORYSTATUSEX memstate = MemoryUsage.GlobalMemoryStatusEx();
            return (string.Format("{0:F2}", (memstate.ullTotalPhys - memstate.ullAvailPhys) / 1024 / 1024));
        }
        //CPU Usage
        //private static string get_CPU_Usage()
        //{
        //    //float _cpuUsage = cpuUsage.get_CPU_Usage();
        //    //return string.Format("{0:F2}", _cpuUsage);            
        //}
    }
}
