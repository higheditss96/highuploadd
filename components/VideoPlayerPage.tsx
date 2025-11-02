
import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';

interface VideoPlayerPageProps {
  file: File;
  onGoHome: () => void;
}

export function VideoPlayerPage({ file, onGoHome }: VideoPlayerPageProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0e0e0e] w-full">
      <header className="absolute top-0 left-0 p-4 z-50 w-full flex justify-between items-center">
        <h1 
          className="text-2xl font-bold text-purple-400 cursor-pointer"
          onClick={onGoHome}
        >
          HIGHUPLOAD
        </h1>
        <button onClick={onGoHome} className="text-sm text-[#b3b3b3] hover:text-white transition-colors duration-200">
          Upload Another Video
        </button>
      </header>
      <div className="w-full h-full max-w-screen-2xl aspect-video bg-black">
        {videoUrl && <VideoPlayer url={videoUrl} />}
      </div>
    </div>
  );
}
