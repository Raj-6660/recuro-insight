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
import { Badge } from "@/components/ui/badge";

const WEBHOOK_URL = 'https://ghostr.app.n8n.cloud/webhook-test/ea09ac68-19dd-41d1-ab69-84f8822a28b7';

// --- TYPES TO MATCH N8N NORMALIZER OUTPUT ---
interface FocusArea { name: string; }
// Updated: Resource no longer has a URL, per normalizer.js
interface RoadmapResource { name: string; } 

interface RoadmapPhase {
  phase: string;
  expected_duration: string;
  focus_areas: FocusArea[];
  recommended_resources: RoadmapResource[];
}
interface RoadmapOutput {
  overview: string;
  outcome: string;
  roadmap: RoadmapPhase[];
}
// --- END OF TYPES ---

const LearningRoadmapTab = () => {
  const [loading, setLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapOutput | null>(null);
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const { toast } = useToast();

  const handleGenerateRoadmap = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) {
      toast({ title: "Missing information", description: "Please provide both your current skills and target role.", variant: "destructive" });
      return;
    }

    const skills = currentSkills.split(',').map(s => s.trim()).filter(s => s);
    setLoading(true);
    setRoadmapData(null);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'learning_roadmap', current_skills: skills, target_role: targetRole, timestamp: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // --- UPDATED DATA HANDLING ---
      // Fix: Check for the 'json' wrapper from n8n's 'Respond to Webhook' node
      if (Array.isArray(data) && data.length > 0 && data[0].json && data[0].json.output) {
        const normalizedOutput = data[0].json.output as RoadmapOutput;

        // No re-normalization needed! The n8n node already did the work.
        // We just set the data directly.
        setRoadmapData(normalizedOutput);

        toast({ title: "Learning Roadmap Generated", description: "Successfully received roadmap from n8n." });
      } else {
        // Updated error message to be more accurate
        throw new Error("Invalid response format from webhook. Expected [{ json: { output: { ... } } }]");
      }
      // --- END OF UPDATED DATA HANDLING ---

    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: `Failed to generate roadmap: ${error.message}`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FaGraduationCap className="h-5 w-5" /> Learning Roadmap Generator</CardTitle>
          <CardDescription>Get personalized learning recommendations based on your current skills and career goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Skills</label>
              <Input placeholder="Python, DSA, Machine Learning" value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Role</label>
              <Input placeholder="Software Development Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleGenerateRoadmap} disabled={loading} className="bg-student-gradient w-full md:w-auto">
            {loading ? 'Generating Roadmap...' : 'Generate Learning Roadmap'}
          </Button>
        </CardContent>
      </Card>

      {roadmapData && (
        <Card>
          <CardHeader>
            <CardTitle>Your Learning Roadmap</CardTitle>
            <CardDescription>{roadmapData.overview}</CardDescription>
          </CardHeader> {/* <-- Fixed the typo here */}
          <CardContent className="space-y-6">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FaCheckCircle className="h-5 w-5 mr-2 text-green-600" /> Expected Outcome
              </h3>
              <p className="text-sm text-secondary-foreground">{roadmapData.outcome}</p>
            </div>

            <Accordion type="single" collapsible className="w-full" defaultValue="phase-0">
              {/* Add safety check for roadmap array */
              Array.isArray(roadmapData.roadmap) && roadmapData.roadmap.map((phase, phaseIndex) => (
                <AccordionItem value={`phase-${phaseIndex}`} key={phaseIndex}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 items-center">
                      <span className="text-lg font-medium text-left">{phase.phase}</span>
                      <Badge variant="outline" className="ml-4 whitespace-nowGrap">{phase.expected_duration}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-base flex items-center"><FaListUl className="h-4 w-4 mr-2 text-primary" /> Focus Areas</h4>
                      <ul className="list-disc list-inside pl-4 text-sm space-y-3 text-muted-foreground">
                        {/* Add safety check for focus_areas array */
                        Array.isArray(phase.focus_areas) && phase.focus_areas.length > 0 ? (
                          phase.focus_areas.map((fa, i) => <li key={i}>{fa.name}</li>)
                        ) : (
                          <p className="text-sm text-muted-foreground/70 list-none">No focus areas listed.</p>
                        )}
                      </ul>
                    </div>
                    
                    {/* --- UPDATED RESOURCES SECTION --- */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center"><FaBook className="h-4 w-4 mr-2 text-primary" /> Recommended Resources</h4>
                      <ul className="list-disc list-inside pl-4 text-sm space-y-2 text-muted-foreground">
                        {/* Add safety check for recommended_resources array */
                        Array.isArray(phase.recommended_resources) && phase.recommended_resources.length > 0 ? (
                          phase.recommended_resources.map((r, i) => (
                            // Changed: Render as simple text, not a link
                            <li key={i}>
                              {r.name}
                            </li>
                          ))
                        ) : (
                          <p className="pl-4 text-sm text-muted-foreground/70">No resources listed.</p>
                        )}
                      </ul>
                    </div>
                    {/* --- END OF UPDATED SECTION --- */}

                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningRoadmapTab;









