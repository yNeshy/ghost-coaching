import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockUploadProgram, mockDownloadProgram, mockUpdateProgramWeek } from '@/components/mockProgramService';
import { Athlete, TrainingBlock, ExerciseNote, PerformanceLog } from '@/api/entities';
import { 
  ArrowLeft, 
  Dumbbell,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import AthleteCard from '@/components/coaching/AthleteCard';
import LiftTable from '@/components/coaching/LiftTable';
import AccessoryCard from '@/components/coaching/AccessoryCard';
import NotesSidebar from '@/components/coaching/NotesSidebar';
import FileUploader from '@/components/coaching/FileUploader';
import ExportButton from '@/components/coaching/ExportButton';
import NewProgramModal from '@/components/coaching/NewProgramModal';

const MOCK_ATHLETES = [
  { id: 'athlete-1', name: 'Marcus Johnson', current_cycle: '3-Week Strength Block', start_date: '2024-01-15', avatar_url: '' },
  { id: 'athlete-2', name: 'Sarah Chen', current_cycle: 'Peaking Phase', start_date: '2024-01-08', avatar_url: '' },
  { id: 'athlete-3', name: 'Alex Rivera', current_cycle: 'Volume Accumulation', start_date: '2024-01-22', avatar_url: '' }
];

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

export default function CoachDashboard() {
  const queryClient = useQueryClient();
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(3);
  const [weekPage, setWeekPage] = useState(0); // Track which page of 3 weeks we're on
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);
  const [athleteForNewProgram, setAthleteForNewProgram] = useState(null);

  // Fetch athletes
  const { data: athletes = MOCK_ATHLETES } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      const data = await Athlete.list();
      return data.length > 0 ? data : MOCK_ATHLETES;
    }
  });

  // Fetch all training blocks for athletes
  const { data: allTrainingBlocks = [] } = useQuery({
    queryKey: ['allTrainingBlocks'],
    queryFn: async () => {
      const data = await TrainingBlock.list();
      return data;
    }
  });

  // Fetch training block for selected athlete
  const { data: trainingBlock = MOCK_TRAINING_BLOCK } = useQuery({
    queryKey: ['trainingBlock', selectedAthlete?.id],
    queryFn: async () => {
      if (!selectedAthlete) return MOCK_TRAINING_BLOCK;
      
      const athleteId = selectedAthlete.id;
      
      // Try to get from mock database first
      const mockProgram = await mockDownloadProgram(athleteId);
      if (mockProgram) {
        const weeks = mockProgram.total_weeks || 3;
        setTotalWeeks(weeks);
        setCurrentWeek(mockProgram.current_week || weeks);
        return mockProgram;
      }
      
      // Fallback to entities
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
      
      // Fallback to completed programs if no active one
      const completed = await TrainingBlock.filter({ athlete_id: athleteId });
      if (completed[0]) {
        const weeks = completed[0].total_weeks || 3;
        setTotalWeeks(weeks);
        setCurrentWeek(completed[0].current_week || 1);
        return completed[0];
      }
      
      setTotalWeeks(3);
      return { ...MOCK_TRAINING_BLOCK, athlete_id: athleteId };
    },
    enabled: !!selectedAthlete
  });

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['notes', selectedAthlete?.id],
    queryFn: async () => {
      if (!selectedAthlete) return [];
      return await ExerciseNote.filter({ athlete_id: selectedAthlete.id });
    },
    enabled: !!selectedAthlete
  });

  // Fetch performance logs
  const { data: performanceLogs = [] } = useQuery({
    queryKey: ['performanceLogs', selectedAthlete?.id],
    queryFn: async () => {
      if (!selectedAthlete) return [];
      return await PerformanceLog.filter({ athlete_id: selectedAthlete.id });
    },
    enabled: !!selectedAthlete
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content) => {
      const note = {
        parent_id: selectedExercise?.id,
        athlete_id: selectedAthlete?.id,
        author_role: 'coach',
        author_name: 'Coach',
        content,
        exercise_name: selectedExercise?.name
      };
      return await ExerciseNote.create(note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });

  // Create new program mutation
  const createProgramMutation = useMutation({
    mutationFn: async ({ athleteId, programData }) => {
      return await TrainingBlock.create({
        ...programData,
        athlete_id: athleteId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trainingBlock']);
      queryClient.invalidateQueries(['allTrainingBlocks']);
    }
  });

  // Update current week mutation
  const updateWeekMutation = useMutation({
    mutationFn: async (week) => {
      if (!trainingBlock?.id || !selectedAthlete?.id) return;
      
      // Handle mock programs
      if (trainingBlock.id.startsWith('mock-') || trainingBlock.id.startsWith('block-')) {
        return await mockUpdateProgramWeek(trainingBlock.id, selectedAthlete.id, week);
      }
      
      // Handle regular entity programs
      return await TrainingBlock.update(trainingBlock.id, { 
        current_week: week 
      });
    },
    onMutate: async (week) => {
      // Optimistically update the query cache
      await queryClient.cancelQueries(['trainingBlock', selectedAthlete?.id]);
      const previousBlock = queryClient.getQueryData(['trainingBlock', selectedAthlete?.id]);
      
      queryClient.setQueryData(['trainingBlock', selectedAthlete?.id], (old) => {
        if (!old) return old;
        return { ...old, current_week: week };
      });
      
      return { previousBlock };
    },
    onError: (err, week, context) => {
      // Rollback on error
      if (context?.previousBlock) {
        queryClient.setQueryData(['trainingBlock', selectedAthlete?.id], context.previousBlock);
      }
    },
    onSuccess: () => {
      // Only invalidate if it's not a mock program to avoid resetting the week
      if (!trainingBlock?.id?.startsWith('mock-') && !trainingBlock?.id?.startsWith('block-')) {
        queryClient.invalidateQueries(['trainingBlock', selectedAthlete?.id]);
      }
    }
  });

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setSidebarOpen(true);
  };

  const handleDataExtracted = async (data) => {
    if (!selectedAthlete) return;
    
    const programData = {
      cycle_name: data.cycle_name || 'Uploaded Program',
      lifts: data.lifts || {},
      accessories: data.accessories || [],
      rehab: data.rehab || [],
      is_completed: false,
      current_week: 1
    };
    
    await mockUploadProgram(selectedAthlete.id, programData);
    await createProgramMutation.mutateAsync({
      athleteId: selectedAthlete.id,
      programData
    });
  };

  const handleCreateNewProgram = (athleteId, athleteName) => {
    setAthleteForNewProgram({ id: athleteId, name: athleteName });
    setShowNewProgramModal(true);
  };

  const handleSaveNewProgram = async (programData, athleteId) => {
    // Use athleteId parameter if provided, otherwise fall back to state
    const id = athleteId || athleteForNewProgram?.id;
    
    if (!id) {
      console.warn('handleSaveNewProgram called without athlete ID');
      setShowNewProgramModal(false);
      setAthleteForNewProgram(null);
      return;
    }

    await createProgramMutation.mutateAsync({
      athleteId: id,
      programData
    });
    setShowNewProgramModal(false);
    setAthleteForNewProgram(null);
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

  const athletesNeedingPrograms = athletes.filter(athlete => {
    const athleteBlock = allTrainingBlocks.find(
      block => block.athlete_id === athlete.id && !block.is_completed
    );
    return !athleteBlock || athleteBlock.is_completed;
  });

  const exerciseNotes = notes.filter(n => n.parent_id === selectedExercise?.id);
  const notedExerciseIds = [...new Set(notes.map(n => n.parent_id))];

  return (
    <>
      <AnimatePresence mode="wait">
        {/* Athlete List */}
        {!selectedAthlete && (
          <motion.div
            key="athlete-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Athletes</h2>
              <p className="text-gray-500">Select an athlete to view their training program</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {athletes.map((athlete, index) => (
                <motion.div
                  key={athlete.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AthleteCard
                    athlete={athlete}
                    onClick={() => setSelectedAthlete(athlete)}
                    hasNewNotes={notes.some(n => n.athlete_id === athlete.id && n.author_role === 'athlete')}
                    notesCount={notes.filter(n => n.athlete_id === athlete.id).length}
                    needsNewProgram={athletesNeedingPrograms.some(a => a.id === athlete.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Athlete Detail */}
        {selectedAthlete && (
          <motion.div
            key="athlete-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <button
              onClick={() => setSelectedAthlete(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Athletes
            </button>

            {trainingBlock?.is_completed && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">Program Completed</h3>
                    <p className="text-sm text-red-700">This athlete has finished their current program and needs a new one.</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleCreateNewProgram(selectedAthlete.id, selectedAthlete.name)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Program
                </Button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Training Program for {selectedAthlete.name}</h3>
              <FileUploader onDataExtracted={handleDataExtracted} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{trainingBlock?.cycle_name || 'Training Block'}</h2>
                <p className="text-gray-500">Week {currentWeek} of {totalWeeks}</p>
              </div>
              <div className="flex items-center gap-3">
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
                      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-all"
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
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${currentWeek === week 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                          }
                        `}
                      >
                        Week {week}
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
                      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-all"
                    >
                      ›
                    </button>
                  )}
                </div>
                <ExportButton 
                  trainingBlock={trainingBlock} 
                  notes={notes} 
                  currentWeek={currentWeek} 
                />
              </div>
            </div>

            <LiftTable 
              lifts={trainingBlock?.lifts} 
              onExerciseClick={handleExerciseClick}
              performanceLogs={performanceLogs}
            />

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-indigo-500" />
                Accessories
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(trainingBlock?.accessories || []).map((exercise, index) => (
                  <AccessoryCard
                    key={exercise.id}
                    exercise={exercise}
                    onExerciseClick={handleExerciseClick}
                    hasNote={notedExerciseIds.includes(exercise.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotesSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        exercise={selectedExercise}
        notes={exerciseNotes}
        onAddNote={(content) => addNoteMutation.mutate(content)}
        currentRole="coach"
      />

      <NewProgramModal
        isOpen={showNewProgramModal}
        onClose={() => {
          setShowNewProgramModal(false);
          setAthleteForNewProgram(null);
        }}
        onSave={handleSaveNewProgram}
        athleteName={athleteForNewProgram?.name}
        athleteId={athleteForNewProgram?.id}
      />
    </>
  );
}