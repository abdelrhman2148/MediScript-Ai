import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { extractPrescriptionData } from '../services/geminiService';
import { savePrescription } from '../services/storageService';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  };

  const handleFileSelection = (fileList: FileList) => {
    const newFiles: File[] = [];
    let hasInvalid = false;

    Array.from(fileList).forEach(file => {
      if (file.type === 'application/pdf') {
        newFiles.push(file);
      } else {
        hasInvalid = true;
      }
    });

    if (hasInvalid) {
      setError('Some files were skipped because they were not PDFs.');
    } else {
      setError(null);
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          // Remove "data:application/pdf;base64," prefix
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length });
        
        const base64 = await convertFileToBase64(file);
        const extractedData = await extractPrescriptionData(base64);
        
        // Save immediately as pending
        await savePrescription(extractedData);
      }
      
      // Navigate to dashboard after all are processed
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Failed to process one or more documents. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Prescriptions</h1>
        <p className="text-slate-500 mt-2">Upload one or more PDF files to automatically extract medication details.</p>
      </div>

      {!isProcessing && (
        <div 
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
              <svg className="h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            
            <p className="text-lg text-slate-700 font-medium mb-2">
              Drag & drop your PDFs here
            </p>
            <p className="text-slate-500 mb-6">or</p>
            
            <label className="relative">
              <Button type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                Browse Files
              </Button>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept=".pdf"
                multiple
                onChange={handleChange}
              />
            </label>
            <p className="text-xs text-slate-400 mt-4">Supported format: PDF</p>
          </div>
        </div>
      )}

      {isProcessing && progress && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
           <h3 className="text-lg font-semibold text-slate-900">Processing Documents...</h3>
           <p className="text-slate-500 mt-2">Analyzing document {progress.current} of {progress.total}</p>
           <div className="w-full bg-slate-100 rounded-full h-2.5 mt-6 max-w-md mx-auto">
              <div 
                className="bg-teal-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
           </div>
        </div>
      )}

      {files.length > 0 && !isProcessing && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-medium text-slate-700">Selected Files ({files.length})</h3>
            <button onClick={() => setFiles([])} className="text-xs text-red-600 hover:text-red-800">Clear All</button>
          </div>
          <ul className="divide-y divide-slate-100">
            {files.map((file, index) => (
              <li key={index} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                   <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
                   </svg>
                   <div>
                      <p className="text-sm font-medium text-slate-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                   </div>
                </div>
                <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      {files.length > 0 && !isProcessing && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full sm:w-auto"
          >
            Process {files.length} Document{files.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Upload;