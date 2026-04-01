using System;
using System.Collections.Generic;

namespace localink_be.Models.DTOs
{
    public class BusinessHoursDto
    {
        public List<DayHoursDto> Days { get; set; }
    }

    public class DayHoursDto
    {
        public string DayOfWeek { get; set; }
        public string Mode { get; set; }
        public List<TimeSlotDto> Slots { get; set; }
    }

    public class TimeSlotDto
    {
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
    }
}
