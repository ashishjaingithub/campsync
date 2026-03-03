'use client';

import React from 'react';
import CalendarGrid from '@/components/ui/CalendarGrid';
import ChatPanel from '@/components/ui/ChatPanel';
import RoadmapTable from '@/components/ui/RoadmapTable';
import ZipInput from '@/components/forms/ZipInput';
import ChildForm from '@/components/forms/ChildForm';
import BlackoutPicker from '@/components/forms/BlackoutPicker';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { AIProvider, useAI } from '@/components/providers/AIProvider';
import { MOCK_CAMPS } from '@/lib/mockData';
import { Sparkles, ShieldCheck, Settings2, Sparkle, Download, Search } from 'lucide-react';

function HomeContent() {
  const { setUploadedCamps, uploadedCamps, isLoaded, children, schedule } = useSchedule();
  const { triggerDiscovery, isLoading: isAIThinking } = useAI();

  // Load mock data if none exists
  const loadDemo = () => {
    setUploadedCamps(MOCK_CAMPS);
  };

  const handleExport = () => {
    const headers = ['Child', 'Week', 'Camp Name', 'Location', 'Price'];
    const rows = schedule.map(s => {
      const child = children.find(c => c.id === s.childId);
      const camp = uploadedCamps.find(c => c.id === s.campId);
      return [
        child?.name || 'Unknown',
        `Week ${s.weekIndex + 1}`,
        camp?.name || 'Unknown',
        camp?.location || 'Unknown',
        `$${camp?.price || 0}`
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "campsync_schedule.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-400">Loading your summer...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen bg-slate-50/50 flex overflow-hidden">
      {/* LEFT SIDEBAR: CONFIGURATION */}
      <aside className="w-72 lg:w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <Settings2 size={18} />
          </div>
          <h2 className="font-black text-sm uppercase tracking-widest text-slate-800">Configuration</h2>
        </div>
        <div className="p-6 space-y-8">
          <ZipInput />
          <ChildForm />
        </div>

        <div className="p-6 mt-auto border-t border-slate-100 space-y-4">
          <button
            onClick={triggerDiscovery}
            disabled={isAIThinking}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
          >
            {isAIThinking ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : <Search size={16} />}
            Find Suggestions
          </button>
          <div className="italic text-[10px] text-slate-400 font-medium leading-relaxed">
            AI will search based on your Zip & Children profiles.
          </div>
          <div className="italic text-[10px] text-slate-400 font-medium leading-relaxed">
            All data stays locally in your browser. No server storage.
          </div>
        </div>
      </aside>

      {/* CENTER WORKSPACE: DASHBOARD */}
      <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workspace Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transition-transform hover:rotate-0 group cursor-pointer">
              <Sparkles className="text-white group-hover:scale-110 transition-transform" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">CampSync <span className="text-primary/40 text-xs translate-y-[-4px] inline-block">v2.1</span></h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-success uppercase tracking-widest leading-none">
                  <ShieldCheck size={12} /> Privacy-First Intelligence
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                  System Health: <span className="text-success animate-pulse">Optimal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {uploadedCamps.length > 0 && (
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
              >
                <Download size={14} /> Export CSV
              </button>
            )}

            {uploadedCamps.length === 0 && (
              <button
                onClick={loadDemo}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
              >
                <Sparkle size={14} className="text-secondary" />
                Load Demo Data
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-slate-50/50">
          <div className="max-w-[1400px] mx-auto space-y-12">
            <section>
              <BlackoutPicker />
              <CalendarGrid />
            </section>

            <section className="border-t border-slate-200 pt-12">
              <RoadmapTable />
            </section>

            <footer className="py-12 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                CampSync &copy; 2026 • Local-First Architecture
              </p>
            </footer>
          </div>
        </div>
      </section>

      {/* RIGHT SIDEBAR: AI ASSISTANT */}
      <aside className="w-80 lg:w-96 border-l border-slate-200 bg-white flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.01)]">
        <ChatPanel isSidebar />
      </aside>
    </main>
  );
}

export default function Home() {
  return (
    <AIProvider>
      <HomeContent />
    </AIProvider>
  );
}
