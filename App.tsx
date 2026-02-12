
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, User, Settings, Upload, Save, Trash2, Scissors, Tv, Video as VideoIcon } from 'lucide-react';
import CameraOverlay from './components/CameraOverlay';
import Timeline from './components/Timeline';
import { Segment, Player } from './types';

const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Acteur Principal', color: '#ef4444' },
];

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activePlayerId] = useState<string>(INITIAL_PLAYERS[0].id);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setSegments([]);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addSegmentPoint = (type: 'start' | 'end') => {
    const player = INITIAL_PLAYERS[0];
    if (type === 'start') {
      const newSegments = [...segments];
      newSegments.push({
        id: player.id,
        label: player.name,
        start: currentTime,
        end: currentTime + 5,
        color: player.color
      });
      setSegments(newSegments);
    } else {
      const lastIdx = segments.length - 1;
      if (lastIdx >= 0) {
        const updated = [...segments];
        updated[lastIdx] = { ...updated[lastIdx], end: currentTime };
        setSegments(updated);
      }
    }
  };

  const deleteSegment = (index: number) => {
    setSegments(prev => prev.filter((_, i) => i !== index));
  };

  const downloadConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(segments, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cinema_scene_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // On calcule l'état actif en dehors du render pour être sûr de la réactivité
  const isActorActive = segments.some(s => currentTime >= s.start && currentTime <= s.end);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 backdrop-blur-2xl sticky top-0 z-[200]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/40">
            <Tv className="text-white" size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black tracking-tighter leading-none">CINÉ-INCRUSTE</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] mt-1">Virtual Acting Studio</p>
          </div>
        </div>

        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${isAdmin ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'}`}
        >
          {isAdmin ? <VideoIcon size={14} /> : <Settings size={14} />}
          {isAdmin ? 'QUITTER ÉDITION' : 'ACCÈS RÉGIE'}
        </button>
      </header>

      <main className="flex-1 flex flex-col p-6 gap-6 max-w-[1600px] mx-auto w-full overflow-y-auto">
        {/* Scène principale */}
        <section className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-zinc-900 flex items-center justify-center group">
          {!videoUrl ? (
            <div className="text-center p-20 max-w-xl animate-in fade-in zoom-in duration-1000">
              <div className="w-32 h-32 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Upload className="text-zinc-500" size={48} />
              </div>
              <h2 className="text-4xl font-black mb-6 tracking-tighter italic">ACTION !</h2>
              <p className="text-zinc-500 mb-12 text-lg font-medium leading-relaxed">Importez une séquence vidéo pour commencer la mise en scène interactive.</p>
              <label className="bg-white text-black px-12 py-5 rounded-3xl font-black cursor-pointer hover:bg-zinc-200 transition-all shadow-2xl active:scale-95 inline-block text-sm tracking-widest uppercase">
                Ouvrir un film
                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {/* Le film */}
              <video 
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain relative z-10"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
              />
              
              {/* L'incrustation de l'acteur */}
              <CameraOverlay 
                isActive={isActorActive} 
                label="ACTEUR PRINCIPAL" 
                color="#ef4444"
              />

              {/* Interface Play/Pause overlay */}
              {!isPlaying && (
                <button 
                  onClick={togglePlay} 
                  className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[150] transition-all"
                >
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.2)] hover:scale-110 transition-transform duration-500">
                    <Play className="text-black fill-black ml-2" size={48} />
                  </div>
                </button>
              )}
            </div>
          )}
        </section>

        {/* Contrôles et Timeline */}
        {videoUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="lg:col-span-3 space-y-6 bg-zinc-900/30 p-10 rounded-[3.5rem] border border-zinc-900/50 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-8">
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-[1.5rem] hover:bg-zinc-200 transition-all shadow-2xl active:scale-90"
                  >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                  </button>
                  <div className="space-y-1">
                    <div className="text-2xl font-black font-mono tracking-tighter">
                      <span className="text-white">{new Date(currentTime * 1000).toISOString().substr(11, 8)}</span>
                      <span className="text-zinc-700 mx-3">/</span>
                      <span className="text-zinc-500">{new Date(duration * 1000).toISOString().substr(11, 8)}</span>
                    </div>
                    <div className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em]">Code Temporel</div>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => addSegmentPoint('start')}
                      className="flex items-center gap-3 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-[10px] font-black transition-all border border-zinc-700 shadow-xl"
                    >
                      <Scissors size={14} className="rotate-180" /> POINT IN
                    </button>
                    <button 
                      onClick={() => addSegmentPoint('end')}
                      className="flex items-center gap-3 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-[10px] font-black transition-all border border-zinc-700 shadow-xl"
                    >
                      <Scissors size={14} /> POINT OUT
                    </button>
                  </div>
                )}
              </div>

              <Timeline 
                duration={duration} 
                currentTime={currentTime} 
                segments={segments} 
                onSeek={seekTo}
                onUpdateSegment={() => {}}
                activeSegmentId={activePlayerId}
              />
            </div>

            <div className="bg-zinc-900/30 p-10 rounded-[3.5rem] border border-zinc-900/50 backdrop-blur-3xl flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 mb-8 flex items-center gap-4">
                <User size={14} /> {isAdmin ? 'RÉGLAGES SCÈNE' : 'ÉTAT DU DIRECT'}
              </h3>
              
              <div className="flex-1 space-y-6">
                <div className={`p-6 rounded-[2rem] border-2 transition-all duration-700 ${isActorActive ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'bg-zinc-950/50 border-zinc-900'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${isActorActive ? 'bg-red-500 animate-ping' : 'bg-zinc-700'}`} />
                      <span className="text-base font-black tracking-tighter">ACTEUR</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600 font-black uppercase">{segments.length} PRISES</span>
                    {isActorActive && (
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">INCRUSTÉ</span>
                    )}
                  </div>
                </div>

                {isAdmin && segments.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {segments.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-900 text-[10px] font-bold font-mono">
                        <span className="text-zinc-500">#{idx+1} <span className="text-white ml-3">{s.start.toFixed(2)}s — {s.end.toFixed(2)}s</span></span>
                        <button onClick={() => deleteSegment(idx)} className="text-zinc-800 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-zinc-900 space-y-4 mt-8">
                {isAdmin ? (
                  <>
                    <button 
                      onClick={downloadConfig}
                      className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black hover:bg-zinc-200 rounded-[1.5rem] text-xs font-black transition-all shadow-2xl"
                    >
                      <Save size={18} /> EXPORTER JSON
                    </button>
                    <button 
                      onClick={() => setSegments([])}
                      className="w-full flex items-center justify-center gap-3 py-5 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-[1.5rem] text-xs font-black transition-all"
                    >
                      <Trash2 size={18} /> RESET
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em] mb-2 italic">Visionnage Automatisé</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-10 text-center opacity-30">
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.5em]">Engine Ciné-Incruste v3.0 &bull; Google MediaPipe AI</span>
      </footer>
    </div>
  );
};

export default App;
