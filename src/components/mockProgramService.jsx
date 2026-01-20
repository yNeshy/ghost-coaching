// Mock program service - will be replaced with Firebase
import memoryLocalStorage from '@/api/memoryLocalStorage';

const PROGRAMS_STORAGE_KEY = 'athlete_programs';

// Mock parse DOCX - extracts training data from uploaded file
export const mockParseDocx = async (file) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const text = await file.text();
  
  // Extract cycle name
  const cycleMatch = text.match(/Cycle[:\s]+([^\n]+)/i) || text.match(/Program[:\s]+([^\n]+)/i);
  const cycle_name = cycleMatch ? cycleMatch[1].trim() : 'Training Program';
  
  // Parse main lifts (Squats, Deadlifts, Secondary Squats)
  const lifts = {
    squats: {},
    deadlifts: {},
    secondary_squats: {}
  };
  
  const liftPatterns = {
    squats: /Squats.*?Week 1[:\s]+([^\n]+).*?Week 2[:\s]+([^\n]+).*?Week 3[:\s]+([^\n]+)/is,
    deadlifts: /Deadlifts.*?Week 1[:\s]+([^\n]+).*?Week 2[:\s]+([^\n]+).*?Week 3[:\s]+([^\n]+)/is,
    secondary_squats: /Secondary.*?Squats.*?Week 1[:\s]+([^\n]+).*?Week 2[:\s]+([^\n]+).*?Week 3[:\s]+([^\n]+)/is
  };
  
  Object.entries(liftPatterns).forEach(([liftName, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      lifts[liftName] = {
        week1: match[1].trim(),
        week2: match[2].trim(),
        week3: match[3].trim()
      };
    }
  });
  
  // Parse accessories
  const accessories = [];
  const accessorySection = text.match(/Accessories[:\s]+(.*?)(?=Rehab|$)/is);
  if (accessorySection) {
    const accessoryPattern = /([^:\n]+):\s*(\d+)\s*sets?\s*[x×]\s*(\d+)\s*reps?\s*(?:@\s*([^\n]+))?/gi;
    let match;
    let dayCounter = 1;
    
    while ((match = accessoryPattern.exec(accessorySection[1])) !== null) {
      accessories.push({
        id: `acc-${accessories.length + 1}`,
        name: match[1].trim(),
        sets: match[2],
        reps: match[3],
        weight: match[4]?.trim() || '',
        notes: '',
        day: dayCounter
      });
      dayCounter = dayCounter === 3 ? 1 : dayCounter + 1;
    }
  }
  
  // Parse rehab
  const rehab = [];
  const rehabSection = text.match(/Rehab[:\s]+(.*?)$/is);
  if (rehabSection) {
    const rehabPattern = /([^:\n]+):\s*([^\n]+)/gi;
    let match;
    let dayCounter = 2;
    
    while ((match = rehabPattern.exec(rehabSection[1])) !== null) {
      rehab.push({
        id: `rehab-${rehab.length + 1}`,
        name: match[1].trim(),
        protocol: match[2].trim(),
        day: dayCounter,
        video_url: ''
      });
      dayCounter = dayCounter === 3 ? 2 : dayCounter + 1;
    }
  }
  
  return {
    cycle_name,
    lifts,
    accessories,
    rehab
  };
};

// Mock upload program to database
export const mockUploadProgram = async (athleteId, programData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const programs = JSON.parse(memoryLocalStorage.getItem(PROGRAMS_STORAGE_KEY) || '{}');
  
  const programWithMetadata = {
    ...programData,
    athlete_id: athleteId,
    uploaded_at: new Date().toISOString(),
    id: `program-${Date.now()}`
  };
  
  if (!programs[athleteId]) {
    programs[athleteId] = [];
  }
  
  programs[athleteId].push(programWithMetadata);
  memoryLocalStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(programs));
  
  return programWithMetadata;
};

