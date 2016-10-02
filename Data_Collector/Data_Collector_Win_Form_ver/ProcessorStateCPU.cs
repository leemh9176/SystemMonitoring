using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.InteropServices;
using System.Diagnostics;

namespace Data_Collector_Win_Form_ver
{
    public class ProcessorStateCPU
    {
        public const int DETAIL_LEN = 4;

        //long[] sysOldCpuDetail = null;

        int _coreCpuCount = 0;
        int _cpuCount = 0;
        int _htCount = 0;

        public int TotalCpuCoreCount
        {
            get { return _htCount; }
        }

        SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION[] _cpuCoreInfo;
        public SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION[] CpuCoreInfo
        {
            get { return _cpuCoreInfo; }
        }

        GCHandle _pinnedCpuCoreInfo;
        IntPtr _pCpuCoreInfo;
        int _coreInfoStructLength;
        int _sizeOfCpuCoreInfo;

        [DllImport("ntdll.dll")]
        public static extern NtStatus NtQuerySystemInformation(SYSTEM_INFORMATION_CLASS InfoClass, IntPtr info, int Size, ref int Length);

        public ProcessorStateCPU()
        {
            CPUUsage.GetCoreCount(out _cpuCount, out _coreCpuCount, out _htCount);

            _coreInfoStructLength = Marshal.SizeOf(typeof(SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION));
            _sizeOfCpuCoreInfo = _coreInfoStructLength * _htCount;

            _cpuCoreInfo = new SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION[_htCount];
            _pinnedCpuCoreInfo = GCHandle.Alloc(_cpuCoreInfo, GCHandleType.Pinned);
            _pCpuCoreInfo = _pinnedCpuCoreInfo.AddrOfPinnedObject();
        }

        ~ProcessorStateCPU()
        {
            if (_pinnedCpuCoreInfo.IsAllocated == true)
                _pinnedCpuCoreInfo.Free();
        }
        
        public SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION[] GetCoreCpuUsageInfo()
        {
            int needLength = 0;
            NtStatus ntstatus = NtQuerySystemInformation(SYSTEM_INFORMATION_CLASS.SystemProcessorPerformanceInformation
                , _pCpuCoreInfo, _sizeOfCpuCoreInfo, ref needLength);

            if((needLength % _coreInfoStructLength) != 0)
                return null;            
            if (ntstatus != 0)
                return null;

            return _cpuCoreInfo;
        }                
    }
}
