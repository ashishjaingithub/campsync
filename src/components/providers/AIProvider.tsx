'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSchedule } from './ScheduleProvider';
import { ScheduleEntry, Camp } from '@/lib/types';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    proposedChanges?: ScheduleEntry[];
    discoveryResults?: Camp[];
}

interface AIContextType {
    messages: ChatMessage[];
    isLoading: boolean;
    sendMessage: (content: string) => Promise<void>;
    triggerDiscovery: () => Promise<void>;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
    const { children: profiles, blackoutWeeks, schedule, uploadedCamps, zipCode } = useSchedule();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Hi! I'm your CampSync Assistant. I can help you move camps, find cheaper options, or fill those 'Logistics Holes'. What's on your mind?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const payloadMessages = [...messages, userMessage];

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: payloadMessages.map(m => ({ role: m.role, content: m.content })),
                    state: { children: profiles, blackoutWeeks, schedule, uploadedCamps, zipCode }
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Unknown API error');
            }

            const contentType = res.headers.get('Content-Type');

            if (contentType?.includes('application/json')) {
                const data = await res.json();
                const toolChanges: ScheduleEntry[] = [];
                let discoveries: Camp[] = [];

                if (data.tool_calls) {
                    for (const call of data.tool_calls) {
                        if (call.name === 'modify_schedule') {
                            const args = call.args as { action: string; childId: string; campId: string; weekIndex: number };
                            if (args.action === 'add') {
                                toolChanges.push({ childId: args.childId, campId: args.campId, weekIndex: args.weekIndex });
                            }
                        } else if (call.name === 'display_discovery_results') {
                            const args = call.args as { camps: Camp[] };
                            discoveries = args.camps;
                        }
                    }

                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: discoveries.length > 0
                            ? `I found ${discoveries.length} camp options online that match your request. Take a look!`
                            : "I've analyzed your request and have some suggestions for your schedule. Would you like to preview them?",
                        proposedChanges: toolChanges.length > 0 ? toolChanges : undefined,
                        discoveryResults: discoveries.length > 0 ? discoveries : undefined
                    }]);
                }
            } else {
                const reader = res.body?.getReader();
                const decoder = new TextDecoder();

                setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

                while (true) {
                    const { done, value } = await reader!.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        lastMessage.content += chunk;
                        return newMessages;
                    });
                }
            }
        } catch (error: unknown) {
            console.error('Chat Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Report error
            fetch('/api/report-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: errorMessage,
                    state: { children: profiles, blackoutWeeks, schedule, uploadedCamps, zipCode }
                })
            }).catch(e => console.error('Failed to report error', e));

            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, profiles, blackoutWeeks, schedule, uploadedCamps, zipCode]);

    const triggerDiscovery = useCallback(async () => {
        if (profiles.length === 0 || !zipCode) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Please add at least one child and a zip code first so I can find relevant camps for you!" }]);
            return;
        }

        const prompt = `Find some great summer camps near ${zipCode} for my children: ${profiles.map(p => `${p.name} (Age ${p.age})`).join(', ')}.`;
        await sendMessage(prompt);
    }, [profiles, zipCode, sendMessage]);

    return (
        <AIContext.Provider value={{
            messages,
            isLoading,
            sendMessage,
            triggerDiscovery,
            setMessages
        }}>
            {children}
        </AIContext.Provider>
    );
}

export function useAI() {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
}
