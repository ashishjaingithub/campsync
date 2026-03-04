'use client';

import React, { useState } from 'react';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { useAI } from '@/components/providers/AIProvider';
import { Send, Sparkles, Loader2, Wand2, Check, X, Eye, ExternalLink, MapPin, Plus } from 'lucide-react';
import { ScheduleEntry, Camp, ChildProfile } from '@/lib/types';
import { SUMMER_WEEKS } from '@/lib/constants';

export default function ChatPanel({ isSidebar = false }: { isSidebar?: boolean }) {
    const { messages, isLoading, sendMessage, setMessages } = useAI();
    const [input, setInput] = useState('');
    const [activeDiscovery, setActiveDiscovery] = useState<{ camp: Camp; childId: string } | null>(null);

    const {
        children,
        blackoutWeeks,
        schedule,
        proposeChanges,
        proposedEntries,
        applyProposedChanges: applyChanges,
        discardProposedChanges: discardChanges,
        addToSchedule
    } = useSchedule();

    // Helper to ensure URLs have a protocol for proper external linking
    const ensureProtocol = (url?: string) => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    // Helper to format an array of week indices into a readable date string
    const formatCampDates = (weekIndices: number[]) => {
        if (!weekIndices || weekIndices.length === 0) return 'Dates vary';

        const minIdx = Math.min(...weekIndices);
        const maxIdx = Math.max(...weekIndices);

        const startWeek = SUMMER_WEEKS.find(w => w.index === minIdx);
        const endWeek = SUMMER_WEEKS.find(w => w.index === maxIdx);

        if (!startWeek) return 'Dates vary';

        const startStr = new Date(startWeek.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        if (minIdx === maxIdx) {
            return startStr;
        } else if (endWeek) {
            const endDate = new Date(endWeek.startDate);
            endDate.setDate(endDate.getDate() + 4);
            const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return `${startStr} - ${endStr}`;
        }

        return 'Dates vary';
    };

    // Helper to parse plain text and render URLs as clickable links
    const renderMessageContent = (content: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return content.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline underline-offset-2 break-all font-medium">
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const handleApply = () => {
        applyChanges();
        setMessages(prev => [...prev, { role: 'assistant', content: "✅ Done! I've updated your schedule with those suggestions." }]);
    };

    const handleDiscard = () => {
        discardChanges();
        setMessages(prev => [...prev, { role: 'assistant', content: "No problem. I've discarded those suggestions." }]);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const content = input;
        setInput('');
        await sendMessage(content);
    };

    const handleAddDiscovery = (camp: Camp, childId: string, weekIndex: number) => {
        addToSchedule({ childId, campId: camp.id, weekIndex }, camp);
        setActiveDiscovery(null);
    };

    return (
        <div className={`flex flex-col h-full bg-white ${!isSidebar ? 'fixed bottom-8 right-8 w-96 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[600px] z-50' : ''}`}>
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles size={20} />
                    <h3 className="font-bold text-sm tracking-tight">AI Assistant</h3>
                </div>
                <div className="px-2 py-0.5 bg-white/20 rounded-md text-[9px] font-black uppercase tracking-wider">Gemini 2.5 Flash</div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {m.content && (
                            <div className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                ? 'bg-primary text-white rounded-tr-none ml-auto'
                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                }`}>
                                {renderMessageContent(m.content)}
                            </div>
                        )}

                        {m.discoveryResults && (
                            <div className="mt-3 w-full space-y-3">
                                {m.discoveryResults.map((camp) => (
                                    <div key={camp.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group/discovery">
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-slate-900 text-sm leading-tight pr-4">{camp.name}</h4>
                                                <a href={ensureProtocol(camp.website)} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors shrink-0">
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>

                                            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                                                {camp.description}
                                            </p>

                                            {camp.reviewSummary && (
                                                <div className="mb-3 bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex items-start gap-2">
                                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5 shrink-0">Reviews</span>
                                                    <p className="text-xs text-slate-600 italic leading-snug">{camp.reviewSummary}</p>
                                                </div>
                                            )}

                                            {(camp.applicationDeadline || camp.earlyBirdDeadline) && (
                                                <div className="mb-3 flex flex-col gap-1.5">
                                                    {camp.earlyBirdDeadline && (
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase tracking-wider shrink-0">Early Bird</span>
                                                            <span className="text-slate-600 font-medium truncate">Ends {camp.earlyBirdDeadline}</span>
                                                        </div>
                                                    )}
                                                    {camp.applicationDeadline && (
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[9px] font-black uppercase tracking-wider shrink-0">Due Date</span>
                                                            <span className="text-slate-600 font-medium truncate">{camp.applicationDeadline}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-slate-600 text-[10px] font-bold">
                                                    <MapPin size={10} /> {camp.location}
                                                </div>
                                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-slate-600 text-[10px] font-bold">
                                                    Age {camp.ageRange?.min}-{camp.ageRange?.max}
                                                </div>
                                                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-primary text-[10px] font-black w-full sm:w-auto">
                                                    {formatCampDates(camp.weeks)}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="text-sm font-black text-slate-800">
                                                    ${camp.price}
                                                </div>
                                                {children.length > 0 ? (
                                                    <button
                                                        onClick={() => setActiveDiscovery({ camp, childId: children[0].id })}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary transition-all active:scale-95"
                                                    >
                                                        <Plus size={12} /> Options
                                                    </button>
                                                ) : (
                                                    <div className="text-[10px] text-slate-400 font-bold italic">Add child profile first</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {m.proposedChanges && m.proposedChanges.length > 0 && (
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => proposeChanges(m.proposedChanges!)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <Eye size={12} className="text-primary" /> Preview Suggestions
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2 text-slate-400">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-xs font-medium">Assistant is thinking...</span>
                        </div>
                    </div>
                )}

                {/* Week Selection Modal Overlay */}
                {activeDiscovery && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-black text-slate-900 text-lg mb-1">Add to Schedule</h3>
                                <p className="text-xs text-slate-500 font-medium">Which week for <span className="text-primary font-bold">{activeDiscovery.camp.name}</span>?</p>
                            </div>

                            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {children.map((child: ChildProfile) => (
                                        <button
                                            key={child.id}
                                            onClick={() => setActiveDiscovery({ ...activeDiscovery, childId: child.id })}
                                            className={`p-2 rounded-xl text-[10px] font-black border-2 transition-all ${activeDiscovery.childId === child.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400'}`}
                                        >
                                            {child.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="h-px bg-slate-100 my-4" />
                                <div className="grid grid-cols-1 gap-1">
                                    {SUMMER_WEEKS.map((week: { index: number; label: string; startDate: string }) => {
                                        const isBlackout = blackoutWeeks.includes(week.index);
                                        const isOccupied = schedule.some((s: ScheduleEntry) => s.childId === activeDiscovery.childId && s.weekIndex === week.index);

                                        return (
                                            <button
                                                key={week.index}
                                                disabled={isBlackout}
                                                onClick={() => handleAddDiscovery(activeDiscovery.camp, activeDiscovery.childId, week.index)}
                                                className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${isBlackout ? 'opacity-30 cursor-not-allowed bg-slate-50' : 'hover:bg-primary/5 text-slate-700'}`}
                                            >
                                                <span>{week.label} ({new Date(week.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
                                                {isOccupied && <span className="text-[8px] text-amber-500 uppercase tracking-widest font-black">Replace</span>}
                                                {!isOccupied && !isBlackout && <Plus size={14} className="text-slate-300" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => setActiveDiscovery(null)}
                                    className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Suggestion Overlay at bottom of chat */}
                {proposedEntries.length > 0 && (
                    <div className="sticky bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-md border border-primary/20 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg">
                                    <Wand2 size={14} className="text-primary" />
                                </div>
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{proposedEntries.length} SUGGESTIONS</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDiscard}
                                    className="p-1 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Check size={14} /> Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isLoading ? "Searching nationwide & synthesizing reviews..." : "e.g. Highly rated overnight coding camps in Texas..."}
                    disabled={isLoading}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
