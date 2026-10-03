'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Sparkles,
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (currentSecond: number, duration: number) => void;
  onEnded?: () => void;
  seekTarget?: number | null;
}

export default function VideoPlayer({
  src,
  poster,
  onTimeUpdate,
  onEnded,
  seekTarget,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [levels, setLevels] = useState<{ id: number; height: number; name: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Initialize HLS.js or native video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported() && src.includes('.m3u8')) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const parsedLevels = data.levels.map((lvl, index) => ({
          id: index,
          height: lvl.height,
          name: `${lvl.height}p`,
        }));
        setLevels(parsedLevels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS support
      video.src = src;
    } else {
      video.src = src;
    }
  }, [src]);

  // Handle external seek requests (e.g. from AI Tutor timestamp clicks)
  useEffect(() => {
    if (seekTarget !== null && seekTarget !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTarget;
      setCurrentTime(seekTarget);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [seekTarget]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    onTimeUpdate?.(cur, dur);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setVolume(val);
      setIsMuted(val === 0);
    }
  };

  const handleSpeedChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const handleQualityChange = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
      setShowSettings(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group select-none shadow-2xl border border-slate-800"
    >
      <video
        ref={videoRef}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Video Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
        {/* Top Bar (Watermark & AI citation status) */}
        <div className="flex items-center justify-between text-xs text-white/80 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-[11px] font-medium">HLS ABR Streaming</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400">EduYug Video Player</div>
        </div>

        {/* Bottom Controls */}
        <div className="space-y-2 pointer-events-auto">
          {/* Progress Timeline Scrub Bar */}
          <div className="relative flex items-center group/progress">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:h-2 transition-all"
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-white">
            {/* Left Controls (Play, Skip, Time) */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => skipSeconds(-10)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => skipSeconds(10)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 opacity-0 group-hover/volume:opacity-100 transition-opacity"
                />
              </div>

              {/* Time Display */}
              <div className="text-xs font-medium text-slate-300">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-slate-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls (Speed, Quality, Fullscreen) */}
            <div className="flex items-center gap-2 relative">
              {/* Settings Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1 text-xs"
                  title="Player Settings"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">{playbackRate}x</span>
                </button>

                {/* Settings Menu Popup */}
                {showSettings && (
                  <div className="absolute right-0 bottom-10 w-48 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs space-y-3 z-50">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Playback Speed
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handleSpeedChange(rate)}
                            className={`py-1 rounded text-center font-semibold ${
                              playbackRate === rate ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {levels.length > 0 && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Resolution (ABR)
                        </span>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleQualityChange(-1)}
                            className={`w-full py-1 px-2 rounded text-left font-semibold ${
                              currentLevel === -1 ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            Auto (Adaptive)
                          </button>
                          {levels.map((lvl) => (
                            <button
                              key={lvl.id}
                              onClick={() => handleQualityChange(lvl.id)}
                              className={`w-full py-1 px-2 rounded text-left font-semibold ${
                                currentLevel === lvl.id ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              {lvl.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
