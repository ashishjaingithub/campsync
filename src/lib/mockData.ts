import { Camp } from './types';

export const MOCK_CAMPS: Camp[] = [
    {
        id: 'mock-1',
        name: 'STEM Adventure Camp',
        location: 'Tech Hub Downtown',
        zipCode: '90001',
        description: 'Learn coding and robotics in a fun environment.',
        weeks: [1, 2, 3, 7, 8],
        ageRange: { min: 7, max: 12 },
        price: 450,
        tags: ['STEM', 'Coding', 'Robotics']
    },
    {
        id: 'mock-2',
        name: 'Vibrant Arts Studio',
        location: 'Creative Quarter',
        zipCode: '90002',
        description: 'Painting, sculpture, and digital art.',
        weeks: [2, 3, 4, 5, 6],
        ageRange: { min: 6, max: 15 },
        price: 380,
        tags: ['Arts', 'Painting']
    },
    {
        id: 'mock-3',
        name: 'Soccer Stars Academy',
        location: 'Central Park Fields',
        zipCode: '90001',
        description: 'Professional coaching for all skill levels.',
        weeks: [1, 2, 3, 4, 5, 8, 9, 10],
        ageRange: { min: 5, max: 14 },
        price: 300,
        tags: ['Sports', 'Outdoor']
    },
    {
        id: 'mock-4',
        name: 'Chef Academy Junior',
        location: 'Culinary Institute',
        zipCode: '90005',
        description: 'Master the kitchen and learn global cuisines.',
        weeks: [4, 5, 6, 7],
        ageRange: { min: 9, max: 16 },
        price: 520,
        tags: ['Cooking', 'STEM']
    }
];
