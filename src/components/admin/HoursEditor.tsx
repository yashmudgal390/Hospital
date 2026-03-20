"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

interface HoursEditorProps {
  value: string | null;
  onChange: (value: string) => void;
}

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export function HoursEditor({ value, onChange }: HoursEditorProps) {
  const [hours, setHours] = useState<Record<string, string>>({});

  useEffect(() => {
    if (value) {
      try {
        setHours(JSON.parse(value));
      } catch (e) {
        setHours({});
      }
    }
  }, [value]);

  const updateDay = (dayKey: string, newValue: string) => {
    const updated = { ...hours, [dayKey]: newValue };
    setHours(updated);
    onChange(JSON.stringify(updated));
  };

  const getDayValue = (dayKey: string) => {
    const val = hours[dayKey] || "9:00 AM - 5:00 PM";
    if (val === "Closed") return { isClosed: true, open: "09:00", close: "17:00" };
    
    // Attempt to parse "9:00 AM - 5:00 PM" loosely
    const parts = val.split(" - ");
    return { isClosed: false, open: parts[0] || "09:00", close: parts[1] || "17:00" };
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {DAYS.map((day) => {
        const { isClosed, open, close } = getDayValue(day.key);

        return (
          <div key={day.key} className="flex flex-wrap items-center justify-between gap-4 p-4 border border-brand-border rounded-xl bg-white hover:bg-brand-50 transition-colors">
            <div className="flex items-center gap-3 min-w-[120px]">
              <div className="p-2 rounded-lg bg-brand-100 text-brand-primary">
                <Clock className="h-4 w-4" />
              </div>
              <span className="font-semibold text-brand-text">{day.label}</span>
            </div>

            <div className="flex flex-1 items-center gap-6 justify-end">
              {!isClosed ? (
                <div className="flex items-center gap-2">
                  <Input 
                    id={`open-${day.key}`}
                    name={`open-${day.key}`}
                    type="text" 
                    value={open} 
                    onChange={(e) => updateDay(day.key, `${e.target.value} - ${close}`)}
                    className="w-32 h-10 rounded-lg text-sm"
                    placeholder="9:00 AM"
                  />
                  <span className="text-brand-muted">to</span>
                  <Input 
                    id={`close-${day.key}`}
                    name={`close-${day.key}`}
                    type="text" 
                    value={close} 
                    onChange={(e) => updateDay(day.key, `${open} - ${e.target.value}`)}
                    className="w-32 h-10 rounded-lg text-sm"
                    placeholder="5:00 PM"
                  />
                </div>
              ) : (
                <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 italic">
                  Closed Today
                </span>
              )}

              <div className="flex items-center gap-2 pl-4 border-l border-brand-border h-10">
                <Label htmlFor={`closed-${day.key}`} className="text-xs font-medium cursor-pointer">Closed</Label>
                <Switch 
                  id={`closed-${day.key}`}
                  name={`closed-${day.key}`}
                  checked={isClosed}
                  onCheckedChange={(checked) => {
                    updateDay(day.key, checked ? "Closed" : "9:00 AM - 5:00 PM");
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
