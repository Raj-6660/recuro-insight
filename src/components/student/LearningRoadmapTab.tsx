import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FaGraduationCap } from 'react-icons/fa';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Developer Configuration: Set your n8n webhook URL here
const WEBHOOK_URL = 'https://ghostr.app.n8n.cloud/webhook-test/ea09ac68-19dd-41d1-ab69-84f8822a28b7';

// --- New Types to match the n8n JSON output ---
interface RoadmapModule {
  focus_area: string;
  topics: string[];
  resources: string[];
}

interface RoadmapPhase {
  phase_name: string;
  phase_description: string;
  expected_duration: string;
  modules: RoadmapModule[];
}

interface RoadmapOutput {
  overview: string;
  outcome: string;
  roadmap: RoadmapPhase[];
  timestamp: string;
}
// --- End of New Types ---

const LearningRoadmapTab = () => {
  const [loading, setLoading] = useState(false);
  // State updated to hold the new data structure
  const [roadmapData, setRoadmapData] = useState<RoadmapOutput | null>(null);
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const { toast } = useToast();

  const handleGenerateRoadmap = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both your current skills and target role.",
        variant: "destructive",
      });
      return;
    }

    const skills = currentSkills.split(',').map(s => s.trim()).filter(s => s);
    setLoading(true);
    setRoadmapData(null); // Clear previous results

    try {
      // Send to n8n webhook and wait for roadmap response
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: 'learning_roadmap',
          current_skills: skills,
          target_role: targetRole,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // --- Updated response handling ---
      // n8n function node outputs an array, we expect [ { success: true, output: { ... } } ]
      if (Array.isArray(data) && data.length > 0 && data[0].success && data[0].output) {
        const output = data[0].output as RoadmapOutput;
        setRoadmapData(output); // Set the new state
        toast({
          title: "Learning Roadmap Generated",
          description: "Received roadmap from n8n successfully.",
        });
      } else {
        throw new Error("Invalid response format from webhook. Expected [{ success: true, output: { ... } }]");
      }
      // --- End of updated response handling ---

    } catch (error) {
      console.error("Error sending to webhook:", error);
      toast({
        title: "Error",
        description: "Failed to generate roadmap. Please check the webhook response format.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Obsolete functions (exportData, getPriorityBadge, getTypeBadge) have been removed.

  return (
    <div className="space-y-6">
      {/* Input Section (Unchanged) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaGraduationCap className="h-5 w-5" />
            Learning Roadmap Generator
          </CardTitle>
          <CardDescription>
            Get personalized learning recommendations based on your current skills and career goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Skills</label>
              <Input
                placeholder="React, JavaScript, CSS, Git"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Role</label>
              <Input
                placeholder="Senior Frontend Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleGenerateRoadmap} 
            disabled={loading}
            className="bg-student-gradient w-full md:w-auto"
          >
            {loading ? 'Generating Roadmap...' : 'Generate Learning Roadmap'}
          </Button>
        </CardContent>
      </Card>

      {/* --- New Results Section --- */}
      {roadmapData && (
        <Card>
          <CardHeader>
            <CardTitle>Your Learning Roadmap</CardTitle>
            <CardDescription>
              {roadmapData.overview}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Outcome Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Expected Outcome</h3>
              <p className="text-sm text-muted-foreground">{roadmapData.outcome}</p>
            </div>

            {/* Phases Section */}
            <Accordion type="single" collapsible className="w-full" defaultValue="phase-0">
              {roadmapData.roadmap.map((phase, phaseIndex) => (
                <AccordionItem value={`phase-${phaseIndex}`} key={phaseIndex}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 items-center">
                      <span className="text-lg font-medium text-left">{phase.phase_name}</span>
                      <span className="text-sm text-muted-foreground font-normal whitespace-nowrap pl-4">{phase.expected_duration}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-4 space-y-6">
                    <p className="text-muted-foreground">{phase.phase_description}</p>
                    
                    {/* Modules Section */}
                    {phase.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="border-l-2 border-primary pl-4 py-2 space-y-3">
                        <h4 className="font-semibold">{module.focus_area}</h4>
                        
                        <div>
                          <h5 className="text-sm font-medium uppercase text-muted-foreground">Topics:</h5>
                          <ul className="list-disc list-inside pl-2 text-sm space-y-1 mt-1">
                            {module.topics.map((topic, topicIndex) => (
                              <li key={topicIndex}>{topic}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium uppercase text-muted-foreground">Resources:</h5>
                          <ul className="list-disc list-inside pl-2 text-sm space-y-1 mt-1">
                            {module.resources.map((resource, resourceIndex) => (
                              <li key={resourceIndex}>{resource}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      {/* --- End of New Results Section --- */}
    </div>
  );
};

export default LearningRoadmapTab;
