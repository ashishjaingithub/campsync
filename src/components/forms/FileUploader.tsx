'use client';

import React, { useCallback } from 'react';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { Camp } from '@/lib/types';

export default function FileUploader() {
    const { setUploadedCamps, uploadedCamps } = useSchedule();

    const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedCamps: Camp[] = (results.data as Record<string, string>[]).map((row, index) => ({
                    id: `upload-${index}-${Date.now()}`,
                    name: row['Camp Name'] || row['Name'] || 'Unknown Camp',
                    location: row['Location'] || 'Various',
                    zipCode: row['Zip'] || row['Zip Code'] || '',
                    description: row['Description'] || '',
                    weeks: row['Weeks'] ? row['Weeks'].split(',').map((w: string) => parseInt(w.trim())) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    ageRange: {
                        min: parseInt(row['Min Age']) || 5,
                        max: parseInt(row['Max Age']) || 15
                    },
                    price: parseFloat(row['Price']) || 0,
                    tags: row['Tags'] ? row['Tags'].split(',').map((t: string) => t.trim()) : []
                }));

                setUploadedCamps(parsedCamps);
            },
            error: (error) => {
                console.error('CSV Parsing Error:', error);
            }
        });
    }, [setUploadedCamps]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Upload className="text-primary" size={20} />
                Import External Camps
            </h3>
            <p className="text-sm text-slate-500 mb-4">
                Drop a .csv file with &quot;Friend Schedules&quot; or community brochures to anchor your calendar.
            </p>

            <div className="relative group">
                <input
                    type="file"
                    accept=".csv"
                    onChange={onFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                    <FileText className="text-slate-300 group-hover:text-primary transition-colors mb-2" size={32} />
                    <p className="text-sm font-medium text-slate-600">
                        {uploadedCamps.length > 0
                            ? `${uploadedCamps.length} camps imported`
                            : "Click or drag CSV to upload"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Requires &apos;Camp Name&apos; column</p>
                </div>
            </div>

            {uploadedCamps.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-success text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Successfully loaded external data
                </div>
            )}
        </div>
    );
}
