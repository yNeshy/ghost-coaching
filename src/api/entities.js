// Import entity JSON files directly
import AthleteData from './entities/Athlete.json';
import TrainingBlockData from './entities/TrainingBlock.json';
import ExerciseNoteData from './entities/ExerciseNote.json';
import PerformanceLogData from './entities/PerformanceLog.json';

// Entity helper function for mock JSON storage
function makeEntity(name, initialData = []) {
  // Keep an in-memory copy to simulate basic CRUD operations for local/dev use
  let data = Array.isArray(initialData) ? [...initialData] : [];

  return {
    list: (/* sort, limit */) => Promise.resolve([...data]),
    filter: (query = {}) => {
      if (!query || Object.keys(query).length === 0) return Promise.resolve([...data]);
      const result = data.filter(item =>
        Object.entries(query).every(([k, v]) => {
          // simple equality match; undefined in query means ignore
          if (v === undefined) return true;
          return item?.[k] === v;
        })
      );
      return Promise.resolve(result);
    },
    create: (obj = {}) => {
      const id = obj.id ?? `${name.toLowerCase()}-${Date.now()}`;
      const newObj = { ...obj, id };
      data.push(newObj);
      return Promise.resolve(newObj);
    },
    update: (id, patch = {}) => {
      const idx = data.findIndex(d => d.id === id);
      if (idx === -1) return Promise.resolve(null);
      data[idx] = { ...data[idx], ...patch };
      return Promise.resolve(data[idx]);
    },
    delete: (id) => {
      const idx = data.findIndex(d => d.id === id);
      if (idx === -1) return Promise.resolve(false);
      data.splice(idx, 1);
      return Promise.resolve(true);
    },
    _raw: () => data
  };
}

// Extract data arrays from JSON files (handle both array and object formats)
const athleteData = Array.isArray(AthleteData) ? AthleteData : (AthleteData?.default || []);
const trainingBlockData = Array.isArray(TrainingBlockData) ? TrainingBlockData : (TrainingBlockData?.default || []);
const exerciseNoteData = Array.isArray(ExerciseNoteData) ? ExerciseNoteData : (ExerciseNoteData?.default || []);
const performanceLogData = Array.isArray(PerformanceLogData) ? PerformanceLogData : (PerformanceLogData?.default || []);

// Create entity instances
export const Athlete = makeEntity('Athlete', athleteData);
export const TrainingBlock = makeEntity('TrainingBlock', trainingBlockData);
export const ExerciseNote = makeEntity('ExerciseNote', exerciseNoteData);
export const PerformanceLog = makeEntity('PerformanceLog', performanceLogData);
