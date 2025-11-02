
import React, { useState, useCallback, useRef } from 'react';
import type { Language } from '../App';
import { translations, MAX_FILE_SIZE_BYTES } from '../constants';
import { UploadCloud, Film } from 'lucide-react';

interface UploadPageProps {
  language: Language;
  toggleLanguage: () => void;
  onUploadComplete: (file: File) => void;
}

export function UploadPage({ language, toggleLanguage, onUploadComplete }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(t.errorSize);
      return;
    }
    
    if (!file.type.startsWith('video/')) {
        setError(t.errorType);
        return;
    }

    setUploadedFile(file);
    setIsComplete(false);
    setUploadProgress(0);

    // Simulate upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
  }, [t.errorSize, t.errorType]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  
  const handleWatchVideo = () => {
    if (uploadedFile) {
      onUploadComplete(uploadedFile);
    }
  };

  const handleCopyLink = () => {
      const link = `https://highupload.com/watch/${uploadedFile?.name.split('.')[0] || 'abc123'}`;
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full px-4">
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 text-sm text-[#b3b3b3] hover:text-white transition-colors duration-200"
      >
        Translate EN / RO
      </button>

      <div className="w-full max-w-2xl text-center">
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={openFilePicker}
          className={`relative flex flex-col items-center justify-center p-10 md:p-20 bg-[#1a1a1a] rounded-2xl border-2 border-dashed border-[#a855f7] transition-all duration-300 cursor-pointer ${
            isDragging ? 'border-solid shadow-[0_0_20px_#a855f7] scale-105' : 'shadow-none'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            accept="video/*"
          />
          <UploadCloud
            className={`w-16 h-16 text-white transition-all duration-300 mb-4 ${
              isDragging ? 'text-[#c084fc] drop-shadow-[0_0_10px_#c084fc]' : ''
            }`}
          />
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-[#b3b3b3]">{t.subtitle}</p>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        
        {uploadProgress !== null && !isComplete && (
          <div className="mt-8 w-full">
             <div className="flex items-center justify-center text-lg text-[#b3b3b3] mb-2">
                <Film className="w-5 h-5 mr-2" />
                <span>{uploadedFile?.name}</span>
            </div>
            <p className="text-lg text-[#b3b3b3] mb-2">{t.uploading} {uploadProgress}%</p>
            <div className="w-full bg-[#2a2a2a] rounded-full h-2.5">
              <div
                className="bg-[#a855f7] h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {isComplete && (
            <div className="mt-8 w-full animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-4">{t.uploadCompleteTitle}</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={handleCopyLink} className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-[#a855f7] text-white font-semibold hover:bg-[#a855f7] hover:shadow-[0_0_15px_#a855f7] transition-all duration-300">
                        {t.copyLinkButton}
                    </button>
                    <button onClick={handleWatchVideo} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#a855f7] text-white font-semibold hover:bg-[#c084fc] hover:shadow-[0_0_15px_#c084fc] transition-all duration-300">
                        {t.watchVideoButton}
                    </button>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}
