'use client';

import React from 'react';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { MapPin } from 'lucide-react';

export default function ZipInput() {
    const { zipCode, setZipCode } = useSchedule();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <label htmlFor="zipCode" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-secondary" />
                Home Zip Code
            </label>
            <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g. 90210"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-slate-900"
                maxLength={5}
            />
            <p className="mt-2 text-xs text-slate-500">
                Used only for distance matching. No addresses required.
            </p>
        </div>
    );
}
