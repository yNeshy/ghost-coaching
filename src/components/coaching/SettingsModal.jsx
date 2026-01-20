import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, LogOut, AlertCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, user }) {
  const handleLogout = () => {
    alert('Logout clicked - this is a mock logout');
    // Mock logout - in real app would call base44.auth.logout()
  };

  const handleReportProblem = () => {
    alert('Report problem clicked - this would open a support form');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{user?.name || 'Athlete'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email || 'athlete@example.com'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-gray-900 capitalize">{user?.role || 'Athlete'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleReportProblem}
              variant="outline"
              className="w-full justify-start"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Report Problem
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}