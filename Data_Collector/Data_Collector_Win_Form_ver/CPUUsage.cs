using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.InteropServices;
using System.Diagnostics;
using System.ComponentModel;

namespace Data_Collector_Win_Form_ver
{
    enum PROCESSOR_CACHE_TYPE
    {
        Unified = 0,
        Instruction = 1,
        Data = 2,
        Trace = 3
    }

    [StructLayout(LayoutKind.Sequential)]
    struct CACHE_DESCRIPTOR
    {
        public byte Level;
        public byte Associativity;
        public ushort LineSize;
        public uint Size;
        public PROCESSOR_CACHE_TYPE Type;
    }

    [StructLayout(LayoutKind.Explicit)]
    unsafe struct ProcessorRelationUnion
    {
        [FieldOffset(0)]
        public fixed ulong reserved[2];
        [FieldOffset(0)]
        public CACHE_DESCRIPTOR Cache;
        [FieldOffset(0)]
        public uint NumaNodeNumber;
        [FieldOffset(0)]
        public byte ProcessorCoreFlags;
    }

    enum LOGICAL_PROCESSOR_RELATIONSHIP : uint
    {
        ProcessorCore = 0,
        NumaNode = 1,
        RelationCache = 2,
        RelationProcessorPackage = 3
    }

    [StructLayout(LayoutKind.Sequential)]
    struct SYSTEM_LOGICAL_PROCESSOR_INFORMATION
    {
        public UIntPtr ProcessorMask;
        public LOGICAL_PROCESSOR_RELATIONSHIP Relationship;
        public ProcessorRelationUnion RelationUnion;
    }

    class CPUUsage
    {
        [DllImport("kernel32.dll", SetLastError = true)]
        static unsafe extern bool GetLogicalProcessorInformation(SYSTEM_LOGICAL_PROCESSOR_INFORMATION* buffer, ref int length);

        //ulong _lastKernel, _lastIdle, _lastUser;

        static int _coreCount = 0;
        static int _cpuCount = 0;
        static int _htLogicalCoreCount = 0;

        public static SYSTEM_LOGICAL_PROCESSOR_INFORMATION[] GetLogicalProcessorInformation()
        {
            unsafe
            {
                int length = 0;

                GetLogicalProcessorInformation(null, ref length);
                if (length == 0)
                    return new SYSTEM_LOGICAL_PROCESSOR_INFORMATION[0];

                int count = length / sizeof(SYSTEM_LOGICAL_PROCESSOR_INFORMATION);
                SYSTEM_LOGICAL_PROCESSOR_INFORMATION[] array = new SYSTEM_LOGICAL_PROCESSOR_INFORMATION[count];

                bool result;
                fixed (SYSTEM_LOGICAL_PROCESSOR_INFORMATION* array_pinned = &array[0])
                {
                    int length2 = sizeof(SYSTEM_LOGICAL_PROCESSOR_INFORMATION) * count;
                    result = GetLogicalProcessorInformation(array_pinned, ref length2);
                }
                if (result)
                    return array;
                else
                    throw new Exception("Failed to query logical processor information.",
                        new Win32Exception(Marshal.GetLastWin32Error()));
            }
        }

        public static void GetCoreCount(out int cpuCount, out int coreCount, out int htLogicalCoreCount)
        {
            int count = 0;
            cpuCount = coreCount = htLogicalCoreCount = 0;

            if (_coreCount == 0)
            {
                SYSTEM_LOGICAL_PROCESSOR_INFORMATION[] logical_info = GetLogicalProcessorInformation();
                for (int i = 0; i < logical_info.Length; i++)
                {
                    SYSTEM_LOGICAL_PROCESSOR_INFORMATION info = logical_info[i];

                    switch (info.Relationship)
                    {
                        case LOGICAL_PROCESSOR_RELATIONSHIP.ProcessorCore:
                            coreCount++;
                            htLogicalCoreCount += CountSetBits(info.ProcessorMask);
                            break;
                        case LOGICAL_PROCESSOR_RELATIONSHIP.RelationProcessorPackage:
                            cpuCount++;
                            break;
                    }
                    if (info.Relationship == LOGICAL_PROCESSOR_RELATIONSHIP.RelationProcessorPackage)
                        count++;
                }
                _coreCount = coreCount;
                _cpuCount = cpuCount;
                _htLogicalCoreCount = htLogicalCoreCount;

                return;
            }
            else
            {
                coreCount = _coreCount;
                cpuCount = _cpuCount;
                htLogicalCoreCount = _htLogicalCoreCount;
            }
        }

        static int CountSetBits(UIntPtr bitMask)
        {
            int LSHIFT = UIntPtr.Size * 8 - 1;
            int bitSetCount = 0;

            ulong bitTest = (ulong)1 << LSHIFT;
            ulong bitMask2 = bitMask.ToUInt64();

            for(int i = 0; i <= LSHIFT; i++)
            {
                ulong result = bitMask2 & bitTest;
                bitSetCount += (result != 0) ? 1 : 0;
                bitTest /= 2;
            }

            return (int)bitSetCount;
        }
    }
}
