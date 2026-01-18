import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  GraduationCap, 
  User, 
  Plus, 
  ArrowLeft, 
  Calendar,
  Dumbbell,
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import api from '@/api';

import RoleToggle from '@/components/coaching/RoleToggle';
import AthleteCard from '@/components/coaching/AthleteCard';
import LiftTable from '@/components/coaching/LiftTable';
import AccessoryCard from '@/components/coaching/AccessoryCard';
import RehabCard from '@/components/coaching/RehabCard';
import NotesSidebar from '@/components/coaching/NotesSidebar';
import AthleteChecklist from '@/components/coaching/AthleteChecklist';
import FileUploader from '@/components/coaching/FileUploader';
import ExportButton from '@/components/coaching/ExportButton';
import NewProgramModal from '@/components/coaching/NewProgramModal';

// Mock data for initial state
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

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState(() => localStorage.getItem('coachingRole') || 'coach');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedExercises, setCompletedExercises] = useState(() => {
    const saved = localStorage.getItem('completedExercises');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);
  const [athleteForNewProgram, setAthleteForNewProgram] = useState(null);

  // Save role to localStorage
  useEffect(() => {
    localStorage.setItem('coachingRole', role);
  }, [role]);

  // Save completed exercises to localStorage
  useEffect(() => {
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
  }, [completedExercises]);

  // Fetch athletes
  const { data: athletes = MOCK_ATHLETES } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      const data = await api.entities.Athlete.list();
      return data.length > 0 ? data : MOCK_ATHLETES;
    }
  });

  // Fetch all training blocks for athletes
  const { data: allTrainingBlocks = [] } = useQuery({
    queryKey: ['allTrainingBlocks'],
    queryFn: async () => {
      const data = await api.entities.TrainingBlock.list();
      return data;
    }
  });

  // Fetch training block for selected athlete
  const { data: trainingBlock = MOCK_TRAINING_BLOCK } = useQuery({
    queryKey: ['trainingBlock', selectedAthlete?.id],
    queryFn: async () => {
      if (!selectedAthlete) return MOCK_TRAINING_BLOCK;
      const data = await api.entities.TrainingBlock.filter({ 
        athlete_id: selectedAthlete.id,
        is_completed: false 
      });
      if (data.length > 0) {
        // Set current week from the training block
        setCurrentWeek(data[0].current_week || 1);
        return data[0];
      }
      // Fallback to completed programs if no active one
      const completed = await api.entities.TrainingBlock.filter({ athlete_id: selectedAthlete.id });
      return completed[0] || { ...MOCK_TRAINING_BLOCK, athlete_id: selectedAthlete.id };
    },
    enabled: !!selectedAthlete
  });

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['notes', selectedAthlete?.id],
    queryFn: async () => {
      if (!selectedAthlete) return [];
      return await api.entities.ExerciseNote.filter({ athlete_id: selectedAthlete.id });
    },
    enabled: !!selectedAthlete
  });

  // Fetch performance logs
  const { data: performanceLogs = [] } = useQuery({
    queryKey: ['performanceLogs', selectedAthlete?.id],
    queryFn: async () => {
      if (!selectedAthlete) return [];
      return await api.entities.PerformanceLog.filter({ athlete_id: selectedAthlete.id });
    },
    enabled: !!selectedAthlete
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content) => {
      const note = {
        parent_id: selectedExercise?.id,
        athlete_id: selectedAthlete?.id || 'athlete-1',
        author_role: role,
        author_name: role === 'coach' ? 'Coach' : selectedAthlete?.name || 'Athlete',
        content,
        exercise_name: selectedExercise?.name
      };
      return await api.entities.ExerciseNote.create(note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });

  // Complete program mutation
  const completeProgramMutation = useMutation({
    mutationFn: async () => {
      if (!trainingBlock?.id) return;
      return await api.entities.TrainingBlock.update(trainingBlock.id, { 
        is_completed: true 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trainingBlock']);
      queryClient.invalidateQueries(['allTrainingBlocks']);
    }
  });

  // Create new program mutation
  const createProgramMutation = useMutation({
    mutationFn: async ({ athleteId, programData }) => {
      return await api.entities.TrainingBlock.create({
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
      if (!trainingBlock?.id) return;
      return await api.entities.TrainingBlock.update(trainingBlock.id, { 
        current_week: week 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['trainingBlock']);
    }
  });

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setSidebarOpen(true);
  };

  const handleToggleComplete = (exerciseId) => {
    setCompletedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleDataExtracted = async (data) => {
    if (!selectedAthlete) return;
    
    await createProgramMutation.mutateAsync({
      athleteId: selectedAthlete.id,
      programData: {
        cycle_name: data.cycle_name || 'Uploaded Program',
        lifts: data.lifts || {},
        accessories: data.accessories || [],
        rehab: data.rehab || [],
        is_completed: false,
        current_week: 1
      }
    });
  };

  const handleCreateNewProgram = (athleteId, athleteName) => {
    setAthleteForNewProgram({ id: athleteId, name: athleteName });
    setShowNewProgramModal(true);
  };

  const handleSaveNewProgram = async (programData) => {
    await createProgramMutation.mutateAsync({
      athleteId: athleteForNewProgram.id,
      programData
    });
    setShowNewProgramModal(false);
    setAthleteForNewProgram(null);
  };

  const handleCompleteProgram = async () => {
    if (confirm('Are you sure you want to mark this program as complete? Your coach will be notified.')) {
      await completeProgramMutation.mutateAsync();
    }
  };

  const handleWeekChange = async (week) => {
    setCurrentWeek(week);
    await updateWeekMutation.mutateAsync(week);
  };

  // Check which athletes need new programs
  const athletesNeedingPrograms = athletes.filter(athlete => {
    const athleteBlock = allTrainingBlocks.find(
      block => block.athlete_id === athlete.id && !block.is_completed
    );
    return !athleteBlock || athleteBlock.is_completed;
  });

  const exerciseNotes = notes.filter(n => n.parent_id === selectedExercise?.id);
  const notedExerciseIds = [...new Set(notes.map(n => n.parent_id))];

  // Get all exercises for athlete view
  const getAllExercises = (day) => {
    const mainLifts = day === 1 
      ? [{ id: 'squats-main', name: 'Squats', sets: '5', reps: '5', weight: trainingBlock?.lifts?.squats?.[`week${currentWeek}`] }]
      : day === 3
      ? [{ id: 'deadlifts-main', name: 'Deadlifts', sets: '5', reps: '5', weight: trainingBlock?.lifts?.deadlifts?.[`week${currentWeek}`] }]
      : [];

    const dayAccessories = (trainingBlock?.accessories || []).filter(a => a.day === day);
    const dayRehab = (trainingBlock?.rehab || []).filter(r => r.day === day);

    return [...mainLifts, ...dayAccessories, ...dayRehab];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {selectedAthlete && (
                <button
                  onClick={() => setSelectedAthlete(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Strength Coach</h1>
                  <p className="text-xs text-gray-500">
                    {selectedAthlete ? selectedAthlete.name : 'Dashboard'}
                  </p>
                </div>
              </div>
            </div>
            
            <RoleToggle role={role} onRoleChange={setRole} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Coach View - Athlete List */}
          {role === 'coach' && !selectedAthlete && (
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

          {/* Coach View - Athlete Detail */}
          {role === 'coach' && selectedAthlete && (
            <motion.div
              key="athlete-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
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
                  <p className="text-gray-500">Week {currentWeek} of 3</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {[1, 2, 3].map(week => (
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
                    ))}
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

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-indigo-500" />
                    Accessories
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
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

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-500" />
                    Rehab Protocol
                  </h3>
                  <div className="space-y-3">
                    {(trainingBlock?.rehab || []).map((exercise, index) => (
                      <RehabCard
                        key={exercise.id}
                        exercise={exercise}
                        onExerciseClick={handleExerciseClick}
                        hasNote={notedExerciseIds.includes(exercise.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Athlete View */}
          {role === 'athlete' && (
            <motion.div
              key="athlete-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {!trainingBlock?.is_completed && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xl mb-1">{trainingBlock?.cycle_name}</h3>
                      <p className="text-emerald-50">You're on Week {currentWeek} of 3</p>
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
                  <p className="text-gray-500">Week {currentWeek} • {trainingBlock?.cycle_name}</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {[1, 2, 3].map(week => (
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
                  ))}
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
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-8">
                <ExportButton 
                  trainingBlock={trainingBlock} 
                  notes={notes} 
                  currentWeek={currentWeek} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Notes Sidebar */}
      <NotesSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        exercise={selectedExercise}
        notes={exerciseNotes}
        onAddNote={(content) => addNoteMutation.mutate(content)}
        currentRole={role}
      />

      {/* New Program Modal */}
      <NewProgramModal
        isOpen={showNewProgramModal}
        onClose={() => {
          setShowNewProgramModal(false);
          setAthleteForNewProgram(null);
        }}
        onSave={handleSaveNewProgram}
        athleteName={athleteForNewProgram?.name}
      />
    </div>
  );
}