'use client';

import React, { useState } from 'react';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { ChildProfile, Interest } from '@/lib/types';
import { INTEREST_OPTIONS } from '@/lib/constants';
import { Plus, Trash2, User, GraduationCap, Star } from 'lucide-react';

export default function ChildForm() {
    const { children, addChild, removeChild, updateChild } = useSchedule();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const emptyProfile: ChildProfile = {
        id: '',
        name: '',
        grade: 1,
        age: 6,
        interests: [],
        pastFavorites: '',
    };

    const [formData, setFormData] = useState<ChildProfile>(emptyProfile);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateChild(formData);
            setEditingId(null);
        } else {
            addChild({ ...formData, id: crypto.randomUUID() });
            setIsAdding(false);
        }
        setFormData(emptyProfile);
    };

    const startEdit = (child: ChildProfile) => {
        setFormData(child);
        setEditingId(child.id);
    };

    const toggleInterest = (interest: Interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <User className="text-primary" size={20} />
                    Children Profiles
                </h3>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        <Plus size={16} /> Add Child
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {children.map(child => (
                    <div key={child.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-slate-900">{child.name}</p>
                            <p className="text-sm text-slate-500">Grade {child.grade} • {child.age} years old</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => startEdit(child)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                Edit
                            </button>
                            <button onClick={() => removeChild(child.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {(isAdding || editingId) && (
                    <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border-2 border-primary/20 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alias/Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Alex"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                    <GraduationCap size={12} /> Grade
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={12}
                                    required
                                    value={formData.grade || ''}
                                    onChange={e => setFormData({ ...formData, grade: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                                <input
                                    type="number"
                                    min={3}
                                    max={18}
                                    required
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${formData.interests.includes(interest as Interest)
                                            ? 'bg-primary text-white'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/50'
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <Star size={12} /> Past Favorites
                            </label>
                            <textarea
                                value={formData.pastFavorites}
                                onChange={e => setFormData({ ...formData, pastFavorites: e.target.value })}
                                placeholder="Camps they loved before..."
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none h-20 resize-none"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => { setIsAdding(false); setEditingId(null); setFormData(emptyProfile); }}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                            >
                                {editingId ? 'Update Child' : 'Save Child'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
