import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrainingBlock, ExerciseNote } from '@/api/entities';
import memoryLocalStorage from '@/api/memoryLocalStorage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDownloadProgram, mockDoneExercise, mockUpdateProgramWeek } from '../components/mockProgramService';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import NotesSidebar from '@/components/coaching/NotesSidebar';
import AthleteChecklist from '@/components/coaching/AthleteChecklist';
import ExportButton from '@/components/coaching/ExportButton';

const MOCK_TRAINING_BLOCK = {
  id: 'block-1',
  athlete_id: 'athlete-1',
  cycle_name: '3-Week Strength Block',
  lifts: {
    squats: { week1: '5x5 @ 80%', week2: '4x4 @ 85%', week3: '3x3 @ 90%' },
    deadlifts: { week1: '5x5 @ 75%', week2: '4x4 @ 82%', week3: '3x3 @ 88%' },
    secondary_squats: { week1: '3x8 @ 65%', week2: '3x6 @ 70%', week3: '3x5 @ 75%' }
  },
  accessories: [
    { id: 'acc-1', name: 'Zercher Squats', sets: '8', reps: '3', weight: '', notes: 'Focus on bracing', day: 1 },
    { id: 'acc-2', name: 'Hip Bridges', sets: '3', reps: '12', weight: '40kg', notes: '', day: 1 },
    { id: 'acc-3', name: 'Sumo Goodmornings', sets: '3', reps: '10', weight: 'Light', notes: 'Stretch at bottom', day: 1 },
    { id: 'acc-4', name: 'Z Bar Reserve Slow Eccentrics', sets: '3', reps: '8', weight: '', notes: 'Watch for wrist pain', day: 1, video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'acc-5', name: 'Pull-ups', sets: '4', reps: '8-10', weight: 'BW', notes: '', day: 3 },
    { id: 'acc-6', name: 'Pendlay Rows', sets: '4', reps: '6', weight: '', notes: 'Explosive off floor', day: 3 },
    { id: 'acc-7', name: 'Rear Delt Flyes', sets: '3', reps: '15', weight: 'Light', notes: '10s hold at peak', day: 2, video_url: 'https://www.instagram.com/p/example' }
  ],
  rehab: [
    { id: 'rehab-1', name: 'Hip Flexor Mobility', protocol: '10s hold × 8 sets', day: 2, video_url: 'https://www.youtube.com/watch?v=example1' },
    { id: 'rehab-2', name: '6-Step Rehab Protocol', protocol: 'Step 1-6, 2min each', day: 2 },
    { id: 'rehab-3', name: 'Thoracic Spine Work', protocol: '5min flow', day: 2 },
    { id: 'rehab-4', name: 'Ankle Mobility', protocol: '3x30s each side', day: 3 }
  ]
};

