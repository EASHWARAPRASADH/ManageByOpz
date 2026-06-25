import React, { useState } from 'react';
import { 
  FileText, RotateCw, Download, Trash2, RefreshCw, CheckCircle2, AlertTriangle, Eye, History, FileCheck
} from 'lucide-react';

interface Document {
  documentName: string;
  documentType: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: string;
  expiryDate?: string;
}

interface DocumentUploadCardProps {
  category: string;
  label: string;
  description?: string;
  document?: Document | null;
  onUpload: (fileName: string, file?: File) => void;
  onDelete: () => void;
  onReplace: (fileName: string, file?: File) => void;
  onAuditLog?: (action: string, detail: string) => void;
}

export function DocumentUploadCard({
  category,
  label,
  description = 'Attach scanned copy for verification.',
  document,
  onUpload,
  onDelete,
  onReplace,
  onAuditLog
}: DocumentUploadCardProps) {
  const [rotation, setRotation] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<{ timestamp: string; action: string }[]>([]);

  const addLog = (action: string) => {
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      action
    };
    setAuditLogs(prev => [logEntry, ...prev]);
    if (onAuditLog) {
      onAuditLog(action, `Category: ${category}`);
    }
  };

  const validateFile = (file: File): boolean => {
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File exceeds 5MB limit.');
      return false;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file type. Allowed: PDF, JPG, PNG, WEBP.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isReplace: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        if (isReplace) {
          onReplace(file.name, file);
          addLog(`Replaced document with ${file.name}`);
        } else {
          onUpload(file.name, file);
          addLog(`Uploaded document ${file.name}`);
        }
      }
    }
  };

  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    addLog(`Rotated preview to ${nextRotation}°`);
  };

  const handleDownload = () => {
    if (!document) return;
    // Create a mock download link
    const blob = new Blob(['Mock file content for: ' + document.documentName], { type: document.mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.documentName;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog(`Downloaded document`);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${document?.documentName}?`)) {
      onDelete();
      addLog(`Deleted document`);
      setRotation(0);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F131F] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider">{label}</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 leading-normal">{description}</p>
        </div>
        {document ? (
          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-transparent text-[10px] font-bold animate-fade-in">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {document.verificationStatus || 'PENDING'}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-100 dark:border-transparent text-[10px] font-bold animate-fade-in">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> Pending
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-2.5 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-455">{errorMsg}</span>
        </div>
      )}

      {document ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40 animate-fade-in">
          {/* Document Preview Thumbnail Box */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-3 h-24 relative overflow-hidden group">
            <div 
              className="transition-transform duration-300 flex flex-col items-center justify-center" 
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <FileCheck className="w-8 h-8 text-indigo-500 mb-1" />
              <span className="text-[9px] font-bold text-slate-550 dark:text-slate-400 font-mono tracking-tight truncate max-w-[80px]">
                {document.documentName.split('.').pop()?.toUpperCase()}
              </span>
            </div>
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow hover:scale-105 transition-transform"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={handleRotate}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow hover:scale-105 transition-transform"
                title="Rotate"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="sm:col-span-2 flex flex-col justify-between space-y-2">
            <div className="min-w-0">
              <p className="font-bold text-xs text-slate-805 dark:text-white truncate" title={document.documentName}>
                {document.documentName}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                {(document.fileSize / 1024).toFixed(0)} KB • {document.mimeType}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                type="button"
                onClick={handleDownload}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" /> Download
              </button>
              
              <label className="cursor-pointer px-2.5 py-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors">
                <RefreshCw className="w-3 h-3 text-indigo-500" /> Replace
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, true)}
                />
              </label>

              <button 
                type="button"
                onClick={handleDelete}
                className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ml-auto"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center bg-slate-50/20 dark:bg-[#080B13]/30">
          <label className="cursor-pointer flex flex-col items-center justify-center">
            <FileText className="w-8 h-8 text-indigo-500/80 mb-2 hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload document scan</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">PDF, JPG, PNG or WEBP up to 5MB</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, false)}
            />
          </label>
        </div>
      )}

      {/* Audit Log / History indicator */}
      {auditLogs.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-[9px] font-bold text-slate-450 animate-fade-in">
          <History className="w-3 h-3 text-slate-400" />
          <span>Last activity: {auditLogs[0].action} at {auditLogs[0].timestamp}</span>
        </div>
      )}

      {/* Lightbox / Modal for Preview */}
      {previewOpen && document && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0F131F] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button 
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              ✕
            </button>
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Document Preview</h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[240px]">
              <div 
                className="transition-transform duration-300 flex flex-col items-center justify-center space-y-3"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <FileCheck className="w-16 h-16 text-indigo-500" />
                <div className="text-center">
                  <p className="font-bold text-xs text-slate-800 dark:text-white">{document.documentName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">Category: {category}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button"
                onClick={handleRotate}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" /> Rotate
              </button>
              <button 
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-3.5 py-2 bg-[#5D69F4] hover:bg-[#4E5AE5] text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
