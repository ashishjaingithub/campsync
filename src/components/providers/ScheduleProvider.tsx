'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, ChildProfile, Camp, ScheduleEntry } from '@/lib/types';
import { scheduleService } from '@/lib/ScheduleService';

interface ScheduleContextType extends AppState {
    isLoaded: boolean;
    proposedEntries: ScheduleEntry[];
    setZipCode: (zip: string) => void;
    addChild: (child: ChildProfile) => void;
    removeChild: (id: string) => void;
    updateChild: (child: ChildProfile) => void;
    toggleBlackoutWeek: (weekIndex: number) => void;
    setUploadedCamps: (camps: Camp[]) => void;
    addToSchedule: (entry: ScheduleEntry, camp?: Camp) => void;
    removeFromSchedule: (childId: string, weekIndex: number) => void;
    proposeChanges: (entries: ScheduleEntry[]) => void;
    applyProposedChanges: () => void;
    discardProposedChanges: () => void;
    autoFill: () => void;
    resetAll: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const STORAGE_KEY = 'campsync_state';

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AppState>({
        zipCode: '',
        children: [],
        blackoutWeeks: [],
        schedule: [],
        uploadedCamps: [],
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [proposedEntries, setProposedEntries] = useState<ScheduleEntry[]>([]);

    // Initial load
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setState(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved state', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, isLoaded]);

    const setZipCode = (zipCode: string) => setState(prev => ({ ...prev, zipCode }));

    const addChild = (child: ChildProfile) =>
        setState(prev => ({ ...prev, children: [...prev.children, child] }));

    const removeChild = (id: string) =>
        setState(prev => ({
            ...prev,
            children: prev.children.filter(c => c.id !== id),
            schedule: prev.schedule.filter(s => s.childId !== id)
        }));

    const updateChild = (child: ChildProfile) =>
        setState(prev => ({
            ...prev,
            children: prev.children.map(c => c.id === child.id ? child : c)
        }));

    const toggleBlackoutWeek = (weekIndex: number) =>
        setState(prev => ({
            ...prev,
            blackoutWeeks: prev.blackoutWeeks.includes(weekIndex)
                ? prev.blackoutWeeks.filter(w => w !== weekIndex)
                : [...prev.blackoutWeeks, weekIndex]
        }));

    const setUploadedCamps = (uploadedCamps: Camp[]) =>
        setState(prev => ({ ...prev, uploadedCamps }));

    const addToSchedule = (entry: ScheduleEntry, camp?: Camp) =>
        setState(prev => {
            const newState = { ...prev };
            if (camp && !prev.uploadedCamps.some(c => c.id === camp.id)) {
                newState.uploadedCamps = [...prev.uploadedCamps, camp];
            }
            newState.schedule = [
                ...prev.schedule,
                entry
            ];
            return newState;
        });

    const removeFromSchedule = (childId: string, weekIndex: number) =>
        setState(prev => ({
            ...prev,
            schedule: prev.schedule.filter(s => !(s.childId === childId && s.weekIndex === weekIndex))
        }));

    const proposeChanges = (entries: ScheduleEntry[]) => {
        setProposedEntries(entries);
    };

    const applyProposedChanges = () => {
        setState(prev => {
            let newSchedule = [...prev.schedule];
            proposedEntries.forEach(entry => {
                newSchedule = [
                    ...newSchedule.filter(s => !(s.childId === entry.childId && s.weekIndex === entry.weekIndex)),
                    entry
                ];
            });
            return { ...prev, schedule: newSchedule };
        });
        setProposedEntries([]);
    };

    const discardProposedChanges = () => {
        setProposedEntries([]);
    };

    const autoFill = useCallback(() => {
        const generated = scheduleService.autoGenerateSchedule(state);
        // We propose them instead of applying them directly to show the user
        setProposedEntries(generated.filter(g =>
            !state.schedule.some(s => s.childId === g.childId && s.weekIndex === g.weekIndex && s.campId === g.campId)
        ));
    }, [state]);

    const resetAll = () => {
        setState({
            zipCode: '',
            children: [],
            blackoutWeeks: [],
            schedule: [],
            uploadedCamps: [],
        });
        setProposedEntries([]);
    };

    // Expose for testing
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-expect-error - Exposing for testing
            window.autoFill = autoFill;
        }
    }, [autoFill]);

    return (
        <ScheduleContext.Provider value={{
            ...state,
            isLoaded,
            proposedEntries,
            setZipCode,
            addChild,
            removeChild,
            updateChild,
            toggleBlackoutWeek,
            setUploadedCamps,
            addToSchedule,
            removeFromSchedule,
            proposeChanges,
            applyProposedChanges,
            discardProposedChanges,
            autoFill,
            resetAll
        }}>
            {children}
        </ScheduleContext.Provider>
    );
}

export function useSchedule() {
    const context = useContext(ScheduleContext);
    if (context === undefined) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
}