export default function AthleteDashboard() {
  const queryClient = useQueryClient();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(3);
  const [weekPage, setWeekPage] = useState(0); // Track which page of 3 weeks we're on
  const [completedExercises, setCompletedExercises] = useState(() => {
    const saved = memoryLocalStorage.getItem('completedExercises');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    memoryLocalStorage.setItem('completedExercises', JSON.stringify(completedExercises));
  }, [completedExercises]);

  const athleteId = 'athlete-1';

  // Fetch training block
  const { data: trainingBlock = MOCK_TRAINING_BLOCK } = useQuery({
    queryKey: ['trainingBlock', athleteId],
    queryFn: async () => {
      const mockProgram = await mockDownloadProgram(athleteId);
      if (mockProgram) {
        const weeks = mockProgram.total_weeks || 3;
        setTotalWeeks(weeks);
        setCurrentWeek(mockProgram.current_week || weeks);
        return mockProgram;
      }
      
      const data = await TrainingBlock.filter({ 
        athlete_id: athleteId,
        is_completed: false 
      });
      if (data.length > 0) {
        const weeks = data[0].total_weeks || 3;
        setTotalWeeks(weeks);
        setCurrentWeek(data[0].current_week || 1);
        return data[0];
      }
      
      const completed = await TrainingBlock.filter({ athlete_id: athleteId });
      if (completed[0]) {
        const weeks = completed[0].total_weeks || 3;
        setTotalWeeks(weeks);
        setCurrentWeek(completed[0].current_week || 1);
        return completed[0];
      }
      
      setTotalWeeks(3);
      return { ...MOCK_TRAINING_BLOCK, athlete_id: athleteId };
    }
  });

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['notes', athleteId],
    queryFn: async () => {
      return await ExerciseNote.filter({ athlete_id: athleteId });
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content) => {
      const note = {
        parent_id: selectedExercise?.id,
        athlete_id: athleteId,
        author_role: 'athlete',
        author_name: 'Marcus Johnson',
        content,
        exercise_name: selectedExercise?.name
      };
      return await ExerciseNote.create(note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });

  // Complete program mutation
  const completeProgramMutation = useMutation({
    mutationFn: async () => {
      if (!trainingBlock?.id || trainingBlock.id.startsWith('block-') || trainingBlock.id.startsWith('mock-')) return;
      return await TrainingBlock.update(trainingBlock.id, { 
        is_completed: true 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trainingBlock']);
    }
  });

  // Update current week mutation
  const updateWeekMutation = useMutation({
    mutationFn: async (week) => {
      if (!trainingBlock?.id) return;
      
      // Handle mock programs
      if (trainingBlock.id.startsWith('mock-') || trainingBlock.id.startsWith('block-')) {
        return await mockUpdateProgramWeek(trainingBlock.id, athleteId, week);
      }
      
      // Handle regular entity programs
      return await TrainingBlock.update(trainingBlock.id, { 
        current_week: week 
      });
    },
    onMutate: async (week) => {
      // Optimistically update the query cache
      await queryClient.cancelQueries(['trainingBlock', athleteId]);
      const previousBlock = queryClient.getQueryData(['trainingBlock', athleteId]);
      
      queryClient.setQueryData(['trainingBlock', athleteId], (old) => {
        if (!old) return old;
        return { ...old, current_week: week };
      });
      
      return { previousBlock };
    },
    onError: (err, week, context) => {
      // Rollback on error
      if (context?.previousBlock) {
        queryClient.setQueryData(['trainingBlock', athleteId], context.previousBlock);
      }
    },
    onSuccess: () => {
      // Only invalidate if it's not a mock program to avoid resetting the week
      if (!trainingBlock?.id?.startsWith('mock-') && !trainingBlock?.id?.startsWith('block-')) {
        queryClient.invalidateQueries(['trainingBlock', athleteId]);
      }
    }
  });

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setSidebarOpen(true);
  };

  const handleToggleComplete = async (exerciseId) => {
    const isNowCompleted = !completedExercises.includes(exerciseId);
    
    setCompletedExercises(prev => 
      isNowCompleted
        ? [...prev, exerciseId]
        : prev.filter(id => id !== exerciseId)
    );
    
    await mockDoneExercise(exerciseId, athleteId, isNowCompleted);
  };

  const handleMarkDayComplete = async (day) => {
    const dayExercises = getAllExercises(day).map(e => e.id);
    setCompletedExercises(prev => [...new Set([...prev, ...dayExercises])]);
    
    for (const exerciseId of dayExercises) {
      await mockDoneExercise(exerciseId, athleteId, true);
    }
  };

  const handleCompleteProgram = async () => {
    if (confirm('Are you sure you want to mark this program as complete? Your coach will be notified.')) {
      await completeProgramMutation.mutateAsync();
    }
  };

  const handleWeekChange = (week) => {
    setCurrentWeek(week);
    // Update weekPage to show the correct page for the selected week
    setWeekPage(Math.floor((week - 1) / 3));
    updateWeekMutation.mutate(week);
  };

  // Sync weekPage when currentWeek changes externally (e.g., from query)
  useEffect(() => {
    if (currentWeek) {
      setWeekPage(Math.floor((currentWeek - 1) / 3));
    }
  }, [currentWeek]);

  const getAllExercises = (day) => {
    const mainLifts = day === 1 
      ? [{ id: `squats-main-w${currentWeek}`, name: 'Squats', sets: '5', reps: '5', weight: trainingBlock?.lifts?.squats?.[`week${currentWeek}`] }]
      : day === 3
      ? [{ id: `deadlifts-main-w${currentWeek}`, name: 'Deadlifts', sets: '5', reps: '5', weight: trainingBlock?.lifts?.deadlifts?.[`week${currentWeek}`] }]
      : [];

    const dayAccessories = (trainingBlock?.accessories || []).filter(a => a.day === day).map(a => ({
      ...a,
      id: `${a.id}-w${currentWeek}`
    }));

    return [...mainLifts, ...dayAccessories];
  };

  const exerciseNotes = notes.filter(n => n.parent_id === selectedExercise?.id);
  const notedExerciseIds = [...new Set(notes.map(n => n.parent_id))];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!trainingBlock?.is_completed && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl mb-1">{trainingBlock?.cycle_name}</h3>
                <p className="text-emerald-50">You're on Week {currentWeek} of {totalWeeks}</p>
              </div>
              <Button
                onClick={handleCompleteProgram}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Mark as Complete
              </Button>
            </div>
          </div>
        )}

        {trainingBlock?.is_completed && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900">Program Completed!</h3>
                <p className="text-sm text-yellow-700">Great work! Your coach will send you a new program soon.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Training</h2>
            <p className="text-gray-500">Week {currentWeek} of {totalWeeks} • {trainingBlock?.cycle_name}</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {/* Previous 3 weeks button */}
            {weekPage > 0 && (
              <button
                onClick={() => {
                  const newPage = weekPage - 1;
                  setWeekPage(newPage);
                  // Optionally navigate to the first week of the new page
                  const firstWeekOfPage = newPage * 3 + 1;
                  handleWeekChange(firstWeekOfPage);
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-all"
              >
                ‹
              </button>
            )}
            
            {/* Show 3 weeks for current page */}
            {Array.from({ length: Math.min(3, totalWeeks - weekPage * 3) }, (_, i) => {
              const week = weekPage * 3 + i + 1;
              return (
                <button
                  key={week}
                  onClick={() => handleWeekChange(week)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${currentWeek === week 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  W{week}
                </button>
              );
            })}
            
            {/* Next 3 weeks button */}
            {(weekPage + 1) * 3 < totalWeeks && (
              <button
                onClick={() => {
                  const newPage = weekPage + 1;
                  setWeekPage(newPage);
                  // Optionally navigate to the first week of the new page
                  const firstWeekOfPage = newPage * 3 + 1;
                  handleWeekChange(firstWeekOfPage);
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-all"
              >
                ›
              </button>
            )}
          </div>
        </div>

        <Tabs defaultValue="day1" className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="day1" className="rounded-lg data-[state=active]:bg-white">
              Day 1
            </TabsTrigger>
            <TabsTrigger value="day2" className="rounded-lg data-[state=active]:bg-white">
              Day 2
            </TabsTrigger>
            <TabsTrigger value="day3" className="rounded-lg data-[state=active]:bg-white">
              Day 3
            </TabsTrigger>
          </TabsList>

          <TabsContent value="day1">
            <AthleteChecklist
              day={1}
              exercises={getAllExercises(1)}
              completedExercises={completedExercises}
              onToggleComplete={handleToggleComplete}
              onExerciseClick={handleExerciseClick}
              notedExercises={notedExerciseIds}
              onMarkDayComplete={handleMarkDayComplete}
            />
          </TabsContent>

          <TabsContent value="day2">
            <AthleteChecklist
              day={2}
              exercises={getAllExercises(2)}
              completedExercises={completedExercises}
              onToggleComplete={handleToggleComplete}
              onExerciseClick={handleExerciseClick}
              notedExercises={notedExerciseIds}
              onMarkDayComplete={handleMarkDayComplete}
            />
          </TabsContent>

          <TabsContent value="day3">
            <AthleteChecklist
              day={3}
              exercises={getAllExercises(3)}
              completedExercises={completedExercises}
              onToggleComplete={handleToggleComplete}
              onExerciseClick={handleExerciseClick}
              notedExercises={notedExerciseIds}
              onMarkDayComplete={handleMarkDayComplete}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-3">
          <ExportButton 
            trainingBlock={trainingBlock} 
            notes={notes} 
            currentWeek={currentWeek} 
          />
          <Button
            variant="outline"
            onClick={() => alert('Download original program - mock functionality')}
          >
            Download Original
          </Button>
          <Button
            variant="outline"
            onClick={() => alert('Download PDF - mock functionality')}
          >
            Download PDF
          </Button>
        </div>
      </motion.div>

      <NotesSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        exercise={selectedExercise}
        notes={exerciseNotes}
        onAddNote={(content) => addNoteMutation.mutate(content)}
        currentRole="athlete"
      />
    </>
  );
}