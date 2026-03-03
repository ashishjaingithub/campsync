import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatPanel from './ChatPanel';
import { useSchedule } from '../providers/ScheduleProvider';
import { AIProvider } from '../providers/AIProvider';
import { useAI } from '../providers/AIProvider';

// Mock the hooks
vi.mock('../providers/ScheduleProvider', () => ({
    useSchedule: vi.fn()
}));

const mockUseSchedule = {
    children: [{ id: 'child-1', name: 'Alex', age: 10, grade: 5, interests: ['STEM'] }],
    blackoutWeeks: [],
    schedule: [],
    uploadedCamps: [],
    zipCode: '90001',
    proposeChanges: vi.fn(),
    proposedEntries: [],
    applyProposedChanges: vi.fn(),
    discardProposedChanges: vi.fn(),
    addToSchedule: vi.fn()
};



describe('ChatPanel Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock global fetch
        global.fetch = vi.fn();

        // Setup default mock returns
        vi.mocked(useSchedule).mockReturnValue(mockUseSchedule as never);
    });

    it('should render initial welcome message', () => {
        render(
            <AIProvider>
                <ChatPanel />
            </AIProvider>
        );
        expect(screen.getByText(/CampSync Assistant/i)).toBeInTheDocument();
    });

    it('should allow typing in the chat input', () => {
        render(
            <AIProvider>
                <ChatPanel />
            </AIProvider>
        );
        const input = screen.getByPlaceholderText(/e.g. Find art camps/i);
        fireEvent.change(input, { target: { value: 'Hello Assistant' } });
        expect((input as HTMLInputElement).value).toBe('Hello Assistant');
    });

    it('should render discovery cards after a successful search', async () => {

        const mockDiscoveryResponse = {
            tool_calls: [
                {
                    name: 'display_discovery_results',
                    args: {
                        camps: [
                            {
                                id: 'disc-1',
                                name: 'STEM Camp',
                                price: 500,
                                location: 'Tech Hub',
                                website: 'https://example.com',
                                weeks: [4],
                                ageRange: { min: 8, max: 12 },
                                tags: ['STEM']
                            }
                        ]
                    }
                }
            ]
        };

        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            headers: { get: () => 'application/json' },
            json: async () => mockDiscoveryResponse
        } as never);

        render(
            <AIProvider>
                <ChatPanel />
            </AIProvider>
        );

        const input = screen.getByPlaceholderText(/e.g. Find art camps near me.../i);
        fireEvent.change(input, { target: { value: 'Find STEM camps' } });

        // Use container query since form lacks accessible role
        const form = document.querySelector('form');
        if (form) fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/STEM Camp/i)).toBeInTheDocument();
        });
        expect(screen.getByText(/\$500/i)).toBeInTheDocument();
    });
});
