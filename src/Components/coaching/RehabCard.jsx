import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ExternalLink, MessageSquare } from 'lucide-react';

export default function RehabCard({ exercise, onExerciseClick, hasNote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`
        relative bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4 cursor-pointer transition-all border
        ${hasNote ? 'border-amber-200 ring-2 ring-amber-100' : 'border-teal-100 hover:border-teal-300'}
      `}
      onClick={() => onExerciseClick?.(exercise)}
    >
      {hasNote && (
        <div className="absolute top-3 right-3">
          <div className="bg-amber-400 text-white p-1.5 rounded-full">
            <MessageSquare className="w-3 h-3" />
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-teal-100 rounded-xl">
          <Activity className="w-5 h-5 text-teal-600" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{exercise.name}</h4>
          
          <p className="text-sm text-teal-700 font-medium mb-2">
            {exercise.protocol}
          </p>
          
          {exercise.video_url && (
            <a
              href={exercise.video_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              <ExternalLink className="w-3 h-3" />
              Watch Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}