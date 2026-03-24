import { useState, useEffect } from 'react';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  lesson: {
    _id: string;
    title: string;
    order: number;
    is_free_preview: boolean;
  };
  vimeoVideoId?: string | null;
}

export default function VideoPlayer({ lesson, vimeoVideoId }: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [vimeoVideoId]);

  if (!vimeoVideoId) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="aspect-video bg-slate-900 flex items-center justify-center">
          <div className="text-center text-white">
            <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400">Video not available</p>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900">{lesson.title}</h3>
          <p className="text-slate-600">Lesson {lesson.order}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="aspect-video bg-slate-900 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="animate-pulse text-slate-400">Loading video...</div>
          </div>
        )}
        <iframe
          src={`https://player.vimeo.com/video/${vimeoVideoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          title={lesson.title}
          onLoad={() => setLoading(false)}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900">{lesson.title}</h3>
        <p className="text-slate-600">Lesson {lesson.order}</p>
      </div>
    </div>
  );
}
