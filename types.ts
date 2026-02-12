
export interface Segment {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface AppState {
  videoUrl: string | null;
  segments: Segment[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isAdmin: boolean;
}
