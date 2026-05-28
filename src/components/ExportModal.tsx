"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileDown, FileSpreadsheet, FileJson, FileText, Loader2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'csv' | 'json' | 'markdown';

interface ExportOption {
  id: ExportFormat;
  labelKey: string;
  descKey: string;
  icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
  {
    id: 'pdf',
    labelKey: 'export.pdf',
    descKey: 'export.pdfDesc',
    icon: <FileDown size={24} className="text-red-600" />
  },
  {
    id: 'csv',
    labelKey: 'export.csv',
    descKey: 'export.csvDesc',
    icon: <FileSpreadsheet size={24} className="text-green-600" />
  },
  {
    id: 'json',
    labelKey: 'export.json',
    descKey: 'export.jsonDesc',
    icon: <FileJson size={24} className="text-blue-600" />
  },
  {
    id: 'markdown',
    labelKey: 'export.markdown',
    descKey: 'export.markdownDesc',
    icon: <FileText size={24} className="text-purple-600" />
  }
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { t, i18n } = useTranslation();
  const { state } = useProject();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: ExportFormat) => {
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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('export.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-3">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleExport(option.id)}
              disabled={exporting !== null}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                {exporting === option.id ? (
                  <Loader2 size={24} className="text-gray-500 animate-spin" />
                ) : (
                  option.icon
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{t(option.labelKey)}</div>
                <div className="text-sm text-gray-500">{t(option.descKey)}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            {state.tasks.length} {t('export.taskCount')} • {state.people.length} {t('export.teamMembers')}
          </p>
        </div>
      </div>
    </div>
  );
}

// Export functions with translations
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
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #181d26;
        }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 32px; }
        .section { margin-bottom: 32px; }
        .section-title { 
          font-size: 14px; 
          font-weight: 600; 
          text-transform: uppercase; 
          color: #666;
          margin-bottom: 16px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 8px;
        }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8fafc; font-weight: 600; }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .badge-high { background: #aa2d00; color: white; }
        .badge-medium { background: #1b61c9; color: white; }
        .badge-low { background: #0a2e0e; color: white; }
        .badge-done { background: #006400; color: white; }
        .badge-todo { background: #f8fafc; color: #666; border: 1px solid #ddd; }
        .badge-progress { background: #f4d35e; color: #181d26; }
        .team-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
          gap: 12px; 
        }
        .person-card { padding: 12px; border: 1px solid #eee; border-radius: 8px; }
        .person-name { font-weight: 600; }
        .person-role { font-size: 12px; color: #666; }
        .person-capacity { font-size: 12px; color: #1b61c9; margin-top: 4px; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #999;
        }
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
                <div class="person-capacity">${t('peoplePanel.title')}</div>
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
              ${tasks.map((t: any) => {
                const assignee = people.find((p: any) => p.id === t.assigneeId);
                return `
                  <tr>
                    <td>${t.name}</td>
                    <td>${assignee ? assignee.name : '—'}</td>
                    <td>${formatDate(t.startDate)}</td>
                    <td>${t.duration} ${t.duration !== 1 ? t('days.other') : t('days.one')}</td>
                    <td><span class="badge badge-${t.priority}">${t(`priority.${t.priority}`)}</span></td>
                    <td><span class="badge badge-${t.status === 'in-progress' ? 'progress' : t.status}">${getStatusLabel(t.status)}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : '<p>No tasks added yet.</p>'}
      </div>

      <div class="footer">${t('header.title')}</div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

async function exportToCSV(state: any, t: any) {
  const people = state.people || [];
  const tasks = state.tasks || [];

  const headers = [
    t('task.taskNameLabel'),
    t('task.assigneeLabel'),
    t('task.startDate'),
    t('task.duration'),
    t('task.priority'),
    t('task.status'),
    t('task.notesLabel')
  ];
  const rows = tasks.map((task: any) => {
    const assignee = people.find((p: any) => p.id === task.assigneeId);
    return [
      `"${task.name}"`,
      `"${assignee ? assignee.name : ''}"`,
      task.startDate,
      task.duration,
      t(`priority.${task.priority}`),
      t(`status.${task.status}`),
      `"${task.notes || ''}"`
    ].join(',');
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

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, 'application/json', 'project-planner-backup.json');
}

async function exportToMarkdown(state: any, t: any, lang: string) {
  const people = state.people || [];
  const tasks = state.tasks || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
