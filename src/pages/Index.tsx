"use client";

import React, { useState } from 'react';
import { ProjectProvider } from '../context/ProjectContext';
import { Header } from '../components/Header';
import { PeoplePanel } from '../components/PeoplePanel';
import { GanttChart } from '../components/GanttChart';
import { AddPersonModal } from '../components/AddPersonModal';
import { TaskModal } from '../components/TaskModal';
import { SettingsModal } from '../components/SettingsModal';

function ProjectPlannerApp() {
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <PeoplePanel />
        <GanttChart />
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
      />

      {/* Add Task Modal */}
      <TaskModal
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setNewTaskDate(null);
        }}
        task={null}
        defaultStartDate={newTaskDate}
        onSave={(taskData) => {
          setIsAddTaskOpen(false);
          setNewTaskDate(null);
        }}
        people={[]}
        allTasks={[]}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function Index() {
  return (
    <ProjectProvider>
      <ProjectPlannerApp />
    </ProjectProvider>
  );
}