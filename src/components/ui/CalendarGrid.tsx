'use client';

import React from 'react';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { SUMMER_WEEKS } from '@/lib/constants';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, CheckCircle, Wand2 } from 'lucide-react';
import { scheduleService } from '@/lib/ScheduleService';
import { Trash2 } from 'lucide-react';

export default function CalendarGrid() {
    const {
        children,
        blackoutWeeks,
        schedule,
        proposedEntries,
        uploadedCamps,
        addToSchedule,
        removeFromSchedule,
        zipCode
    } = useSchedule();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && over.id.toString().startsWith('slot-')) {
            const [childId, weekIndex] = over.id.toString().replace('slot-', '').split('-');
            const campId = active.id.toString();
            addToSchedule({ childId, campId, weekIndex: parseInt(weekIndex) });
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight text-primary">Summary</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Interactive Calendar</p>
                </div>
                <div className="flex gap-4 items-center">
                    {proposedEntries.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                            <Wand2 size={12} /> {proposedEntries.length} Draft Suggestions
                        </div>
                    )}
                    {scheduleService.validateSchedule(schedule).length > 0 ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                            <Plus size={12} className="rotate-45" /> {scheduleService.validateSchedule(schedule).length} Conflicts
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle size={12} /> Conflict Free
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                    {/* Header Row: Weeks */}
                    <div className="grid grid-cols-11 border-b border-slate-100 bg-white">
                        <div className="p-4 border-r border-slate-100 font-bold text-slate-400 text-[10px] uppercase tracking-widest flex items-center justify-center bg-slate-50/30">
                            Member
                        </div>
                        {SUMMER_WEEKS.map((week) => (
                            <div
                                key={week.index}
                                className={`p-4 text-center border-r border-slate-100 last:border-0 ${blackoutWeeks.includes(week.index) ? 'bg-slate-50 opacity-40' : ''}`}
                            >
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{week.label}</p>
                                <p className="text-[10px] font-bold text-slate-800 leading-none">{new Date(week.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            </div>
                        ))}
                    </div>

                    {/* Data Rows: Children */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragEnd={handleDragEnd}
                    >
                        {children.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="bg-slate-100 inline-flex p-6 rounded-3xl mb-4 border border-slate-200">
                                    <Plus size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No children profiles found</h3>
                                <p className="text-slate-400 text-sm">Add profiles in the configuration sidebar to begin planning.</p>
                            </div>
                        ) : (
                            children.map((child) => (
                                <div key={child.id} data-child-name={child.name} className="grid grid-cols-11 border-b border-slate-100 last:border-0 group">
                                    {/* Name Cell */}
                                    <div className="p-4 border-r border-slate-100 bg-slate-50/20 group-hover:bg-primary/5 transition-colors flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 bg-white border border-slate-200 text-primary shadow-sm rounded-xl flex items-center justify-center font-black mb-1 group-hover:bg-primary group-hover:text-white transition-all">
                                            {child.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-slate-800 text-xs truncate w-full text-center px-1">{child.name}</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Age {child.age}</span>
                                    </div>

                                    {/* Week Cells */}
                                    {SUMMER_WEEKS.map((week) => {
                                        const entries = schedule.filter(s => s.childId === child.id && s.weekIndex === week.index);
                                        const proposedEntriesForWeek = proposedEntries.filter(s => s.childId === child.id && s.weekIndex === week.index);
                                        const allEntries = [...entries, ...proposedEntriesForWeek];
                                        const isBlackout = blackoutWeeks.includes(week.index);

                                        return (
                                            <div
                                                key={week.index}
                                                data-week-index={week.index}
                                                data-child-id={child.id}
                                                className={`p-2 border-r border-slate-100 last:border-0 min-h-[140px] transition-colors flex flex-col gap-2 ${isBlackout ? 'bg-slate-100/50 cursor-not-allowed' : 'hover:bg-slate-50/50'}`}
                                            >
                                                {isBlackout ? (
                                                    <div className="h-full flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-slate-200 uppercase rotate-90 whitespace-nowrap tracking-widest leading-none">Blackout</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {allEntries.map((e, idx) => {
                                                            const camp = uploadedCamps.find(c => c.id === e.campId);
                                                            if (!camp) return null;
                                                            const isProposed = proposedEntriesForWeek.includes(e);
                                                            return (
                                                                <div key={idx} className="relative group/card h-[60px]">
                                                                    <div className={`p-2 rounded-xl shadow-sm h-full text-[10px] font-bold flex flex-col justify-between transition-all cursor-pointer ${!isProposed ? 'bg-primary text-white shadow-primary/20' : 'bg-white border-2 border-dashed border-primary/40 text-primary opacity-60 hover:opacity-100'}`}>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="truncate leading-tight pr-2">{camp.name}</span>
                                                                            {!isProposed ? (
                                                                                <button
                                                                                    onClick={() => removeFromSchedule(child.id, week.index)}
                                                                                    className="bg-white text-primary border border-slate-200 rounded-full p-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                                                                >
                                                                                    <Plus size={8} className="rotate-45" />
                                                                                </button>
                                                                            ) : <Wand2 size={8} className="shrink-0" />}
                                                                        </div>
                                                                        <p className="text-[8px] opacity-70 truncate">${camp.price} • {camp.location}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {allEntries.length === 0 && (
                                                            <div className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-100 rounded-2xl group/slot hover:border-primary/20 transition-all bg-white/50 overflow-hidden min-h-[60px]">
                                                                <div className="flex flex-col items-center opacity-0 group-hover/slot:opacity-100 transition-opacity text-center px-1 gap-1">
                                                                    {scheduleService.getSuggestions({ children, blackoutWeeks, schedule, uploadedCamps, zipCode }, child.id, week.index).slice(0, 2).map((suggestion) => (
                                                                        <div
                                                                            key={suggestion.id}
                                                                            onClick={() => addToSchedule({ childId: child.id, campId: suggestion.id, weekIndex: week.index })}
                                                                            className="p-1 bg-slate-100 text-slate-600 text-[8px] rounded-lg font-black uppercase cursor-pointer hover:bg-primary hover:text-white transition-all"
                                                                        >
                                                                            + {suggestion.name}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {allEntries.length > 0 && allEntries.length < 2 && (
                                                            <div className="mt-2 border-t border-slate-100 pt-2 transition-opacity">
                                                                {scheduleService.getSuggestions({ children, blackoutWeeks, schedule, uploadedCamps, zipCode }, child.id, week.index).slice(0, 1).map((suggestion) => (
                                                                    <div
                                                                        key={suggestion.id}
                                                                        onClick={() => addToSchedule({ childId: child.id, campId: suggestion.id, weekIndex: week.index })}
                                                                        data-testid="also-suggest-btn"
                                                                        className="p-1 bg-slate-50 text-slate-400 text-[7px] rounded-lg font-bold border border-slate-100 uppercase cursor-pointer hover:bg-primary hover:text-white transition-all text-center"
                                                                    >
                                                                        + Suggest: {suggestion.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </DndContext>
                </div>
            </div>
        </div>
    );
}
