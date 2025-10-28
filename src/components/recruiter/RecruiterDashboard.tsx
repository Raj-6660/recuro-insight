import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import JDSummarizerTab from './JDSummarizerTab';
import { FaBuilding, FaSignOutAlt } from 'react-icons/fa';
import recruiterBg from '@/assets/recruiter-bg.png';

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen relative">
      {/* Background image with reduced brightness */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${recruiterBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-recruiter-gradient">
                  <FaBuilding className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Job Screening Platform</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
                </div>
              </div>
              <Button onClick={logout} variant="outline" size="sm">
                <FaSignOutAlt className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Recruiter Dashboard</h2>
            <p className="text-muted-foreground">
              Upload and analyze job descriptions with AI
            </p>
          </div>

          <JDSummarizerTab />
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;