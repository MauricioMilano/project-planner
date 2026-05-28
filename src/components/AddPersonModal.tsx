"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import { Person } from '../types';
import { X } from 'lucide-react';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPerson?: Person | null;
}

export function AddPersonModal({ isOpen, onClose, editPerson }: AddPersonModalProps) {
  const { t } = useTranslation();
  const { addPerson, updatePerson } = useProject();
  const { currentTheme } = useTheme();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  
  const colors = currentTheme.colors;

  useEffect(() => {
    if (editPerson) {
      setName(editPerson.name);
      setRole(editPerson.role || '');
    } else {
      setName('');
      setRole('');
    }
  }, [editPerson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editPerson) {
      updatePerson({
        ...editPerson,
        name: name.trim(),
        role: role.trim() || undefined,
      });
    } else {
      addPerson(name.trim(), role.trim() || undefined);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
        style={{ backgroundColor: colors.card }}
      >
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <h2 className="text-lg font-medium" style={{ color: colors.textPrimary }}>
            {editPerson ? t('addPerson.editTitle') : t('addPerson.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
              {t('addPerson.nameLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('addPerson.namePlaceholder')}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                backgroundColor: colors.input,
                border: `1px solid ${colors.inputBorder}`,
                color: colors.textPrimary
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
              {t('addPerson.roleLabel')}
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={t('addPerson.rolePlaceholder')}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                backgroundColor: colors.input,
                border: `1px solid ${colors.inputBorder}`,
                color: colors.textPrimary
              }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ 
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
                backgroundColor: colors.card
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: colors.buttonPrimary,
                color: colors.buttonSecondary
              }}
            >
              {editPerson ? t('addPerson.saveChanges') : t('addPerson.addMember')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}