using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.InteropServices.ComTypes;
using System.Diagnostics;

namespace Data_Collector_Win_Form_ver
{
    class ProcessCPUUsage
    {
        [System.Runtime.InteropServices.DllImport("kernel32.dll", SetLastError = true)]
        static extern bool GetSystemTimes(out FILETIME lpIdleTime, out FILETIME lpKernelTime, out FILETIME lpUserTime);

        ProcessesTime[] _ProcessesTime = new ProcessesTime[32800];
        int id;

        public ProcessCPUUsage()
        {
            //_ProcessesTime[id]._prevProcTotal = TimeSpan.MinValue;
        }

        public float GetProcessCPUUsage(Process process, int _id, bool flag)
        {
            this.id = _id;
            if(flag == false)
            {
                _ProcessesTime[id]._prevProcTotal = TimeSpan.MinValue;
            }
            float _processCpuUsage = 0.0f;
            FILETIME sysIdle, sysKernel, sysUser;

            TimeSpan _currentProcessTime = process.TotalProcessorTime;

            if (!GetSystemTimes(out sysIdle, out sysKernel, out sysUser))
                return 0.0f;

            if (_ProcessesTime[id]._prevProcTotal != TimeSpan.MinValue)
            {
                ulong sysKernelDiff = SubtractTimes(sysKernel, _ProcessesTime[id]._prevSysKernel);
                ulong sysUserDiff = SubtractTimes(sysUser, _ProcessesTime[id]._prevSysUser);
                ulong sysIdleDiff = SubtractTimes(sysIdle, _ProcessesTime[id]._prevSysIdle);

                ulong sysTotal = sysKernelDiff + sysUserDiff;
                long kernelTotal = (long)(sysKernelDiff - sysIdleDiff);

                if (kernelTotal < 0)
                {
                    kernelTotal = 0;
                }

                long processTotalTime = (_currentProcessTime.Ticks - _ProcessesTime[id]._prevProcTotal.Ticks);

                if (sysTotal > 0)
                {
                    _processCpuUsage = (float)((100.0 * processTotalTime) / sysTotal);
                }
            }

            _ProcessesTime[id]._processName = process.ProcessName;
            _ProcessesTime[id]._prevProcTotal = _currentProcessTime;
            _ProcessesTime[id]._prevSysKernel = sysKernel;
            _ProcessesTime[id]._prevSysUser = sysUser;
            _ProcessesTime[id]._prevSysIdle = sysIdle;
            
            return _processCpuUsage;
        }

        private UInt64 SubtractTimes(FILETIME a, FILETIME b)
        {
            ulong aInt = ((ulong)a.dwHighDateTime << 32) | (uint)a.dwLowDateTime;
            ulong bInt = ((ulong)b.dwHighDateTime << 32) | (uint)b.dwLowDateTime;

            return aInt - bInt;
        }
    }
}
