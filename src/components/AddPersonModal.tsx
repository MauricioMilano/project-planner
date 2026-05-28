"use client";

import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Person } from '../types';
import { getInitials } from '../hooks/useGanttCalculations';
import { X } from 'lucide-react';
import { useSettings } from './SettingsModal';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPerson?: Person | null;
}

export function AddPersonModal({ isOpen, onClose, editPerson }: AddPersonModalProps) {
  const { addPerson, updatePerson } = useProject();
  const settings = useSettings();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [capacity, setCapacity] = useState(settings.defaultCapacity);

  useEffect(() => {
    if (editPerson) {
      setName(editPerson.name);
      setRole(editPerson.role || '');
      setCapacity(editPerson.capacity);
    } else {
      setName('');
      setRole('');
      setCapacity(settings.defaultCapacity);
    }
  }, [editPerson, isOpen, settings.defaultCapacity]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editPerson) {
      updatePerson({
        ...editPerson,
        name: name.trim(),
        role: role.trim() || undefined,
        capacity,
      });
    } else {
      addPerson(name.trim(), role.trim() || undefined, capacity);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {editPerson ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Chen"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role (optional)
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Product Manager"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability: {capacity}%
            </label>
            <input
              type="range"
              min="25"
              max="100"
              step="25"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#181d26] text-white rounded-lg font-medium hover:bg-[#0d1218] transition-colors"
            >
              {editPerson ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}