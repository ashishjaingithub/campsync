import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const AgentToolDefinitions: FunctionDeclaration[] = [
    {
        name: 'display_discovery_results',
        description: 'Display a list of discovered summer camps to the user with interactive "Add to Schedule" buttons. Use this after finding camps via web search.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                camps: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.STRING, description: 'A unique temporary ID for this discovery.' },
                            name: { type: SchemaType.STRING },
                            price: { type: SchemaType.NUMBER },
                            location: { type: SchemaType.STRING },
                            weeks: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER }, description: '1-10 corresponding to June-August' },
                            ageRange: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    min: { type: SchemaType.NUMBER },
                                    max: { type: SchemaType.NUMBER }
                                },
                                required: ['min', 'max']
                            },
                            tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            website: { type: SchemaType.STRING },
                            description: { type: SchemaType.STRING }
                        },
                        required: ['id', 'name', 'price', 'location', 'website', 'weeks', 'ageRange']
                    }
                }
            },
            required: ['camps']
        }
    },
    {
        name: 'search_web_camps',
        description: 'Perform a real-time web search for summer camps based on child interests, age, and location. Use this to find new options not in the local upload.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                query: {
                    type: SchemaType.STRING,
                    description: 'The specific search query (e.g., "robotics summer camps for 12 year olds in Zip 94110").'
                }
            },
            required: ['query']
        }
    },
    {
        name: 'search_local_camps',
        description: 'Search for available camps based on child interests, age range, and specific summer weeks.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                interests: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: 'List of interest tags to match (e.g., Coding, Sports, Art).'
                },
                age: {
                    type: SchemaType.NUMBER,
                    description: 'The age of the child to ensure eligibility.'
                },
                weekIndex: {
                    type: SchemaType.NUMBER,
                    description: 'The 0-indexed week (0-9) to search in.'
                }
            },
            required: ['weekIndex']
        }
    },
    {
        name: 'modify_schedule',
        description: 'Propose to add or remove a camp from a child\'s summer schedule. Changes will be shown as drafts for the user to approve.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                action: {
                    type: SchemaType.STRING,
                    enum: ['add', 'remove'],
                    format: 'enum',
                    description: 'Whether to add a new camp or remove an existing one.'
                },
                childId: {
                    type: SchemaType.STRING,
                    description: 'The unique ID of the child.'
                },
                campId: {
                    type: SchemaType.STRING,
                    description: 'The unique ID of the camp.'
                },
                weekIndex: {
                    type: SchemaType.NUMBER,
                    description: 'The 0-indexed week (0-9) for the change.'
                }
            },
            required: ['action', 'childId', 'campId', 'weekIndex']
        }
    },
    {
        name: 'get_schedule_summary',
        description: 'Analyze the current application state to find schedule gaps (Logistics Holes) or conflicts.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                childId: {
                    type: SchemaType.STRING,
                    description: 'Optional: Filter summary for a specific child.'
                }
            }
        }
    }
];

