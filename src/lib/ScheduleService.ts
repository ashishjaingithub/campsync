import { AppState, Camp, ScheduleEntry } from './types';
import { Logger } from './Logger';
import { tracer } from './Tracer';
import { AppStateSchema } from './schemas';

export interface ScoredCamp extends Camp {
    score: number;
    reasons: string[];
}

export class ScheduleService {
    private static instance: ScheduleService;

    private constructor() { }

    public static getInstance(): ScheduleService {
        if (!ScheduleService.instance) {
            ScheduleService.instance = new ScheduleService();
        }
        return ScheduleService.instance;
    }

    /**
     * Helper to calculate distance (mocked)
     */
    private getDistance(zip1: string, zip2: string): number {
        if (!zip1 || !zip2) return 5;
        if (zip1 === zip2) return 0;
        const diff = Math.abs(parseInt(zip1) - parseInt(zip2));
        return (diff % 20);
    }

    /**
     * Validates the entire application state
     */
    public validateState(state: AppState) {
        const result = AppStateSchema.safeParse(state);
        if (!result.success) {
            Logger.error('Invalid Application State detected', result.error.format());
            return false;
        }
        return true;
    }

    /**
     * Generates a scored list of camps for general preference
     */
    public solveAll(state: AppState): ScoredCamp[] {
        const traceId = tracer.startSpan('solveAllSchedule');

        try {
            const { zipCode, children, uploadedCamps } = state;
            const scoredCamps: ScoredCamp[] = [];

            uploadedCamps.forEach(camp => {
                let score = 50;
                const reasons: string[] = [];

                const distance = this.getDistance(zipCode, camp.zipCode);
                if (distance > 10) {
                    score -= 5;
                    reasons.push('Over 10 miles away (-5)');
                } else if (distance < 3) {
                    score += 5;
                    reasons.push('Very close to home (+5)');
                }

                children.forEach(child => {
                    const matchingInterests = child.interests.filter(i => camp.tags.includes(i));
                    if (matchingInterests.length > 0) {
                        score += matchingInterests.length * 10;
                        reasons.push(`Matches ${child.name}'s interests: ${matchingInterests.join(', ')} (+${matchingInterests.length * 10})`);
                    }
                });

                scoredCamps.push({ ...camp, score, reasons });
            });

            tracer.endSpan(traceId, { campCount: uploadedCamps.length, scoredCount: scoredCamps.length });
            return scoredCamps.sort((a, b) => b.score - a.score);
        } catch (error) {
            tracer.endSpan(traceId, { error });
            Logger.error('Failed to solve schedule', error);
            throw error;
        }
    }

    /**
     * Gets the top suggestions for a specific week and child
     */
    public getSuggestions(state: AppState, childId: string, weekIndex: number): ScoredCamp[] {
        const traceId = tracer.startSpan('getSuggestionsForWeek', { childId, weekIndex });

        const child = state.children.find(c => c.id === childId);
        if (!child) {
            tracer.endSpan(traceId, { error: 'Child not found' });
            return [];
        }

        const availableCamps = state.uploadedCamps.filter(camp =>
            camp.weeks?.includes(weekIndex + 1) &&
            camp.ageRange &&
            child.age >= camp.ageRange.min &&
            child.age <= camp.ageRange.max
        );

        const scored = availableCamps.map(camp => {
            let score = 50;
            const reasons: string[] = [];

            const interestMatch = child.interests.filter(i => camp.tags.includes(i)).length;
            score += interestMatch * 15;
            if (interestMatch > 0) {
                reasons.push(`${interestMatch} interest matches`);
                Logger.info(`Interest match for ${child.name}: ${camp.name}`);
            }

            const siblingsAtThisCamp = state.schedule.filter(s =>
                s.weekIndex === weekIndex && s.campId === camp.id && s.childId !== childId
            );
            if (siblingsAtThisCamp.length > 0) {
                score += 20;
                reasons.push('Sibling already enrolled here this week (+20)');
            }

            const dist = this.getDistance(state.zipCode, camp.zipCode);
            if (dist > 15) score -= 10;

            return { ...camp, score, reasons };
        });

        const results = scored.sort((a, b) => b.score - a.score).slice(0, 3);
        tracer.endSpan(traceId, { suggestionCount: results.length });
        return results;
    }

