import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import SkillAnalysisTab from './SkillAnalysisTab';
import CareerPathTab from './CareerPathTab';
import LearningRoadmapTab from './LearningRoadmapTab';
import JobMarketTab from './JobMarketTab';
import { FaUserGraduate, FaSignOutAlt, FaChartBar, FaRoad, FaGraduationCap, FaChartLine } from 'react-icons/fa';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-student-gradient">
                <FaUserGraduate className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Career Navigator</h1>
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
          <h2 className="text-3xl font-bold mb-2">Student Dashboard</h2>
          <p className="text-muted-foreground">
            Analyze your skills, explore career paths, and plan your learning journey
          </p>
        </div>

        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <FaChartBar className="h-4 w-4" />
              <span className="hidden sm:inline">Skill Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="career" className="flex items-center gap-2">
              <FaRoad className="h-4 w-4" />
              <span className="hidden sm:inline">Career Paths</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <FaGraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Learning Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <FaChartLine className="h-4 w-4" />
              <span className="hidden sm:inline">Job Market</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <SkillAnalysisTab />
          </TabsContent>

          <TabsContent value="career">
            <CareerPathTab />
          </TabsContent>

          <TabsContent value="learning">
            <LearningRoadmapTab />
          </TabsContent>

          <TabsContent value="market">
            <JobMarketTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;