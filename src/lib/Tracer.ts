import { Logger } from './Logger';

interface TraceSpan {
    id: string;
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata: Record<string, unknown>;
}

class Tracer {
    private static instance: Tracer;
    private activeSpans: Map<string, TraceSpan> = new Map();

    private constructor() { }

    public static getInstance(): Tracer {
        if (!Tracer.instance) {
            Tracer.instance = new Tracer();
        }
        return Tracer.instance;
    }

    public startSpan(name: string, metadata: Record<string, unknown> = {}): string {
        const id = crypto.randomUUID();
        const span: TraceSpan = {
            id,
            name,
            startTime: performance.now(),
            metadata,
        };
        this.activeSpans.set(id, span);
        Logger.info(`[START] ${name}`, metadata);
        return id;
    }

    public endSpan(id: string, additionalMetadata?: unknown) {
        const span = this.activeSpans.get(id);
        if (!span) {
            Logger.warn(`[END] Span not found: ${id}`);
            return;
        }

        span.endTime = performance.now();
        span.duration = span.endTime - span.startTime;
        span.metadata = { ...span.metadata, ...(additionalMetadata as Record<string, unknown>) };

        Logger.info(`[END] ${span.name}`, {
            duration: `${span.duration}ms`,
            ...span.metadata
        });

        this.activeSpans.delete(id);
    }

    /**
     * Decorator-like wrapper for tracing async functions
     */
    public async trace<T>(name: string, fn: () => Promise<T>, metadata: Record<string, unknown> = {}): Promise<T> {
        const id = this.startSpan(name, metadata);
        try {
            const result = await fn();
            this.endSpan(id);
            return result;
        } catch (error) {
            this.endSpan(id, { error });
            throw error;
        }
    }
}

export const tracer = Tracer.getInstance();
