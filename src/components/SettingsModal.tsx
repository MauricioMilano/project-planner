"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Globe, Download, Upload, FileDown, FileSpreadsheet, FileJson, FileText, Loader2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

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

type SettingsTab = 'display' | 'data' | 'language';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useProject();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<SettingsTab>('display');
  const [exporting, setExporting] = useState<string | null>(null);

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

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  // Export functions
  const handleExport = async (format: string) => {
    setExporting(format);
    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(state, t, i18n.language);
          break;
        case 'csv':
          await exportToCSV(state, t);
          break;
        case 'json':
          await exportToJSON(state);
          break;
        case 'markdown':
          await exportToMarkdown(state, t, i18n.language);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('export.exportFailed'));
    } finally {
      setExporting(null);
    }
  };

  const handleImport = (data: { people: any[]; tasks: any[] }) => {
    dispatch({
      type: 'LOAD_STATE',
      payload: {
        people: data.people,
        tasks: data.tasks,
        projectStartDate: new Date().toISOString().split('T')[0]
      }
    });
    alert(t('alerts.clearDataSuccess'));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'display' as const, label: t('settings.displaySection'), icon: '🎨' },
    { id: 'data' as const, label: t('export.title'), icon: '📁' },
    { id: 'language' as const, label: t('settings.languageSection'), icon: '🌐' },
  ];

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

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#181d26] text-[#181d26]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
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
            </div>
          )}

          {/* Data Tab (Import/Export) */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Export Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Download size={16} />
                  {t('export.title')}
                </h3>
                <div className="space-y-2">
                  {[
                    { id: 'pdf', label: t('export.pdf'), desc: t('export.pdfDesc'), icon: <FileDown size={20} className="text-red-600" /> },
                    { id: 'csv', label: t('export.csv'), desc: t('export.csvDesc'), icon: <FileSpreadsheet size={20} className="text-green-600" /> },
                    { id: 'json', label: t('export.json'), desc: t('export.jsonDesc'), icon: <FileJson size={20} className="text-blue-600" /> },
                    { id: 'markdown', label: t('export.markdown'), desc: t('export.markdownDesc'), icon: <FileText size={20} className="text-purple-600" /> },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleExport(option.id)}
                      disabled={exporting !== null}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      {exporting === option.id ? (
                        <Loader2 size={20} className="text-gray-400 animate-spin" />
                      ) : (
                        option.icon
                      )}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Import Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Upload size={16} />
                  {t('import.title')}
                </h3>
                <ImportSection onImport={handleImport} t={t} />
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.languageLabel')}
                </label>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        i18n.language === lang.code
                          ? 'border-[#181d26] bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className={`font-medium ${
                        i18n.language === lang.code ? 'text-[#181d26]' : 'text-gray-700'
                      }`}>
                        {lang.name}
                      </span>
                      {i18n.language === lang.code && (
                        <span className="ml-auto text-green-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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

// Import Section Component
function ImportSection({ onImport, t }: { onImport: (data: any) => void; t: any }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      alert(t('import.invalidFile'));
      return;
    }

    setSelectedFile(file);
    setImporting(true);

    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      if (!data.people || !Array.isArray(data.people) || !data.tasks || !Array.isArray(data.tasks)) {
        alert(t('import.invalidFile'));
        return;
      }

      if (confirm(t('import.replaceConfirm'))) {
        onImport({ people: data.people, tasks: data.tasks });
      }
    } catch (error) {
      alert(t('import.importError'));
    } finally {
      setImporting(false);
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        className="hidden"
      />
      
      {selectedFile ? (
        <div className="flex items-center justify-center gap-2">
          <FileJson size={20} className="text-blue-500" />
          <span className="text-sm text-gray-700">{selectedFile.name}</span>
          {importing && <Loader2 size={16} className="text-gray-400 animate-spin" />}
        </div>
      ) : (
        <>
          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">{t('import.dropzone')}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-[#181d26] text-white text-sm rounded-lg hover:bg-[#0d1218] transition-colors"
          >
            {t('import.selectFile')}
          </button>
        </>
      )}
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

// Export functions
async function exportToPDF(state: any, t: any, lang: string) {
  const people = state.people || [];
  const tasks = state.tasks || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done': return t('status.done');
      case 'in-progress': return t('status.in-progress');
      default: return t('status.todo');
    }
  };

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${t('header.title')} - Export</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #181d26; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 32px; }
        .section { margin-bottom: 32px; }
        .section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; color: #666; margin-bottom: 16px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8fafc; font-weight: 600; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .badge-high { background: #aa2d00; color: white; }
        .badge-medium { background: #1b61c9; color: white; }
        .badge-low { background: #0a2e0e; color: white; }
        .badge-done { background: #006400; color: white; }
        .badge-todo { background: #f8fafc; color: #666; border: 1px solid #ddd; }
        .badge-progress { background: #f4d35e; color: #181d26; }
        .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .person-card { padding: 12px; border: 1px solid #eee; border-radius: 8px; }
        .person-name { font-weight: 600; }
        .person-role { font-size: 12px; color: #666; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${t('header.title')}</h1>
      <p class="subtitle">${formatDate(new Date().toISOString())}</p>

      <div class="section">
        <div class="section-title">${t('export.teamMembers')} (${people.length})</div>
        ${people.length > 0 ? `
          <div class="team-grid">
            ${people.map((p: any) => `
              <div class="person-card">
                <div class="person-name">${p.name}</div>
                ${p.role ? `<div class="person-role">${p.role}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p>No team members added yet.</p>'}
      </div>

      <div class="section">
        <div class="section-title">${t('export.taskCount')} (${tasks.length})</div>
        ${tasks.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>${t('task.taskNameLabel')}</th>
                <th>${t('task.assigneeLabel')}</th>
                <th>${t('task.startDate')}</th>
                <th>${t('task.duration')}</th>
                <th>${t('task.priority')}</th>
                <th>${t('task.status')}</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map((task: any) => {
                const assignee = people.find((p: any) => p.id === task.assigneeId);
                return `
                  <tr>
                    <td>${task.name}</td>
                    <td>${assignee ? assignee.name : '—'}</td>
                    <td>${formatDate(task.startDate)}</td>
                    <td>${task.duration} ${task.duration !== 1 ? t('days.other') : t('days.one')}</td>
                    <td><span class="badge badge-${task.priority}">${t(`priority.${task.priority}`)}</span></td>
                    <td><span class="badge badge-${task.status === 'in-progress' ? 'progress' : task.status}">${getStatusLabel(task.status)}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : '<p>No tasks added yet.</p>'}
      </div>

      <div class="footer">${t('header.title')}</div>

      <script>
        window.onload = function() { setTimeout(function() { window.print(); }, 500); };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

async function exportToCSV(state: any, t: any) {
  const people = state.people || [];
  const tasks = state.tasks || [];

  const headers = [t('task.taskNameLabel'), t('task.assigneeLabel'), t('task.startDate'), t('task.duration'), t('task.priority'), t('task.status'), t('task.notesLabel')];
  const rows = tasks.map((task: any) => {
    const assignee = people.find((p: any) => p.id === task.assigneeId);
    return [`"${task.name}"`, `"${assignee ? assignee.name : ''}"`, task.startDate, task.duration, t(`priority.${task.priority}`), t(`status.${task.status}`), `"${task.notes || ''}"`].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(csv, 'text/csv', 'project-planner-tasks.csv');
}

async function exportToJSON(state: any) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    people: state.people || [],
    tasks: state.tasks || []
  };

  downloadFile(JSON.stringify(exportData, null, 2), 'application/json', 'project-planner-backup.json');
}

async function exportToMarkdown(state: any, t: any, lang: string) {
  const people = state.people || [];
  const tasks = state.tasks || [];

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const md = `# ${t('header.title')}

${formatDate(new Date().toISOString())}

## ${t('export.teamMembers')} (${people.length})

${people.length > 0 ? people.map((p: any) => `- **${p.name}**${p.role ? ` - ${p.role}` : ''}`).join('\n') : '_No team members yet_'}

## ${t('export.taskCount')} (${tasks.length})

| ${t('task.taskNameLabel')} | ${t('task.assigneeLabel')} | ${t('task.startDate')} | ${t('task.duration')} | ${t('task.priority')} | ${t('task.status')} |
|------|----------|------------|----------|----------|--------|
${tasks.length > 0 ? tasks.map((task: any) => {
  const assignee = people.find((p: any) => p.id === task.assigneeId);
  return `| ${task.name} | ${assignee ? assignee.name : '—'} | ${formatDate(task.startDate)} | ${task.duration}d | ${t(`priority.${task.priority}`)} | ${t(`status.${task.status}`)} |`;
}).join('\n') : '|_No tasks yet_|'}

---

_${t('header.title')}_
`;

  downloadFile(md, 'text/markdown', 'project-planner-report.md');
}

function downloadFile(content: string, mimeType: string, fileName: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
