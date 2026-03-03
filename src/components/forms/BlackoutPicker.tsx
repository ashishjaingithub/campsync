'use client';

import React from 'react';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { SUMMER_WEEKS } from '@/lib/constants';
import { CalendarOff } from 'lucide-react';

export default function BlackoutPicker() {
    const { blackoutWeeks, toggleBlackoutWeek } = useSchedule();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <CalendarOff className="text-secondary" size={20} />
                Blackout Dates
            </h3>
            <p className="text-sm text-slate-500 mb-4">
                Select weeks when your family is traveling or unavailable. We won&apos;t suggest camps for these dates.
            </p>
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
                {SUMMER_WEEKS.map((week) => (
                    <button
                        key={week.index}
                        onClick={() => toggleBlackoutWeek(week.index)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${blackoutWeeks.includes(week.index)
                            ? 'bg-secondary/10 border-secondary text-secondary'
                            : 'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'
                            }`}
                    >
                        <span className="text-xs font-bold uppercase tracking-tight">{week.label}</span>
                        <span className="text-[10px] opacity-70">Starts {new Date(week.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
