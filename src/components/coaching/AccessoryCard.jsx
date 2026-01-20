import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MessageSquare, Play } from 'lucide-react';

export default function AccessoryCard({ exercise, onExerciseClick, hasNote }) {
  const isYouTube = exercise.video_url?.includes('youtube') || exercise.video_url?.includes('youtu.be');
  const isInstagram = exercise.video_url?.includes('instagram');

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (isYouTube) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop() 
        : url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    }
    return null;
  };

  const thumbnailUrl = getEmbedUrl(exercise.video_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`
        relative bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer transition-all
        ${hasNote ? 'border-amber-200 ring-2 ring-amber-100' : 'border-gray-100 hover:border-indigo-200'}
      `}
      onClick={() => onExerciseClick?.(exercise)}
    >
      {hasNote && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-amber-400 text-white p-1.5 rounded-full">
            <MessageSquare className="w-3 h-3" />
          </div>
        </div>
      )}
      
      {thumbnailUrl && (
        <div className="relative h-32 bg-gray-100">
          <img 
            src={thumbnailUrl} 
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-gray-900 ml-1" />
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-2">{exercise.name}</h4>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {exercise.sets && (
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg">
              {exercise.sets} sets
            </span>
          )}
          {exercise.reps && (
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
              {exercise.reps} reps
            </span>
          )}
          {exercise.weight && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg">
              {exercise.weight}
            </span>
          )}
        </div>
        
        {exercise.notes && (
          <p className="text-sm text-gray-500 mb-3">{exercise.notes}</p>
        )}
        
        {exercise.video_url && (
          <a
            href={exercise.video_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            <ExternalLink className="w-3 h-3" />
            {isYouTube ? 'YouTube' : isInstagram ? 'Instagram' : 'Watch Video'}
          </a>
        )}
      </div>
    </motion.div>
  );
}