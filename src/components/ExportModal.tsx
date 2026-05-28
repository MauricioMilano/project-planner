"use client";

import React, { useState } from 'react';
import { X, FileDown, FileSpreadsheet, FileJson, FileText, Loader2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'csv' | 'json' | 'markdown';

interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
  {
    id: 'pdf',
    label: 'PDF Report',
    description: 'Visual report with tables and cards, ideal for printing',
    icon: <FileDown size={24} className="text-red-600" />
  },
  {
    id: 'csv',
    label: 'CSV Spreadsheet',
    description: 'Task data for analysis in Excel or Google Sheets',
    icon: <FileSpreadsheet size={24} className="text-green-600" />
  },
  {
    id: 'json',
    label: 'JSON Backup',
    description: 'Complete data export for backups or integrations',
    icon: <FileJson size={24} className="text-blue-600" />
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'Documentation format for wikis and readmes',
    icon: <FileText size={24} className="text-purple-600" />
  }
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { state } = useProject();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(state);
          break;
        case 'csv':
          await exportToCSV(state);
          break;
        case 'json':
          await exportToJSON(state);
          break;
        case 'markdown':
          await exportToMarkdown(state);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
      onClose();
    }
  };

  const getFileName = (format: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `project-planner-${date}.${format}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Export Project
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
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            {state.tasks.length} tasks • {state.people.length} team members
          </p>
        </div>
      </div>
    </div>
  );
}

// Export functions
async function exportToPDF(state: any) {
  const people = state.people || [];
  const tasks = state.tasks || [];

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Project Planner - Export</title>
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
      <h1>Project Planner</h1>
      <p class="subtitle">Generated on ${formatDate(new Date().toISOString())}</p>

      <div class="section">
        <div class="section-title">Team Members (${people.length})</div>
        ${people.length > 0 ? `
          <div class="team-grid">
            ${people.map((p: any) => `
              <div class="person-card">
                <div class="person-name">${p.name}</div>
                ${p.role ? `<div class="person-role">${p.role}</div>` : ''}
                <div class="person-capacity">Capacity assigned</div>
              </div>
            `).join('')}
          </div>
        ` : '<p>No team members added yet.</p>'}
      </div>

      <div class="section">
        <div class="section-title">Tasks (${tasks.length})</div>
        ${tasks.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Assignee</th>
                <th>Start Date</th>
                <th>Duration</th>
                <th>Priority</th>
                <th>Status</th>
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
                    <td>${t.duration} day${t.duration !== 1 ? 's' : ''}</td>
                    <td><span class="badge badge-${t.priority}">${t.priority}</span></td>
                    <td><span class="badge badge-${t.status === 'in-progress' ? 'progress' : t.status}">${t.status === 'in-progress' ? 'In Progress' : t.status === 'done' ? 'Done' : 'To Do'}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : '<p>No tasks added yet.</p>'}
      </div>

      <div class="footer">Generated by Project Planner</div>

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

async function exportToCSV(state: any) {
  const people = state.people || [];
  const tasks = state.tasks || [];

  const headers = ['Task Name', 'Assignee', 'Start Date', 'Duration (days)', 'Priority', 'Status', 'Notes'];
  const rows = tasks.map((t: any) => {
    const assignee = people.find((p: any) => p.id === t.assigneeId);
    return [
      `"${t.name}"`,
      `"${assignee ? assignee.name : ''}"`,
      t.startDate,
      t.duration,
      t.priority,
      t.status,
      `"${t.notes || ''}"`
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

async function exportToMarkdown(state: any) {
  const people = state.people || [];
  const tasks = state.tasks || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const md = `# Project Planner

Exported on ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}

## Team Members (${people.length})

${people.length > 0 ? people.map((p: any) => `- **${p.name}**${p.role ? ` - ${p.role}` : ''}`).join('\n') : '_No team members yet_'}

## Tasks (${tasks.length})

| Task | Assignee | Start Date | Duration | Priority | Status |
|------|----------|------------|----------|----------|--------|
${tasks.length > 0 ? tasks.map((t: any) => {
  const assignee = people.find((p: any) => p.id === t.assigneeId);
  return `| ${t.name} | ${assignee ? assignee.name : '—'} | ${formatDate(t.startDate)} | ${t.duration}d | ${t.priority} | ${t.status} |`;
}).join('\n') : '|_No tasks yet_|'}

---

_Generated by Project Planner_
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