
import React from 'react';
import { Segment } from '../types';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments: Segment[];
  onSeek: (time: number) => void;
  onUpdateSegment: (id: string, start: number, end: number) => void;
  activeSegmentId: string | null;
}

const Timeline: React.FC<TimelineProps> = ({ 
  duration, 
  currentTime, 
  segments, 
  onSeek,
  onUpdateSegment,
  activeSegmentId
}) => {
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;
    onSeek(clickTime);
  };

  return (
    <div className="space-y-4">
      <div className="relative h-12 bg-zinc-900 rounded-lg overflow-hidden cursor-crosshair group shadow-inner" onClick={handleTimelineClick}>
        {/* Segments Visualization */}
        {segments.map((seg) => {
          const startPct = (seg.start / duration) * 100;
          const endPct = (seg.end / duration) * 100;
          const width = endPct - startPct;
          
          return (
            <div
              key={seg.id}
              className={`absolute h-full transition-all border-x-2 border-white/20 flex items-center justify-center text-[10px] font-bold overflow-hidden select-none ${activeSegmentId === seg.id ? 'ring-2 ring-white z-10 opacity-100' : 'opacity-60 hover:opacity-100'}`}
              style={{
                left: `${startPct}%`,
                width: `${width}%`,
                backgroundColor: seg.color,
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              <span className="truncate px-1">{seg.label}</span>
            </div>
          );
        })}

        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none transition-all duration-75"
          style={{ left: `${percentage}%` }}
        >
          <div className="absolute top-0 -left-1.5 w-3 h-3 bg-red-500 rounded-full shadow-lg" />
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
        <span>00:00:00</span>
        <span>{new Date(currentTime * 1000).toISOString().substr(11, 8)} / {new Date(duration * 1000).toISOString().substr(11, 8)}</span>
      </div>
    </div>
  );
};

export default Timeline;
