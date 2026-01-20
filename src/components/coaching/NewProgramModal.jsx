import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewProgramModal({ isOpen, onClose, onSave, athleteName, athleteId }) {
  const [programName, setProgramName] = useState('');
  const [squats, setSquats] = useState({ week1: '', week2: '', week3: '' });
  const [deadlifts, setDeadlifts] = useState({ week1: '', week2: '', week3: '' });
  const [secondarySquats, setSecondarySquats] = useState({ week1: '', week2: '', week3: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!programName.trim()) return;
    
    setIsSaving(true);
    await onSave?.({
      cycle_name: programName,
      lifts: {
        squats,
        deadlifts,
        secondary_squats: secondarySquats
      },
      accessories: [],
      rehab: [],
      is_completed: false,
      current_week: 1
    }, athleteId);
    setIsSaving(false);
    handleClose();
  };

  const handleClose = () => {
    setProgramName('');
    setSquats({ week1: '', week2: '', week3: '' });
    setDeadlifts({ week1: '', week2: '', week3: '' });
    setSecondarySquats({ week1: '', week2: '', week3: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create New Program</h3>
                  <p className="text-sm text-gray-500 mt-1">For {athleteName}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Label htmlFor="program-name">Program Name</Label>
                <Input
                  id="program-name"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g., 3-Week Strength Block"
                  className="mt-2"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Squats Progression</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Week 1</Label>
                    <Input
                      value={squats.week1}
                      onChange={(e) => setSquats({ ...squats, week1: e.target.value })}
                      placeholder="5x5 @ 80%"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Week 2</Label>
                    <Input
                      value={squats.week2}
                      onChange={(e) => setSquats({ ...squats, week2: e.target.value })}
                      placeholder="4x4 @ 85%"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Week 3</Label>
                    <Input
                      value={squats.week3}
                      onChange={(e) => setSquats({ ...squats, week3: e.target.value })}
                      placeholder="3x3 @ 90%"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Deadlifts Progression</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Week 1</Label>
                    <Input
                      value={deadlifts.week1}
                      onChange={(e) => setDeadlifts({ ...deadlifts, week1: e.target.value })}
                      placeholder="5x5 @ 75%"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Week 2</Label>
                    <Input
                      value={deadlifts.week2}
                      onChange={(e) => setDeadlifts({ ...deadlifts, week2: e.target.value })}
                      placeholder="4x4 @ 82%"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Week 3</Label>
                    <Input
                      value={deadlifts.week3}
                      onChange={(e) => setDeadlifts({ ...deadlifts, week3: e.target.value })}
                      placeholder="3x3 @ 88%"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Secondary Squats</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Week 1</Label>
                    <Input
                      value={secondarySquats.week1}
                      onChange={(e) => setSecondarySquats({ ...secondarySquats, week1: e.target.value })}
                      placeholder="3x8 @ 65%"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Week 2</Label>
                    <Input
                      value={secondarySquats.week2}
                      onChange={(e) => setSecondarySquats({ ...secondarySquats, week2: e.target.value })}
                      placeholder="3x6 @ 70%"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Week 3</Label>
                    <Input
                      value={secondarySquats.week3}
                      onChange={(e) => setSecondarySquats({ ...secondarySquats, week3: e.target.value })}
                      placeholder="3x5 @ 75%"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  💡 You can add accessories and rehab exercises after creating the base program
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!programName.trim() || isSaving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Creating...' : 'Create Program'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}