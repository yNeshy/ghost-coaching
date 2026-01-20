import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MessageSquare, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AthleteCard({ athlete, onClick, hasNewNotes, notesCount = 0, needsNewProgram = false }) {
  const initials = athlete.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative bg-white rounded-2xl p-5 cursor-pointer transition-all border
        ${hasNewNotes 
          ? 'border-amber-200 ring-2 ring-amber-100' 
          : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'
        }
      `}
    >
      {needsNewProgram && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          Needs Program
        </div>
      )}
      
      {hasNewNotes && !needsNewProgram && (
        <div className="absolute -top-2 -right-2 bg-amber-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          New
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <Avatar className="w-14 h-14 ring-2 ring-gray-100">
          <AvatarImage src={athlete.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{athlete.name}</h3>
          <p className="text-sm text-gray-500 truncate">{athlete.current_cycle || 'No active cycle'}</p>
          
          <div className="flex items-center gap-3 mt-2">
            {athlete.start_date && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {new Date(athlete.start_date).toLocaleDateString()}
              </span>
            )}
            {notesCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                <MessageSquare className="w-3 h-3" />
                {notesCount} notes
              </span>
            )}
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );
}