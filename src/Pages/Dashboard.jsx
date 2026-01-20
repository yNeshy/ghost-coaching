import React, { useState, useEffect } from 'react';
import { Dumbbell, Settings } from 'lucide-react';

import memoryLocalStorage from '@/api/memoryLocalStorage';
import RoleToggle from '@/components/coaching/RoleToggle';
import CoachDashboard from './CoachDashboard';
import AthleteDashboard from './AthleteDashboard';
import SettingsModal from '@/components/coaching/SettingsModal';

export default function Dashboard() {
  const [role, setRole] = useState(() => memoryLocalStorage.getItem('coachingRole') || 'coach');
  const [showSettings, setShowSettings] = useState(false);
  const [currentUser] = useState({ name: 'Marcus Johnson', email: 'marcus@example.com', role: role });

  // Save role to memoryLocalStorage
  useEffect(() => {
    memoryLocalStorage.setItem('coachingRole', role);
  }, [role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Ghost coaching</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <RoleToggle role={role} onRoleChange={setRole} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'coach' ? <CoachDashboard /> : <AthleteDashboard />}
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={currentUser}
      />
    </div>
  );
}
