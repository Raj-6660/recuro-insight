import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FaGraduationCap, FaCheckCircle, FaBook, FaListUl, FaExternalLinkAlt } from 'react-icons/fa';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge"; // Using Badge for duration

// Developer Configuration: Set your n8n webhook URL here
const WEBHOOK_URL = 'https://ghostr.app.n8n.cloud/webhook-test/ea09ac68-19dd-41d1-ab69-84f8822a28b7';

// --- Types for handling multiple n8n response formats ---

interface RoadmapModule {
  focus_area: string;
  resources: string[];
}

// Normalized internal format
interface RoadmapPhase {
  phase: string;
  expected_duration: string;
  description?: string;
  modules: RoadmapModule[];
}

interface RoadmapOutput {
  overview: string;
  outcome: string;
  roadmap: RoadmapPhase[];
}

// Raw response formats from n8n
interface RawPhaseFormat1 {
  phase: string;
  expected_duration: string;
  description: string;
  modules: RoadmapModule[];
}

interface RawPhaseFormat2 {
  phase_title: string;
  expected_duration: string;
  focus_areas: string[];
  recommended_resources: string[];
}

// Mapper function to normalize different formats
const normalizeRoadmapPhase = (rawPhase: any): RoadmapPhase => {
  // Check if it's Format 1 (has modules)
  if (rawPhase.modules && Array.isArray(rawPhase.modules)) {
    return {
      phase: rawPhase.phase || rawPhase.phase_title || 'Untitled Phase',
      expected_duration: rawPhase.expected_duration || 'N/A',
      description: rawPhase.description,
      modules: rawPhase.modules,
    };
  }
  
  // Format 2 (has focus_areas and recommended_resources as flat arrays)
  if (rawPhase.focus_areas && rawPhase.recommended_resources) {
    return {
      phase: rawPhase.phase_title || rawPhase.phase || 'Untitled Phase',
      expected_duration: rawPhase.expected_duration || 'N/A',
      description: undefined,
      modules: [{
        focus_area: 'Key Focus Areas',
        resources: [...rawPhase.focus_areas, ...rawPhase.recommended_resources],
      }],
    };
  }
  
  // Fallback for unexpected format
  return {
    phase: rawPhase.phase_title || rawPhase.phase || 'Untitled Phase',
    expected_duration: rawPhase.expected_duration || 'N/A',
    description: rawPhase.description,
    modules: [],
  };
};
// --- End of Types and Mapper ---

const LearningRoadmapTab = () => {
  const [loading, setLoading] = useState(false);
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

    // --- Add 2-Minute Timeout (120,000 ms) ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 120000); // 2 minutes
    // --- End of Timeout Logic ---

    try {
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
        signal: controller.signal, // Pass the AbortController's signal to fetch
      });

      // Clear the timeout if the request completes in time
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // --- MODIFIED LINES TO FIX PARSING ---
      // Check for the new response structure from n8n
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        const rawOutput = data[0].output;
        
        // Normalize the roadmap phases using the mapper
        const normalizedOutput: RoadmapOutput = {
          overview: rawOutput.overview || 'Learning roadmap generated successfully.',
          outcome: rawOutput.outcome || 'Complete this roadmap to achieve your career goals.',
          roadmap: Array.isArray(rawOutput.roadmap) 
            ? rawOutput.roadmap.map(normalizeRoadmapPhase)
            : [],
        };
        
        setRoadmapData(normalizedOutput);
        toast({
          title: "Learning Roadmap Generated",
          description: "Your personalized learning roadmap is ready!",
        });
      } else {
        throw new Error("Invalid response format from webhook. Expected [{ output: { ... } }]");
      }
      // --- END OF MODIFIED LINES ---

    } catch (error: any) {
      // --- Handle TimeoutError ---
      if (error.name === 'AbortError') {
        toast({
          title: "Request Timed Out",
          description: "The roadmap generation took longer than 2 minutes. Please try again.",
          variant: "destructive",
        });
      } else {
        console.error("Error sending to webhook:", error);
        toast({
          title: "Error",
          description: `Failed to generate roadmap: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
                placeholder="Python, DSA, Machine Learning"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Role</label>
              <Input
                placeholder="Software Development Engineer"
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

      {/* --- Upgraded Results Section --- */}
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
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FaCheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Expected Outcome
              </h3>
              <p className="text-sm text-secondary-foreground">{roadmapData.outcome}</p>
            </div>

            {/* Roadmap Phases Section */}
            <Accordion type="single" collapsible className="w-full" defaultValue="phase-0">
              {Array.isArray(roadmapData.roadmap) && roadmapData.roadmap.map((phase, phaseIndex) => (
                <AccordionItem value={`phase-${phaseIndex}`} key={phase.phase || phaseIndex}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 items-center">
                      <span className="text-lg font-medium text-left">
                        {phase.phase}
                      </span>
                      <Badge variant="outline" className="ml-4 whitespace-nowrap">
                        {phase.expected_duration}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    
                    {/* Phase Description */}
                    {phase.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {phase.description}
                      </p>
                    )}

                    {/* Modules Section */}
                    {Array.isArray(phase.modules) && phase.modules.length > 0 && (
                      <div className="space-y-5">
                        {phase.modules.map((module, moduleIndex) => (
                          <div key={moduleIndex} className="space-y-4">
                            {module.focus_area !== 'Key Focus Areas' && (
                              <div className="border-l-2 border-primary/30 pl-4">
                                <h4 className="font-semibold text-base flex items-center mb-3">
                                  <FaListUl className="h-4 w-4 mr-2 text-primary" />
                                  {module.focus_area}
                                </h4>
                              </div>
                            )}
                            
                            {/* Resources for this module */}
                            {Array.isArray(module.resources) && module.resources.length > 0 && (
                              <div className="space-y-3">
                                <h5 className="text-sm font-semibold flex items-center">
                                  <FaBook className="h-4 w-4 mr-2 text-primary" />
                                  {module.focus_area === 'Key Focus Areas' ? 'Learning Path' : 'Recommended Resources'}
                                </h5>
                                <ul className="space-y-2.5 pl-1">
                                  {module.resources.map((resource, resIndex) => (
                                    <li key={resIndex} className="flex gap-3 text-sm text-muted-foreground">
                                      <span className="text-primary mt-1.5">•</span>
                                      <span className="flex-1">{resource}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      {/* --- End of Upgraded Results Section --- */}
    </div>
  );
};

export default LearningRoadmapTab;