    /**
     * Validates schedule integrity (conflicts)
     */
    public validateSchedule(schedule: ScheduleEntry[]): string[] {
        const errors: string[] = [];
        const childWeekMap = new Set<string>();

        schedule.forEach(entry => {
            const key = `${entry.childId}-${entry.weekIndex}`;
            if (childWeekMap.has(key)) {
                errors.push(`Conflict: Child is enrolled in multiple camps during Week ${entry.weekIndex + 1}`);
            }
            childWeekMap.add(key);
        });

        if (errors.length > 0) Logger.warn('Schedule conflicts detected', { errors });
        return errors;
    }

    /**
     * Provides a compact JSON summary for LLM analysis
     */
    public getJsonSummary(state: AppState) {
        Logger.info('Generating JSON summary');
        return {
            children: state.children.map(c => ({ id: c.id, name: c.name, age: c.age, interests: c.interests })),
            conflicts: this.validateSchedule(state.schedule),
            holes: state.children.flatMap(child => {
                const filledWeeks = state.schedule.filter(s => s.childId === child.id).map(s => s.weekIndex);
                const missingWeeks = Array.from({ length: 10 }, (_, i) => i).filter(i => !filledWeeks.includes(i));
                return missingWeeks.map(w => ({ childId: child.id, weekIndex: w }));
            })
        };
    }

    /**
     * Specialized search for the Agent
     */
    public searchCamps(state: AppState, criteria: { interests?: string[], age?: number, weekIndex?: number }) {
        let results = state.uploadedCamps;

        if (criteria.weekIndex !== undefined) {
            results = results.filter(c => c.weeks.includes(criteria.weekIndex! + 1));
        }

        if (criteria.age !== undefined) {
            results = results.filter(c => criteria.age! >= c.ageRange.min && criteria.age! <= c.ageRange.max);
        }

        if (criteria.interests && criteria.interests.length > 0) {
            results = results.sort((a, b) => {
                const aMatch = a.tags.filter(t => criteria.interests?.includes(t)).length;
                const bMatch = b.tags.filter(t => criteria.interests?.includes(t)).length;
                return bMatch - aMatch;
            });
        }

        return results.slice(0, 5);
    }

    /**
     * Heuristic-based auto-generation of a schedule
     */
    public autoGenerateSchedule(state: AppState): ScheduleEntry[] {
        const newSchedule: ScheduleEntry[] = [...state.schedule];
        const { children, uploadedCamps, blackoutWeeks, zipCode } = state;

        children.forEach(child => {
            // Fill all 10 weeks
            for (let weekIndex = 0; weekIndex < 10; weekIndex++) {
                // Skip if already scheduled or is a blackout week
                if (blackoutWeeks.includes(weekIndex)) continue;
                if (newSchedule.some(s => s.childId === child.id && s.weekIndex === weekIndex)) continue;

                // Find eligible camps
                const eligibleCamps = uploadedCamps.filter(camp =>
                    camp.weeks.includes(weekIndex + 1) &&
                    child.age >= camp.ageRange.min &&
                    child.age <= camp.ageRange.max
                );

                if (eligibleCamps.length === 0) continue;

                // Score camps for this child/week
                const scored = eligibleCamps.map(camp => {
                    let score = 50;

                    // Interest match
                    const interestMatch = child.interests.filter(i => camp.tags.includes(i)).length;
                    score += interestMatch * 20;

                    // Sibling sync (already in newSchedule for this week)
                    const siblingSync = newSchedule.some(s =>
                        s.weekIndex === weekIndex && s.campId === camp.id && s.childId !== child.id
                    );
                    if (siblingSync) score += 30;

                    // Proximity
                    const dist = this.getDistance(zipCode, camp.zipCode);
                    if (dist < 5) score += 10;
                    if (dist > 15) score -= 20;

                    return { camp, score };
                });

                // Pick the best one
                const best = scored.sort((a, b) => b.score - a.score)[0];
                if (best && best.score > 40) { // Threshold for "good enough"
                    newSchedule.push({
                        childId: child.id,
                        campId: best.camp.id,
                        weekIndex: weekIndex
                    });
                }
            }
        });

        return newSchedule;
    }
}

export const scheduleService = ScheduleService.getInstance();
