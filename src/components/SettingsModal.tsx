"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface Settings {
  workingDaysPerWeek: number;
  dayWidth: number;
  showWeekends: boolean;
  autoCalculateEndDate: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  workingDaysPerWeek: 5,
  dayWidth: 32,
  showWeekends: true,
  autoCalculateEndDate: true,
};

const STORAGE_KEY = 'project-planner-settings';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    onClose();
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Day Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.dayWidthLabel')}: {settings.dayWidth}px
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({ ...settings, dayWidth: 24 })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                  settings.dayWidth === 24
                    ? 'bg-[#181d26] text-white border-[#181d26]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t('settings.dayWidthCompact')}
              </button>
              <button
                onClick={() => setSettings({ ...settings, dayWidth: 32 })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                  settings.dayWidth === 32
                    ? 'bg-[#181d26] text-white border-[#181d26]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t('settings.dayWidthNormal')}
              </button>
              <button
                onClick={() => setSettings({ ...settings, dayWidth: 48 })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                  settings.dayWidth === 48
                    ? 'bg-[#181d26] text-white border-[#181d26]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t('settings.dayWidthSpacious')}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {t('settings.dayWidthDesc')}
            </p>
          </div>

          {/* Show Weekends */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('settings.showWeekends')}
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                {t('settings.showWeekendsDesc')}
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, showWeekends: !settings.showWeekends })}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.showWeekends ? 'bg-[#181d26]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  settings.showWeekends ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Auto Calculate End Date */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('settings.autoCalculate')}
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                {t('settings.autoCalculateDesc')}
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoCalculateEndDate: !settings.autoCalculateEndDate })}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.autoCalculateEndDate ? 'bg-[#181d26]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  settings.autoCalculateEndDate ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Language Section */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.languageLabel')}
            </label>
            <LanguageSelector />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {t('settings.resetDefaults')}
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#181d26] text-white rounded-lg font-medium hover:bg-[#0d1218] transition-colors"
          >
            {t('settings.saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {
        // Keep defaults
      }
    }

    const handleSettingsChange = (e: CustomEvent<Settings>) => {
      setSettings(e.detail);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  return settings;
}
