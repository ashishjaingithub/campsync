import { describe, it, expect } from 'vitest';
import { scheduleService } from '../lib/ScheduleService';
import { AgentToolDefinitions } from '../lib/AgentTools';
import { AppState } from '../lib/types';

// Mock state for Case 1
const mockState: AppState = {
    children: [
        { id: 'alex-id', name: 'Alex', age: 10, interests: ['Art', 'Robotics'] },
        { id: 'jordan-id', name: 'Jordan', age: 8, interests: ['Space'] }
    ],
    zipCode: '90210',
    blackoutWeeks: [],
    uploadedCamps: [
        { id: 'art-id', name: 'Creative Arts', location: 'Nearby', weeks: [3], tags: ['Art'], price: 200, ageRange: { min: 8, max: 12 }, zipCode: '90210' },
        { id: 'robot-id', name: 'Junior Robotics', location: 'Nearby', weeks: [5], tags: ['Robotics'], price: 300, ageRange: { min: 8, max: 12 }, zipCode: '90210' }
    ],
    schedule: []
};

describe('Agent Evaluation - Logic & Tools', () => {

    it('Case 1: Should correctly identify and return modify_schedule tool call for addition', async () => {
        const tool = AgentToolDefinitions.find(t => t.name === 'modify_schedule');
        expect(tool).toBeDefined();
        expect(tool?.parameters?.required).toContain('campId');

        const campId = 'art-id';
        const foundCamp = mockState.uploadedCamps.find(c => c.id === campId);
        expect(foundCamp?.name).toBe('Creative Arts');
    });

    it('Case 3: Should successfully execute search_local_camps on the server', () => {
        const searchArgs = { interests: ['Robotics'], weekIndex: 4 }; // Week 5 is index 4

        const results = scheduleService.searchCamps(mockState, searchArgs);

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Junior Robotics');
    });

    it('Case 4: Should return a JSON summary that includes holes', () => {
        const summary = scheduleService.getJsonSummary(mockState);

        expect(summary.holes).toBeDefined();
        // Each child should have 10 holes initially
        expect(summary.holes.length).toBe(20);
        expect(summary.children[0].name).toBe('Alex');
    });
});
