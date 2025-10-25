import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FaGraduationCap, FaCheckCircle, FaBook, FaListUl } from 'react-icons/fa';
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
interface RoadmapResource {
  name: string;
  description: string;
}

interface RoadmapPhase {
  phase_title: string; // Changed from phase_name
  expected_duration: string;
  focus_areas: string[];
  recommended_resources: RoadmapResource[]; // Now an array of objects
}

interface RoadmapOutput {
  overview: string;
  outcome: string;
  roadmap: RoadmapPhase[];
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

      // --- !! NEW DEBUGGING LINE !! ---
      // Log the actual data to the console to see its structure
      console.log('Received data from n8n:', JSON.stringify(data, null, 2));
      // --- !! END OF DEBUGGING LINE !! ---


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
      // --- Handle Timeout Error ---
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
              {roadmapData.roadmap.map((phase, phaseIndex) => (
                <AccordionItem value={`phase-${phaseIndex}`} key={phaseIndex}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 items-center">
                      <span className="text-lg font-medium text-left">
                        {/* Use phase_title */}
                        {phase.phase_title}
                      </span>
                      <Badge variant="outline" className="ml-4 whitespace-nowrap">
                        {phase.expected_duration}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    
                    {/* Focus Areas Section */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-base flex items-center">
                        <FaListUl className="h-4 w-4 mr-2 text-primary" />
                        Focus Areas
                      </h4>
                      <ul className="list-disc list-inside pl-4 text-sm space-y-2 text-muted-foreground">
                        {phase.focus_areas.map((area, areaIndex) => (
                          <li key={areaIndex}>{area}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Resources Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center">
                        <FaBook className="h-4 w-4 mr-2 text-primary" />
                        Recommended Resources
                      </h4>
                      <div className="space-y-3">
                        {/* Render resources as objects */}
                        {phase.recommended_resources.map((resource, resIndex) => (
                          <div key={resIndex} className="pl-4 text-sm">
                            <strong className="block text-primary-foreground">{resource.name}</strong>
                            <p className="text-muted-foreground">{resource.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

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

