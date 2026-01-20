import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MessageSquare } from 'lucide-react';

export default function LiftTable({ lifts, onExerciseClick, performanceLogs = [] }) {
  const liftData = [
    { key: 'squats', name: 'Squats', icon: '🏋️' },
    { key: 'deadlifts', name: 'Deadlifts', icon: '💪' },
    { key: 'secondary_squats', name: 'Secondary Squats', icon: '🦵' }
  ];

  const hasNote = (liftKey, week) => {
    return performanceLogs.some(log => 
      log.exercise_name?.toLowerCase().includes(liftKey.replace('_', ' ')) && 
      log.week === week && 
      log.notes
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">3-Week Lift Progression</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lift
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Week 1
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Week 2
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Week 3
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {liftData.map((lift, index) => (
              <motion.tr
                key={lift.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lift.icon}</span>
                    <span className="font-medium text-gray-900">{lift.name}</span>
                  </div>
                </td>
                {[1, 2, 3].map(week => {
                  const weekKey = `week${week}`;
                  const value = lifts?.[lift.key]?.[weekKey] || '-';
                  const hasNoteForCell = hasNote(lift.key, week);
                  
                  return (
                    <td 
                      key={week} 
                      className="px-6 py-4 text-center"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onExerciseClick?.({
                          id: `${lift.key}-week${week}`,
                          name: `${lift.name} - Week ${week}`,
                          value
                        })}
                        className={`
                          relative px-4 py-2 rounded-xl text-sm font-medium transition-all
                          ${hasNoteForCell 
                            ? 'bg-amber-50 text-amber-700 border-2 border-amber-200' 
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-indigo-200'
                          }
                        `}
                      >
                        {value}
                        {hasNoteForCell && (
                          <MessageSquare className="absolute -top-1 -right-1 w-4 h-4 text-amber-500" />
                        )}
                      </motion.button>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}