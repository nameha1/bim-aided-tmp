import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HolidayCalendar = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const holidays = {
    2025: {
      '1-1': { name: 'New Year' },
      '2-15': { name: 'Shab-e-Barat' },
      '2-21': { name: "Martyr's Day" },
      '3-26': { name: 'Independence Day' },
      '3-28': { name: 'Jumatul Bidah' },
      '3-31': { name: 'Eid-ul-Fitr*', isMoonSighting: true },
      '4-1': { name: 'Eid-ul-Fitr*', isMoonSighting: true },
      '4-2': { name: 'Eid-ul-Fitr*', isMoonSighting: true },
      '4-14': { name: 'Pahela Baishakh' },
      '5-1': { name: 'May Day' },
      '5-11': { name: 'Buddha Purnima' },
      '6-5': { name: 'Eid-ul-Adha*', isMoonSighting: true },
      '6-6': { name: 'Eid-ul-Adha*', isMoonSighting: true },
      '6-7': { name: 'Eid-ul-Adha*', isMoonSighting: true },
      '6-8': { name: 'Eid-ul-Adha*', isMoonSighting: true },
      '6-9': { name: 'Eid-ul-Adha*', isMoonSighting: true },
      '6-10': { name: 'Eid-ul-Adha*', isMoonSighting: true },
      '7-6': { name: 'Ashura' },
      '8-16': { name: 'Janmashtami' },
      '10-1': { name: 'Durga Puja' },
      '10-2': { name: 'Bijoya Dashami' },
      '12-16': { name: 'Victory Day' },
      '12-25': { name: 'Xmas' },
      '12-27': { name: 'Rescheduled', isRescheduled: true },
    },
    2026: {
      '1-1': { name: 'New Year' },
      '2-4': { name: 'Shab-e-Barat' },
      '2-21': { name: "Martyr's Day" },
      '3-18': { name: 'Laylat al-Qadr' },
      '3-20': { name: 'J. Bidah & Eid' },
      '3-21': { name: 'Eid-ul-Fitr' },
      '3-22': { name: 'Eid-ul-Fitr Holiday' },
      '3-26': { name: 'Independence Day' },
      '4-14': { name: 'Pahela Baishakh' },
      '5-1': { name: 'May Day & Buddha Purnima' },
      '5-27': { name: 'Eid-ul-Adha' },
      '5-28': { name: 'Eid-ul-Adha Holiday' },
      '5-29': { name: 'Eid-ul-Adha Holiday' },
      '6-26': { name: 'Ashura' },
      '8-24': { name: 'Janmashtami' },
      '8-25': { name: 'Eid-e-Milad-un-Nabi' },
      '10-21': { name: 'Bijoya Dashami' },
      '12-16': { name: 'Victory Day' },
      '12-25': { name: 'Xmas' }
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderMonth = (month: number, year: number) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[80px] bg-muted/30 border border-border"></div>
      );
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(year, month, day).getDay();
      const isFriday = dayOfWeek === 5;
      const dateKey = `${month + 1}-${day}`;
      const holiday = holidays[year as keyof typeof holidays]?.[dateKey as keyof typeof holidays[2025]];
      const isCombined = isFriday && holiday;
      const isRescheduled = holiday && (holiday as any).isRescheduled;

      let bgColor = "bg-background";
      let labelColor = "";
      let label = "";

      if (isRescheduled) {
        bgColor = "bg-green-100 dark:bg-green-950/30";
        labelColor = "text-green-600 dark:text-green-400";
        label = (holiday as any).name;
      } else if (isCombined) {
        bgColor = "bg-amber-100 dark:bg-amber-950/30";
        labelColor = "text-amber-600 dark:text-amber-500";
        label = (holiday as any).name;
      } else if (holiday) {
        bgColor = "bg-red-100 dark:bg-red-950/30";
        labelColor = "text-red-600 dark:text-red-400";
        label = (holiday as any).name;
      } else if (isFriday) {
        bgColor = "bg-blue-100 dark:bg-blue-950/30";
        labelColor = "text-blue-600 dark:text-blue-400";
        label = "WKND";
      }

      days.push(
        <div 
          key={day} 
          className={`relative min-h-[80px] border border-border p-2 ${bgColor} flex flex-col justify-between`}
        >
          <div className="text-lg font-semibold text-foreground">{day}</div>
          {label && (
            <div className={`text-[0.65rem] font-medium ${labelColor} leading-tight`}>
              {label}
            </div>
          )}
        </div>
      );
    }

    return (
      <Card className="overflow-hidden">
        <div className="bg-muted text-center py-3 font-semibold text-lg">
          {monthNames[month]} {year}
        </div>
        <div className="grid grid-cols-7 bg-card/50 font-semibold text-center text-xs py-2">
          {dayNames.map((name) => (
            <div key={name}>{name}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">BIMaided Annual Holiday Calendar</h2>
          <p className="text-sm text-muted-foreground">Public and Company Holidays</p>
        </div>
        <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <Card className="p-4 bg-muted/50">
        <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold mb-3">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500"></span>
            Government Holiday
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-500"></span>
            Company Weekend (Friday)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-500"></span>
            Combined Holiday
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-500"></span>
            Rescheduled Holiday
          </span>
        </div>
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>*Asterisk indicates holidays that are subject to the sighting of the moon.</p>
          <p className="font-medium text-foreground">
            All holidays are subject to changes announced by the Government of Bangladesh.
          </p>
          {selectedYear === 2025 && (
            <p className="font-medium text-foreground">
              Note: The holiday originally on September 6, 2025 has been rescheduled to December 27, 2025.
            </p>
          )}
        </div>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i}>{renderMonth(i, selectedYear)}</div>
        ))}
      </div>
    </div>
  );
};

export default HolidayCalendar;
