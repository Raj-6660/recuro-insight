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

// --- Types updated to match the NEW n8n JSON output ---

// NEW interface for the "focus_areas" object
interface FocusArea {
  name: string;
  description: string;
}

// Interface for the "recommended_resources" object
interface RoadmapResource {
  name: string;
  url: string;
}

interface RoadmapPhase {
  phase: string; // Changed from 'title'
  expected_duration: string;
  focus_areas: FocusArea[]; // Changed from 'string[]'
  recommended_resources: RoadmapResource[];
}

interface RoadmapOutput {
  overview: string;
  outcome: string;
  roadmap: RoadmapPhase[]; // Changed from 'phases'
}
// --- End of Updated Types ---

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
      // Check for the 'json' wrapper from n8n
      if (Array.isArray(data) && data.length > 0 && data[0].json && data[0].json.output) {
        // Access the 'output' object inside 'json'
        const output = data[0].json.output as RoadmapOutput;
        setRoadmapData(output);
        toast({
          title: "Learning Roadmap Generated",
          description: "Received roadmap from n8n successfully.",
        });
      } else {
        // Updated error message to reflect the expected structure
        throw new Error("Invalid response format from webhook. Expected [{ json: { output: { ... } } }]");
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

            {/* Phases Section */}
            <Accordion type="single" collapsible className="w-full" defaultValue="phase-0">
              {/* Add safety check for 'roadmap' array itself */}
              {Array.isArray(roadmapData.roadmap) && roadmapData.roadmap.map((phase, phaseIndex) => (
                <AccordionItem value={`phase-${phaseIndex}`} key={phase.phase || phaseIndex}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 items-center">
                      <span className="text-lg font-medium text-left">
                        {/* Use new 'phase' key */}
                        {phase.phase}
                      </span>
                      <Badge variant="outline" className="ml-4 whitespace-nowGrap">
                        {/* Use 'expected_duration' key */}
                        {phase.expected_duration}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    
                    {/* --- MODIFIED FOCUS AREAS SECTION --- */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-base flex items-center">
                        <FaListUl className="h-4 w-4 mr-2 text-primary" />
                        Focus Areas
                      </h4>
                      {/* Render new object structure */}
                      <ul className="list-disc list-inside pl-4 text-sm space-y-3 text-muted-foreground">
                        {Array.isArray(phase.focus_areas) && phase.focus_areas.length > 0 ? (
                          phase.focus_areas.map((area, areaIndex) => (
                            <li key={areaIndex}>
                              <strong className="text-primary-foreground">{area.name}:</strong> {area.description}
                            </li>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground/70 list-none">No focus areas listed for this phase.</p>
                        )}
                      </ul>
                    </div>
                    {/* --- END OF MODIFIED SECTION --- */}


                    {/* --- RECOMMENDED RESOURCES SECTION (Logic is correct) --- */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center">
                        <FaBook className="h-4 w-4 mr-2 text-primary" />
                        Recommended Resources
                      </h4>
                      <div className="space-y-3">
                        {/* Check if 'recommended_resources' array exists and has items. */}
                        {Array.isArray(phase.recommended_resources) && phase.recommended_resources.length > 0 ? (
                          // Map over the 'recommended_resources' array of objects
                          <ul className="list-disc list-inside pl-4 text-sm space-y-2 text-muted-foreground">
                            {phase.recommended_resources.map((resource, resIndex) => (
                              <li key={resIndex}>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center"
                                >
                                  {resource.name}
                                  <FaExternalLinkAlt className="h-3 w-3 ml-1.5" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          // Show a fallback message if no resources are provided
                          <p className="pl-4 text-sm text-muted-foreground/70">No specific resources listed for this phase.</p>
                        )}
                      </div>
                    </div>
                    {/* --- END OF SECTION --- */}

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