// Mock download program from database
export const mockDownloadProgram = async (athleteId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const programs = JSON.parse(memoryLocalStorage.getItem(PROGRAMS_STORAGE_KEY) || '{}');
  const athletePrograms = programs[athleteId] || [];
  
  // Return the most recent program if exists
  if (athletePrograms.length > 0) {
    return athletePrograms[athletePrograms.length - 1];
  }
  
  // Return mock 54-week program for Sarah Chen
  const sarahProgram = {
    id: 'mock-program-sarah',
    athlete_id: 'athlete-2',
    cycle_name: 'Annual Strength Program - 54 Weeks',
    total_weeks: 54,
    current_week: 54,
    is_completed: false,
    lifts: {
      squats: generateWeeklyProgression('squats', 54),
      deadlifts: generateWeeklyProgression('deadlifts', 54),
      secondary_squats: generateWeeklyProgression('secondary_squats', 54)
    },
    accessories: [
      { id: 'acc-1', name: 'Zercher Squats', sets: '8', reps: '3', weight: '', notes: 'Focus on bracing', day: 1 },
      { id: 'acc-2', name: 'Hip Bridges', sets: '3', reps: '12', weight: '40kg', notes: '', day: 1 },
      { id: 'acc-3', name: 'Pull-ups', sets: '4', reps: '8-10', weight: 'BW', notes: '', day: 3 },
      { id: 'acc-4', name: 'Pendlay Rows', sets: '4', reps: '6', weight: '', notes: 'Explosive off floor', day: 3 },
      { id: 'acc-5', name: 'Hip Flexor Mobility', sets: '8', reps: '10s hold', weight: '', notes: '', day: 2 },
      { id: 'acc-6', name: '6-Step Rehab Protocol', sets: '1', reps: '6 steps', weight: '', notes: '2min each', day: 2 }
    ],
    rehab: []
  };
  
  if (athleteId === 'athlete-2') {
    return sarahProgram;
  }
  
  return null;
};

// Helper to generate weekly progression for 54 weeks
function generateWeeklyProgression(liftType, totalWeeks) {
  const progression = {};
  const baseWeights = {
    squats: { start: 70, peak: 95 },
    deadlifts: { start: 65, peak: 90 },
    secondary_squats: { start: 60, peak: 80 }
  };
  
  const base = baseWeights[liftType];
  const cycleLength = 4; // 4-week cycles
  
  for (let week = 1; week <= totalWeeks; week++) {
    const cycleWeek = ((week - 1) % cycleLength) + 1;
    const cycleNumber = Math.floor((week - 1) / cycleLength);
    const progressionFactor = Math.min(cycleNumber * 2, base.peak - base.start);
    
    let intensity = base.start + progressionFactor;
    let sets = 5;
    let reps = 5;
    
    // Vary within cycle
    if (cycleWeek === 1) {
      sets = 5; reps = 5;
    } else if (cycleWeek === 2) {
      sets = 4; reps = 4;
      intensity += 3;
    } else if (cycleWeek === 3) {
      sets = 3; reps = 3;
      intensity += 5;
    } else {
      sets = 3; reps = 8; // Deload
      intensity -= 15;
    }
    
    progression[`week${week}`] = `${sets}x${reps} @ ${Math.min(intensity, base.peak)}%`;
  }
  
  return progression;
}

// Get all programs for an athlete
export const mockGetAllPrograms = async (athleteId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const programs = JSON.parse(memoryLocalStorage.getItem(PROGRAMS_STORAGE_KEY) || '{}');
  return programs[athleteId] || [];
};

// Update a program's current week (for mock programs)
export const mockUpdateProgramWeek = async (programId, athleteId, week) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const programs = JSON.parse(memoryLocalStorage.getItem(PROGRAMS_STORAGE_KEY) || '{}');
  const athletePrograms = programs[athleteId] || [];
  
  // Find and update the program
  const programIndex = athletePrograms.findIndex(p => p.id === programId);
  if (programIndex !== -1) {
    athletePrograms[programIndex].current_week = week;
    programs[athleteId] = athletePrograms;
    memoryLocalStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(programs));
    return athletePrograms[programIndex];
  }
  
  return null;
};

// Mark exercise as done/undone
export const mockDoneExercise = async (exerciseId, userId, isDone) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log(`Exercise ${exerciseId} ${isDone ? 'completed' : 'unchecked'} by user ${userId}`);
  
  // Store in memoryLocalStorage for persistence
  const key = `exercise_completions_${userId}`;
  const completions = JSON.parse(memoryLocalStorage.getItem(key) || '{}');
  
  if (isDone) {
    completions[exerciseId] = { completed_at: new Date().toISOString() };
  } else {
    delete completions[exerciseId];
  }
  
  memoryLocalStorage.setItem(key, JSON.stringify(completions));
  return { success: true };
};