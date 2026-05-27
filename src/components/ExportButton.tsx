import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Create a printable version of the Gantt chart
      const ganttContainer = document.querySelector('.flex-1.overflow-hidden') as HTMLElement;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
      }

      const people = JSON.parse(localStorage.getItem('project-planner-state') || '{}').people || [];
      const tasks = JSON.parse(localStorage.getItem('project-planner-state') || '{}').tasks || [];

      // Build HTML for print
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
            h1 { 
              font-size: 24px; 
              margin-bottom: 8px; 
            }
            .subtitle { 
              color: #666; 
              margin-bottom: 32px; 
            }
            .section { 
              margin-bottom: 32px; 
            }
            .section-title { 
              font-size: 14px; 
              font-weight: 600; 
              text-transform: uppercase; 
              color: #666;
              margin-bottom: 16px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              font-size: 13px;
            }
            th, td { 
              padding: 10px 12px; 
              text-align: left; 
              border-bottom: 1px solid #eee; 
            }
            th { 
              background: #f8fafc;
              font-weight: 600;
            }
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
            .person-card {
              padding: 12px;
              border: 1px solid #eee;
              border-radius: 8px;
            }
            .person-name { font-weight: 600; }
            .person-role { font-size: 12px; color: #666; }
            .person-capacity { 
              font-size: 12px; 
              color: #1b61c9; 
              margin-top: 4px; 
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #999;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Project Planner</h1>
          <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>

          <div class="section">
            <div class="section-title">Team Members (${people.length})</div>
            ${people.length > 0 ? `
              <div class="team-grid">
                ${people.map((p: any) => `
                  <div class="person-card">
                    <div class="person-name">${p.name}</div>
                    ${p.role ? `<div class="person-role">${p.role}</div>` : ''}
                    <div class="person-capacity">${p.capacity}% capacity</div>
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
                        <td>${new Date(t.startDate).toLocaleDateString()}</td>
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

          <div class="footer">
            Generated by Project Planner
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      title="Export to PDF"
    >
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <FileDown size={16} />
      )}
      <span className="hidden sm:inline text-sm font-medium">Export</span>
    </button>
  );
}
