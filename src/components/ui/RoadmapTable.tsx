'use client';

import React from 'react';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { ExternalLink, MapPin, DollarSign, Info } from 'lucide-react';

export default function RoadmapTable() {
    const { schedule, uploadedCamps, children, isLoaded } = useSchedule();

    if (!isLoaded || uploadedCamps.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Info className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Items in Roadmap</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Upload some camps and add them to your schedule to see a detailed breakdown here.</p>
            </div>
        );
    }

    // Prepare data
    const tableData = schedule.map(entry => {
        const child = children.find(c => c.id === entry.childId);
        const camp = uploadedCamps.find(c => c.id === entry.campId);
        return {
            ...entry,
            childName: child?.name || 'Unknown',
            campName: camp?.name || 'Missing Camp',
            location: camp?.location || 'Unknown',
            price: camp?.price || 0,
            tags: camp?.tags || [],
            website: '#', // Placeholder
        };
    }).sort((a, b) => a.weekIndex - b.weekIndex || a.childName.localeCompare(b.childName));

    const totalPrice = tableData.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Summer Roadmap</h2>
                    <p className="text-sm text-slate-500 font-medium">Detailed logistics and financial summary.</p>
                </div>
                <div className="bg-success/10 border border-success/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                    <DollarSign className="text-success" size={18} />
                    <span className="text-lg font-black text-success-dark tracking-tight">Total: ${totalPrice}</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Week</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Child</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Camp</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Category</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Location</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Price</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No camps scheduled yet.</td>
                            </tr>
                        ) : (
                            tableData.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0 group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">Week {item.weekIndex + 1}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">July {item.weekIndex + 7}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-black rounded-lg uppercase">
                                            {item.childName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                                            {item.campName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.tags.slice(0, 2).map((tag, tIdx) => (
                                                <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                            <MapPin size={14} className="text-slate-300" />
                                            {item.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-slate-700">${item.price}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <a
                                            href={item.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                        >
                                            Website <ExternalLink size={12} />
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
