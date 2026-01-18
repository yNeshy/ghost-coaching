import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, User, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function NotesSidebar({ 
  isOpen, 
  onClose, 
  exercise, 
  notes = [], 
  onAddNote,
  currentRole 
}) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    await onAddNote?.(newNote);
    setNewNote('');
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {exercise?.name || 'Exercise Notes'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {exercise?.value || 'Collaborative notes'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notes yet</p>
                  <p className="text-sm text-gray-400">Start the conversation</p>
                </div>
              ) : (
                notes.map((note, index) => (
                  <motion.div
                    key={note.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      p-4 rounded-2xl
                      ${note.author_role === 'coach' 
                        ? 'bg-indigo-50 border border-indigo-100' 
                        : 'bg-gray-50 border border-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`
                        p-1.5 rounded-lg
                        ${note.author_role === 'coach' ? 'bg-indigo-100' : 'bg-gray-200'}
                      `}>
                        {note.author_role === 'coach' 
                          ? <GraduationCap className="w-3 h-3 text-indigo-600" />
                          : <User className="w-3 h-3 text-gray-600" />
                        }
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {note.author_name || (note.author_role === 'coach' ? 'Coach' : 'Athlete')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {note.created_date ? new Date(note.created_date).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-3">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={`Add a note as ${currentRole}...`}
                  className="flex-1 min-h-[80px] resize-none rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
              </div>
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleSubmit}
                  disabled={!newNote.trim() || isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Note
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}