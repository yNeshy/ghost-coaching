import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileUploader({ onDataExtracted }) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [fileName, setFileName] = useState('');

  const parseTrainingData = (text) => {
    // Mock parser that looks for Week patterns
    const lifts = {
      squats: { week1: '', week2: '', week3: '' },
      deadlifts: { week1: '', week2: '', week3: '' },
      secondary_squats: { week1: '', week2: '', week3: '' }
    };

    const lines = text.split('\n');
    let currentLift = null;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('squat') && !lowerLine.includes('secondary') && !lowerLine.includes('zercher')) {
        currentLift = 'squats';
      } else if (lowerLine.includes('deadlift')) {
        currentLift = 'deadlifts';
      } else if (lowerLine.includes('secondary squat') || lowerLine.includes('sumo goodmorning')) {
        currentLift = 'secondary_squats';
      }

      // Look for week patterns
      const week1Match = line.match(/week\s*1[:\s]*([^\n,]+)/i);
      const week2Match = line.match(/week\s*2[:\s]*([^\n,]+)/i);
      const week3Match = line.match(/week\s*3[:\s]*([^\n,]+)/i);

      if (currentLift) {
        if (week1Match) lifts[currentLift].week1 = week1Match[1].trim();
        if (week2Match) lifts[currentLift].week2 = week2Match[1].trim();
        if (week3Match) lifts[currentLift].week3 = week3Match[1].trim();
      }
    }

    // Extract accessories
    const accessories = [];
    const rehabItems = [];

    // Look for exercise patterns
    const exercisePatterns = [
      { pattern: /zercher\s*squat[s]?\s*(\d+)x(\d+)/i, name: 'Zercher Squats', type: 'accessory' },
      { pattern: /hip\s*bridge[s]?\s*(\d+)kg\s*(\d+)x(\d+)/i, name: 'Hip Bridges', type: 'accessory' },
      { pattern: /z\s*bar.*eccentric/i, name: 'Z Bar Reserve Slow Eccentrics', type: 'accessory' },
      { pattern: /pull[\s-]*up[s]?/i, name: 'Pull-ups', type: 'accessory' },
      { pattern: /row[s]?/i, name: 'Rows', type: 'accessory' },
      { pattern: /hip\s*flexor/i, name: 'Hip Flexor Stretch', type: 'rehab' },
      { pattern: /rear\s*delt/i, name: 'Rear Delt Work', type: 'rehab' }
    ];

    for (const line of lines) {
      for (const { pattern, name, type } of exercisePatterns) {
        if (pattern.test(line)) {
          const item = {
            id: `${type}-${name.replace(/\s/g, '-').toLowerCase()}`,
            name,
            day: type === 'rehab' ? 2 : 1
          };
          
          if (type === 'accessory') {
            const setsReps = line.match(/(\d+)x(\d+)/);
            if (setsReps) {
              item.sets = setsReps[1];
              item.reps = setsReps[2];
            }
            const weight = line.match(/(\d+)kg/);
            if (weight) item.weight = `${weight[1]}kg`;
            accessories.push(item);
          } else {
            const protocol = line.match(/(\d+[sx]\s*\d+|\d+\s*set)/i);
            item.protocol = protocol ? protocol[1] : '';
            rehabItems.push(item);
          }
        }
      }
    }

    return { lifts, accessories, rehab: rehabItems };
  };

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    
    setFileName(file.name);
    setStatus('uploading');

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const text = await file.text();
      const data = parseTrainingData(text);
      
      setStatus('success');
      await onDataExtracted?.(data);
      
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [onDataExtracted]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  }, [handleFile]);

  return (
    <div className="relative">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: isDragging ? 1.02 : 1 }}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all
          ${isDragging 
            ? 'border-indigo-400 bg-indigo-50' 
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
          }
        `}
      >
        <input
          type="file"
          accept=".docx,.doc,.txt"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Upload Training Program</h4>
              <p className="text-sm text-gray-500 mb-3">
                Drag & drop or click to upload .docx or .txt
              </p>
              <p className="text-xs text-gray-400">
                Files with "Week 1, Week 2, Week 3" patterns will be auto-parsed
              </p>
            </motion.div>
          )}
          
          {status === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Processing {fileName}...</p>
            </motion.div>
          )}
          
          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-emerald-600 font-medium">Data extracted successfully!</p>
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">Failed to process file</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}