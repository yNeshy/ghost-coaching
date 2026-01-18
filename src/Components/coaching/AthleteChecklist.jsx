import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, MessageSquare, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AthleteChecklist({ 
  day, 
  exercises, 
  completedExercises = [], 
  onToggleComplete,
  onExerciseClick,
  notedExercises = []
}) {
  const dayTitles = {
    1: { title: 'Day 1', subtitle: 'Squats & Accessories', color: 'indigo' },
    2: { title: 'Day 2', subtitle: 'Rehab & Rear Delts', color: 'teal' },
    3: { title: 'Day 3', subtitle: 'Deadlifts & Pulling', color: 'purple' }
  };

  const dayInfo = dayTitles[day] || { title: `Day ${day}`, subtitle: '', color: 'gray' };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`px-5 py-4 bg-gradient-to-r from-${dayInfo.color}-500 to-${dayInfo.color}-600`}>
        <h3 className="text-lg font-bold text-white">{dayInfo.title}</h3>
        <p className="text-sm text-white/80">{dayInfo.subtitle}</p>
      </div>
      
      <div className="divide-y divide-gray-50">
        {exercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          const hasNote = notedExercises.includes(exercise.id);
          
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                p-4 flex items-center gap-4 transition-colors
                ${isCompleted ? 'bg-emerald-50/50' : 'hover:bg-gray-50'}
              `}
            >
              <button
                onClick={() => onToggleComplete?.(exercise.id)}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center transition-all
                  ${isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : 'border-2 border-gray-300 hover:border-emerald-400'
                  }
                `}
              >
                {isCompleted && <Check className="w-4 h-4" />}
              </button>
              
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onExerciseClick?.(exercise)}
              >
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {exercise.name}
                  </h4>
                  {hasNote && (
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {exercise.sets && (
                    <span className="text-xs text-gray-500">{exercise.sets} sets</span>
                  )}
                  {exercise.reps && (
                    <span className="text-xs text-gray-500">× {exercise.reps}</span>
                  )}
                  {exercise.weight && (
                    <span className="text-xs text-gray-500">@ {exercise.weight}</span>
                  )}
                  {exercise.protocol && (
                    <span className="text-xs text-teal-600">{exercise.protocol}</span>
                  )}
                </div>
              </div>
              
              {exercise.video_url && (
                <a
                  href={exercise.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Play className="w-4 h-4 text-gray-600" />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}