import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import JDSummarizerTab from './JDSummarizerTab';
import MatchScorerTab from './MatchScorerTab';
import { FaBuilding, FaSignOutAlt, FaFileAlt, FaSearch } from 'react-icons/fa';

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark-gradient">
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
            Streamline your hiring process with AI-powered candidate screening
          </p>
        </div>

        <Tabs defaultValue="jd-analyzer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
            <TabsTrigger value="jd-analyzer" className="flex items-center gap-2">
              <FaFileAlt className="h-4 w-4" />
              <span className="hidden sm:inline">JD Uploader</span>
            </TabsTrigger>
            <TabsTrigger value="match-scorer" className="flex items-center gap-2">
              <FaSearch className="h-4 w-4" />
              <span className="hidden sm:inline">Match Scorer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jd-analyzer">
            <JDSummarizerTab />
          </TabsContent>

          <TabsContent value="match-scorer">
            <MatchScorerTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RecruiterDashboard;