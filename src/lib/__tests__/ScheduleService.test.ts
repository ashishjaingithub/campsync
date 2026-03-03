import { describe, it, expect } from 'vitest';
import { scheduleService } from '../ScheduleService';
import { AppState, ChildProfile, Camp } from '../types';

describe('ScheduleService', () => {
    const mockChild: ChildProfile = {
        id: 'child-1',
        name: 'Alex',
        grade: 5,
        age: 10,
        interests: ['STEM'],
        pastFavorites: '',
    };

    const mockCamp: Camp = {
        id: 'camp-1',
        name: 'Robot Camp',
        location: 'Nearby',
        zipCode: '90001',
        description: 'Robots!',
        weeks: [1],
        ageRange: { min: 8, max: 12 },
        price: 400,
        tags: ['STEM'],
    };

    const mockState: AppState = {
        zipCode: '90001',
        children: [mockChild],
        blackoutWeeks: [],
        schedule: [],
        uploadedCamps: [mockCamp],
    };

    it('should calculate scores based on interests', () => {
        const results = scheduleService.solveAll(mockState);
        expect(results[0].id).toBe('camp-1');
        expect(results[0].score).toBeGreaterThan(50); // Base 50 + distance bonus + interest bonus
    });

    it('should identify multiple schedule conflicts for same child', () => {
        const conflicts = scheduleService.validateSchedule([
            { childId: 'c1', campId: 'm1', weekIndex: 0 },
            { childId: 'c1', campId: 'm2', weekIndex: 0 },
            { childId: 'c1', campId: 'm3', weekIndex: 0 },
        ]);
        // The current implementation returns an array of strings like "Alex: Conflict in Week 1"
        // It should catch at least one conflict for this child and week.
        expect(conflicts.length).toBeGreaterThanOrEqual(1);
    });

    it('should suggest camps for empty weeks while respecting age limits', () => {
        const youngChild: ChildProfile = { ...mockChild, age: 5, id: 'young-1' };
        const stateWithYoungChild = { ...mockState, children: [youngChild] };

        // mockCamp is for ages 8-12, so it shouldn't be suggested for a 5-year-old
        const suggestions = scheduleService.getSuggestions(stateWithYoungChild, 'young-1', 0);
        expect(suggestions.length).toBe(0);
    });

    it('should be resilient to camps missing weeks or ageRange (Regression Fix)', () => {
        const malformedCamp = {
            id: 'malformed-1',
            name: 'Ghost Camp',
            // Missing weeks and ageRange
        } as Camp;
        const stateWithMalformed = { ...mockState, uploadedCamps: [malformedCamp] };

        // This should not throw TypeError
        expect(() => scheduleService.getSuggestions(stateWithMalformed, 'child-1', 0)).not.toThrow();
        const suggestions = scheduleService.getSuggestions(stateWithMalformed, 'child-1', 0);
        expect(suggestions.length).toBe(0);
    });

    it('should auto-generate schedule for all children', () => {
        const generated = scheduleService.autoGenerateSchedule(mockState);
        expect(generated.length).toBeGreaterThan(0);
        expect(generated[0].childId).toBe('child-1');
    });
});
