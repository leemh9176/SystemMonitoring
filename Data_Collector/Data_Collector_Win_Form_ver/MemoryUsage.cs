using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.InteropServices;

namespace Data_Collector_Win_Form_ver
{
    public class MemoryUsage
    {
        [DllImport("kernel32", EntryPoint = "GetLastError")]
        private extern static int __GetLastError();
        [DllImport("Kernel32.dll", EntryPoint = "GlobalMemoryStatusEx", SetLastError = true)]
        private extern static bool __GlobalMemoryStatusEx(ref MEMORYSTATUSEX lpBuffer);
        
        public static MEMORYSTATUSEX GlobalMemoryStatusEx()
        {
            MEMORYSTATUSEX memstate = new MEMORYSTATUSEX();
            MEMORYSTATUSEX err = new MEMORYSTATUSEX();
            memstate.dwLength = (uint)Marshal.SizeOf(memstate);
            if(__GlobalMemoryStatusEx(ref memstate) == false)
            {
                int error = __GetLastError();
                return err;
            }
            return memstate;
        }
    }
}
