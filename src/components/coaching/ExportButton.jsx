import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExportButton({ trainingBlock, notes, currentWeek = 1 }) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    
    // Create printable content
    const content = `
STRENGTH COACHING - WEEK ${currentWeek} SUMMARY
${'='.repeat(50)}

ATHLETE: ${trainingBlock?.athlete_name || 'N/A'}
CYCLE: ${trainingBlock?.cycle_name || 'N/A'}
GENERATED: ${new Date().toLocaleDateString()}

${'─'.repeat(50)}
MAIN LIFTS
${'─'.repeat(50)}

SQUATS: ${trainingBlock?.lifts?.squats?.[`week${currentWeek}`] || 'N/A'}
DEADLIFTS: ${trainingBlock?.lifts?.deadlifts?.[`week${currentWeek}`] || 'N/A'}
SECONDARY SQUATS: ${trainingBlock?.lifts?.secondary_squats?.[`week${currentWeek}`] || 'N/A'}

${'─'.repeat(50)}
ACCESSORIES
${'─'.repeat(50)}

${(trainingBlock?.accessories || []).map(a => 
  `• ${a.name}: ${a.sets || '-'} sets × ${a.reps || '-'} reps ${a.weight ? `@ ${a.weight}` : ''}`
).join('\n')}

${'─'.repeat(50)}
REHAB PROTOCOL
${'─'.repeat(50)}

${(trainingBlock?.rehab || []).map(r => 
  `• ${r.name}: ${r.protocol || 'As prescribed'}`
).join('\n')}

${'─'.repeat(50)}
NOTES
${'─'.repeat(50)}

${(notes || []).map(n => 
  `[${n.author_role?.toUpperCase()}] ${n.exercise_name || 'General'}:
   ${n.content}
   (${n.created_date ? new Date(n.created_date).toLocaleDateString() : 'N/A'})
`).join('\n')}
    `.trim();

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-week-${currentWeek}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isExporting}
      variant="outline"
      className="rounded-xl border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export Week {currentWeek}
        </>
      )}
    </Button>
  );
}