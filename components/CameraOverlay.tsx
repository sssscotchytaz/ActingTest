
import React, { useEffect, useRef, useState } from 'react';

interface CameraOverlayProps {
  isActive: boolean;
  label: string;
  color: string;
  className?: string;
}

declare const SelfieSegmentation: any;

const CameraOverlay: React.FC<CameraOverlayProps> = ({ isActive, label, color, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let segmentation: any = null;
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const onResults = (results: any) => {
      if (!canvasRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      const { width, height } = canvasRef.current;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, width, height);
      
      // Dessiner le masque blanc sur fond noir
      canvasCtx.drawImage(results.segmentationMask, 0, 0, width, height);

      // Garder uniquement les pixels de la caméra qui sont sur le blanc du masque
      canvasCtx.globalCompositeOperation = 'source-in';
      canvasCtx.drawImage(results.image, 0, 0, width, height);
      
      canvasCtx.restore();
    };

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: 30 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        segmentation = new SelfieSegmentation({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });

        segmentation.setOptions({
          modelSelection: 1,
          selfieMode: true,
        });

        segmentation.onResults(onResults);

        const processVideo = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            await segmentation.send({ image: videoRef.current });
          }
          animationFrameId = requestAnimationFrame(processVideo);
        };

        processVideo();
        setIsReady(true);
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Erreur caméra ou IA.");
      }
    };

    startCamera();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (segmentation) segmentation.close();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-700 ${className} ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ zIndex: 100 }}
    >
      {/* Vidéo source : indispensable pour MediaPipe, on la rend quasi-invisible mais active */}
      <video 
        ref={videoRef} 
        playsInline 
        muted 
        className="absolute opacity-[0.01] w-px h-px pointer-events-none"
      />
      
      <div className="relative w-full h-full flex items-center justify-center">
        {/* État de chargement */}
        {!isReady && !error && isActive && (
          <div className="bg-black/80 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-xl animate-pulse">
            <p className="text-xs font-black tracking-widest text-white uppercase">Démarrage Caméra IA...</p>
          </div>
        )}

        {/* Le Canvas où l'acteur est détouré */}
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
          className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]"
        />

        {/* Label flottant */}
        <div 
          className="absolute top-10 left-10 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-3 border-2 shadow-2xl backdrop-blur-md transition-transform"
          style={{ 
            backgroundColor: `${color}33`, 
            borderColor: color, 
            color: color,
            transform: isActive ? 'translateY(0)' : 'translateY(-20px)'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {label}
        </div>
      </div>

      {error && isActive && (
        <div className="absolute bottom-10 bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold">
          {error}
        </div>
      )}
    </div>
  );
};

export default CameraOverlay;
