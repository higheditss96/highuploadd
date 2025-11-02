
import React, { useState } from 'react';
import { UploadPage } from './components/UploadPage';
import { VideoPlayerPage } from './components/VideoPlayerPage';

export type Language = 'en' | 'ro';

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'en' ? 'ro' : 'en'));
  };
  
  const handleUploadComplete = (file: File) => {
    setVideoFile(file);
  };

  const handleGoHome = () => {
    setVideoFile(null);
  };

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen w-full font-sans">
      {videoFile ? (
        <VideoPlayerPage file={videoFile} onGoHome={handleGoHome} />
      ) : (
        <UploadPage
          language={language}
          toggleLanguage={toggleLanguage}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

export default App;
