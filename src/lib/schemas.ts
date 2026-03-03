import { z } from 'zod';

export const InterestSchema = z.enum([
    "STEM", "Arts", "Sports", "Coding", "Outdoor", "Cooking", "Music", "Robotics"
]);

export const ChildProfileSchema = z.object({
    id: z.string().uuid().or(z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)),
    name: z.string().min(1, "Name is required"),
    grade: z.number().min(0).max(12),
    age: z.number().min(3).max(18),
    interests: z.array(InterestSchema),
    pastFavorites: z.string().optional(),
});

export const CampSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    location: z.string(),
    zipCode: z.string().length(5),
    description: z.string(),
    weeks: z.array(z.number().min(1).max(10)),
    ageRange: z.object({
        min: z.number(),
        max: z.number(),
    }),
    price: z.number().min(0),
    tags: z.array(z.string()),
});

export const ScheduleEntrySchema = z.object({
    childId: z.string(),
    campId: z.string(),
    weekIndex: z.number().min(0).max(9),
});

export const AppStateSchema = z.object({
    zipCode: z.string().length(5).or(z.literal('')),
    children: z.array(ChildProfileSchema),
    blackoutWeeks: z.array(z.number().min(0).max(9)),
    schedule: z.array(ScheduleEntrySchema),
    uploadedCamps: z.array(CampSchema),
});

export type ValidatedAppState = z.infer<typeof AppStateSchema>;
export type ValidatedChildProfile = z.infer<typeof ChildProfileSchema>;
export type ValidatedCamp = z.infer<typeof CampSchema>;
