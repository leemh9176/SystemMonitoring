using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Json;

namespace Data_Collector_Win_Form_ver
{
    class DataTime
    {
        public JsonObjectCollection getData()
        {
            try
            {
                JsonObjectCollection returnObj = new JsonObjectCollection();
                returnObj.Name = "DataTime";
                returnObj.Add(new JsonStringValue("DataTime", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")));
                //Console.WriteLine(DateTime.Now.ToString("yyyyMMddHHmmss"));                

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
