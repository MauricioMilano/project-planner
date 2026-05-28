"use client";

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, FileJson, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportData) => void;
}

interface ImportData {
  people: any[];
  tasks: any[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: ImportData;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const { t } = useTranslation();
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateJSON = (content: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const data = JSON.parse(content);

      // Check structure
      if (!data.people || !Array.isArray(data.people)) {
        errors.push(t('import.missingPeople'));
      }

      if (!data.tasks || !Array.isArray(data.tasks)) {
        errors.push(t('import.missingTasks'));
      }

      if (errors.length > 0) {
        return { valid: false, errors, warnings };
      }

      // Validate people
      data.people.forEach((person: any, index: number) => {
        if (!person.id) {
          errors.push(`Person ${index + 1}: ${t('import.missingId')}`);
        }
        if (!person.name) {
          errors.push(`Person ${index + 1}: ${t('import.missingName')}`);
        }
        if (!person.color) {
          warnings.push(`Person ${index + 1}: ${t('import.missingColor')}`);
        }
      });

      // Validate tasks
      data.tasks.forEach((task: any, index: number) => {
        if (!task.id) {
          errors.push(`Task ${index + 1}: ${t('import.missingId')}`);
        }
        if (!task.name) {
          errors.push(`Task ${index + 1}: ${t('import.missingName')}`);
        }
        if (!task.startDate) {
          errors.push(`Task ${index + 1}: ${t('import.missingStartDate')}`);
        }
        if (typeof task.duration !== 'number' || task.duration < 1) {
          errors.push(`Task ${index + 1}: ${t('import.invalidDuration')}`);
        }
        if (task.assigneeId && !data.people.find((p: any) => p.id === task.assigneeId)) {
          warnings.push(`Task ${index + 1}: ${t('import.assigneeNotFound')}`);
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        data: { people: data.people || [], tasks: data.tasks || [] }
      };

    } catch (e) {
      return {
        valid: false,
        errors: [t('import.invalidJson')],
        warnings: []
      };
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      alert(t('import.invalidFile'));
      return;
    }

    setSelectedFile(file);
    setImporting(true);

    try {
      const content = await file.text();
      const result = validateJSON(content);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [t('import.failedRead')],
        warnings: []
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleImport = () => {
    if (validationResult?.valid && validationResult.data) {
      onImport(validationResult.data);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setDragActive(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('import.title')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedFile ? (
            <>
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  className="hidden"
                />
                
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload size={28} className="text-gray-500" />
                </div>
                
                <p className="text-gray-700 font-medium mb-1">
                  {t('import.dropzoneTitle')}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {t('import.orClick')}
                </p>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#181d26] text-white rounded-lg text-sm font-medium hover:bg-[#0d1218] transition-colors"
                >
                  {t('import.selectFile')}
                </button>
              </div>

              {/* Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileJson size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('import.jsonFormat')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('import.jsonFormatDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : importing ? (
            <div className="text-center py-8">
              <Loader2 size={32} className="mx-auto text-gray-400 animate-spin mb-4" />
              <p className="text-gray-600">{t('import.readingFile')}</p>
            </div>
          ) : validationResult ? (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileJson size={24} className="text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Summary */}
              {validationResult.valid && validationResult.data && (
                <div className="flex gap-3">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {validationResult.data.people.length}
                    </div>
                    <div className="text-xs text-gray-500">{t('import.people')}</div>
                  </div>
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {validationResult.data.tasks.length}
                    </div>
                    <div className="text-xs text-gray-500">{t('import.tasks')}</div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-red-700">
                      {t('import.validationErrors')}
                    </span>
                  </div>
                  <ul className="text-xs text-red-600 space-y-1">
                    {validationResult.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">
                      {t('import.warnings')}
                    </span>
                  </div>
                  <ul className="text-xs text-yellow-600 space-y-1">
                    {validationResult.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success */}
              {validationResult.valid && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-700">
                      {t('import.validReady')}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setValidationResult(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('import.chooseDifferent')}
                </button>
                {validationResult.valid && (
                  <button
                    onClick={handleImport}
                    className="flex-1 py-2.5 bg-[#181d26] text-white rounded-lg font-medium hover:bg-[#0d1218] transition-colors"
                  >
                    {t('import.importData')}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Warning footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-amber-50">
          <p className="text-xs text-amber-700 flex items-center gap-1.5">
            <AlertCircle size={14} />
            {t('import.importWarning')}
          </p>
        </div>
      </div>
    </div>
  );
}
