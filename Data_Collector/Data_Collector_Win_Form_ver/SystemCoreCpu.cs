using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data_Collector_Win_Form_ver
{
    public class SystemCoreCpu
    {
        static ProcessorStateCPU impl;

        static int _cpuCoreCount;
        static double[] _cpuIdleTimeOld;
        static double[] _cpuKernelTimeOld;
        static double[] _cpuUserTimeOld;

        public bool prepare()
        {
            impl = new ProcessorStateCPU();

            _cpuCoreCount = impl.TotalCpuCoreCount;

            _cpuIdleTimeOld = new double[_cpuCoreCount];
            _cpuKernelTimeOld = new double[_cpuCoreCount];
            _cpuUserTimeOld = new double[_cpuCoreCount];

            SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION[] infos = impl.GetCoreCpuUsageInfo();

            for(int i = 0; i < _cpuCoreCount; i++)
            {
                SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION aCore = infos[i];
                _cpuIdleTimeOld[i] = aCore.IdleTime;
                _cpuKernelTimeOld[i] = aCore.KernelTime - aCore.IdleTime;
                _cpuUserTimeOld[i] = aCore.UserTime;
            }
            return true;
        }

        public SYSTEM_CORE_CPU_USAGE GetSystemCpuUsage()
        {
            //impl = new ProcessorStateCPU();
            SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION[] infos = impl.GetCoreCpuUsageInfo();
            SYSTEM_CORE_CPU_USAGE result = new SYSTEM_CORE_CPU_USAGE();

            double pureKernelDiff = 0;
            
            double idleDiff = 0;
            double kernelDiff = 0;
            double userDiff = 0;
            double totalDiff = 0;

            double[] totalUsage = new double[_cpuCoreCount];
            double[] idleUsage = new double[_cpuCoreCount];
            double[] userUsage = new double[_cpuCoreCount];
            double[] kernelUsage = new double[_cpuCoreCount];
            
            double accIdle = 0;
            double accUser = 0;
            double accTotal = 0;

            string[] cpuName = new string[_cpuCoreCount];

            for(int i = 0; i < _cpuCoreCount; i++)
            {
                SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION aCore = infos[i];

                pureKernelDiff = (aCore.KernelTime - aCore.IdleTime);

                idleDiff = aCore.IdleTime - _cpuIdleTimeOld[i];
                kernelDiff = pureKernelDiff - _cpuKernelTimeOld[i];
                userDiff = aCore.UserTime - _cpuUserTimeOld[i];

                _cpuIdleTimeOld[i] = aCore.IdleTime;
                _cpuKernelTimeOld[i] = pureKernelDiff;
                _cpuUserTimeOld[i] = aCore.UserTime;

                totalDiff = idleDiff + kernelDiff + userDiff;
                if (totalDiff == 0) { Console.WriteLine("totalDiff is zero"); return result; }

                idleUsage[i] = Math.Round((idleDiff * 100) / totalDiff, 2);
                userUsage[i] = Math.Round((userDiff * 100) / totalDiff, 2);
                kernelUsage[i] = Math.Round(100 - idleUsage[i] - userUsage[i], 2);
                totalUsage[i] = userUsage[i] + kernelUsage[i];
                cpuName[i] = "CPU" + i;

                accIdle += idleDiff;
                accUser += userDiff;
                accTotal += totalDiff;
            }

            result.allIdleUsage = Math.Round(accIdle * 100 / accTotal, 2);
            result.allUserUsage = Math.Round(accUser * 100 / accTotal, 2);
            result.allKernelUsage = Math.Round(100 - result.allIdleUsage - result.allUserUsage, 2);
            result.allCpuUsage = result.allKernelUsage + result.allUserUsage;
            result.number_of_Core = _cpuCoreCount;
            result.coreName = cpuName;
            result.totalUsage_per_Core = totalUsage;
            result.idleUsage_per_Core = idleUsage;
            result.kernelUsage_per_Core = kernelUsage;
            result.userUsage_per_Core = userUsage;

            return result;
        }
    }
}
