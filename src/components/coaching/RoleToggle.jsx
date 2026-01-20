import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, User } from 'lucide-react';

export default function RoleToggle({ role, onRoleChange }) {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
      <button
        onClick={() => onRoleChange('coach')}
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${role === 'coach' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}
        `}
      >
        {role === 'coach' && (
          <motion.div
            layoutId="roleToggle"
            className="absolute inset-0 bg-indigo-600 rounded-lg"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Coach
        </span>
      </button>
      
      <button
        onClick={() => onRoleChange('athlete')}
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${role === 'athlete' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}
        `}
      >
        {role === 'athlete' && (
          <motion.div
            layoutId="roleToggle"
            className="absolute inset-0 bg-emerald-600 rounded-lg"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <User className="w-4 h-4" />
          Athlete
        </span>
      </button>
    </div>
  );
}