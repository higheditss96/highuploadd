
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { 
    Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize, Settings, ChevronsRight,
    Youtube, Rewind, FastForward, PictureInPicture, Captions, RefreshCw
} from 'lucide-react';
import screenfull from 'screenfull';

interface VideoPlayerProps {
    url: string;
}

interface PlayerState {
    playing: boolean;
    volume: number;
    muted: boolean;
    played: number;
    seeking: boolean;
    duration: number;
    playbackRate: number;
    pip: boolean;
    controlsVisible: boolean;
    settingsOpen: boolean;
}

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
        return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
};

export const VideoPlayer = ({ url }: VideoPlayerProps) => {
    const playerRef = useRef<ReactPlayer>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    const [state, setState] = useState<PlayerState>({
        playing: true,
        volume: 0.8,
        muted: false,
        played: 0,
        seeking: false,
        duration: 0,
        playbackRate: 1.0,
        pip: false,
        controlsVisible: true,
        settingsOpen: false,
    });

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const controlsTimeoutRef = useRef<number | null>(null);

    const hideControls = () => {
        if (state.settingsOpen) return;
        setState(s => ({ ...s, controlsVisible: false }));
    };

    const showControls = () => {
        setState(s => ({ ...s, controlsVisible: true }));
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
    };

    useEffect(() => {
        if (state.playing) {
            showControls();
        }
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.playing, state.settingsOpen]);


    const handlePlayPause = () => setState({ ...state, playing: !state.playing });
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setState({ ...state, volume: newVolume, muted: newVolume === 0 });
    };
    const handleToggleMute = () => setState({ ...state, muted: !state.muted });
    const handleProgress = (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number; }) => {
        if (!state.seeking) {
            setState({ ...state, played: progress.played });
        }
    };
    const handleDuration = (duration: number) => setState({ ...state, duration });
    const handleSeekMouseDown = () => setState({ ...state, seeking: true });
    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, played: parseFloat(e.target.value) });
    };
    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        setState({ ...state, seeking: false });
        playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value));
    };

    const handlePlaybackRateChange = (rate: number) => {
        setState({ ...state, playbackRate: rate, settingsOpen: false });
    };
    
    const handleTogglePIP = () => {
        if (ReactPlayer.canEnablePIP(url)) {
            setState({ ...state, pip: !state.pip });
        }
    };

    const handleToggleFullscreen = () => {
        if (screenfull.isEnabled && playerContainerRef.current) {
            screenfull.toggle(playerContainerRef.current);
        }
    };
    
    const handleSeek = (amount: number) => {
        const newTime = Math.max(0, Math.min(state.duration, (playerRef.current?.getCurrentTime() || 0) + amount));
        playerRef.current?.seekTo(newTime, 'seconds');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'ArrowRight':
                    handleSeek(5);
                    break;
                case 'ArrowLeft':
                    handleSeek(-5);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setState(s => ({...s, volume: Math.min(1, s.volume + 0.1)}));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setState(s => ({...s, volume: Math.max(0, s.volume - 0.1)}));
                    break;
                case 'KeyF':
                     handleToggleFullscreen();
                    break;
                case 'KeyM':
                    handleToggleMute();
                    break;
                case 'KeyP':
                    handleTogglePIP();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.duration]);

    const { playing, volume, muted, played, duration, playbackRate, pip, controlsVisible, settingsOpen } = state;
    const isFullscreen = screenfull.isFullscreen;

    const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const playedSeconds = duration * played;

    if (!isClient) {
        return <div className="w-full h-full bg-black flex items-center justify-center text-white">Loading Player...</div>;
    }

    return (
        <div 
            ref={playerContainerRef} 
            className="relative w-full h-full player-wrapper"
            onMouseMove={showControls}
            onMouseLeave={hideControls}
        >
            <ReactPlayer
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                playbackRate={playbackRate}
                pip={pip}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onEnded={() => setState(s => ({...s, playing: false}))}
                onEnablePIP={() => setState(s => ({ ...s, pip: true }))}
                onDisablePIP={() => setState(s => ({ ...s, pip: false }))}
                onClick={handlePlayPause}
                config={{ file: { attributes: { controlsList: 'nodownload' } } }}
            />

            <div 
                className={`absolute inset-0 transition-opacity duration-300 ${controlsVisible || !playing ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
            >
                {/* Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"></div>

                {/* Top watermark */}
                 <div className="absolute top-4 left-4 text-white/50 text-xl font-bold select-none">HIGHUPLOAD</div>


                {/* Central Play/Pause Button */}
                {!playing &&
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                         <button onClick={handlePlayPause} className="p-4 bg-black/50 rounded-full hover:bg-black/75 transition-colors">
                            <Play className="w-16 h-16 text-white" fill="white"/>
                         </button>
                    </div>
                }

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2 pointer-events-auto">
                    {/* Progress Bar */}
                     <div className="relative group w-full h-3 flex items-center cursor-pointer">
                        <input
                            type="range" min={0} max={0.999999} step="any"
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                            className="absolute w-full h-full appearance-none bg-transparent m-0 z-10 cursor-pointer"
                        />
                         <div className="absolute w-full h-[5px] group-hover:h-1 bg-gray-600/50 rounded-full transition-all duration-200">
                             <div style={{width: `${played * 100}%`}} className="h-full bg-[#a855f7] rounded-full"></div>
                         </div>
                    </div>
                   
                    {/* Main Controls */}
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={handlePlayPause} className="hover:scale-110 transition-transform">
                                {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
                            </button>
                             <div className="flex items-center gap-2 group">
                                <button onClick={handleToggleMute}>
                                    <VolumeIcon className="w-6 h-6" />
                                </button>
                                <input
                                    type="range" min={0} max={1} step="any" value={muted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover:w-20 h-1 appearance-none bg-[#c084fc] rounded-full outline-none transition-all duration-300 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                            </div>
                            <div className="text-sm font-mono select-none">
                                <span>{formatTime(playedSeconds)}</span> / <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button onClick={() => setState(s => ({...s, settingsOpen: !s.settingsOpen}))}>
                                    <Settings className="w-6 h-6" />
                                </button>
                                {settingsOpen && (
                                     <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 backdrop-blur-sm">
                                        <div className="text-sm text-gray-400 px-2 py-1">Playback Speed</div>
                                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                            <button 
                                                key={speed} 
                                                onClick={() => handlePlaybackRateChange(speed)}
                                                className={`w-full text-left px-2 py-1 rounded hover:bg-white/10 ${playbackRate === speed ? 'text-[#a855f7]' : ''}`}
                                            >
                                                {speed === 1 ? 'Normal' : `${speed}x`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {ReactPlayer.canEnablePIP(url) && (
                                <button onClick={handleTogglePIP}>
                                    <PictureInPicture className="w-6 h-6" />
                                </button>
                            )}
                            <button onClick={handleToggleFullscreen}>
                                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
