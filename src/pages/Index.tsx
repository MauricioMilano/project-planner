"use client";

import React, { useState, useEffect } from 'react';
import { ProjectProvider } from '../context/ProjectContext';
import { Header } from '../components/Header';
import { PeoplePanel } from '../components/PeoplePanel';
import { GanttChart } from '../components/GanttChart';
import { AddPersonModal } from '../components/AddPersonModal';
import { TaskModal } from '../components/TaskModal';
import { SettingsModal, useSettings } from '../components/SettingsModal';
import { useProject } from '../context/ProjectContext';
import { addDays } from '../hooks/useGanttCalculations';

function ProjectPlannerApp() {
  const { state, addTask, updateTask, addPerson } = useProject();
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null);
  useSettings();

  const handleAddTask = () => {
    setNewTaskDate(null);
    setIsAddTaskOpen(true);
  };

  const handleAddPerson = () => {
    setIsAddPersonOpen(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (taskData.id) {
      updateTask(taskData);
    } else {
      addTask(taskData);
    }
    setIsAddTaskOpen(false);
    setNewTaskDate(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header 
        onAddTask={handleAddTask} 
        onAddPerson={handleAddPerson}
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
        onSave={handleSaveTask}
        people={state.people}
        allTasks={state.tasks}
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