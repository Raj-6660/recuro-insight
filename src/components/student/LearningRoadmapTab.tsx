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
import { Badge } from "@/components/ui/badge";
import { LearningRoadmapState } from './StudentDashboard';

const WEBHOOK_URL = 'https://ghostyy.app.n8n.cloud/webhook/ea09ac68-19dd-41d1-ab69-84f8822a28b7';

// --- UPDATED TYPES TO MATCH NORMALIZED N8N OUTPUT ---
interface RoadmapResource {
  name: string;
  url?: string | null;
}

interface RoadmapPhase {
  name: string;                  // was "phase" in old UI; normalizer returns "name"
  expected_duration: string;
  focus_areas: string[];         // normalizer returns array of strings
  recommended_resources: RoadmapResource[];
}

interface RoadmapOutput {
  candidate?: {
    current_skills?: string;
    target_role?: string;
  };
  overview?: string;
  outcome?: string[];            // normalizer returns an array
  roadmap?: RoadmapPhase[];      // legacy; keep for compatibility
  phases?: RoadmapPhase[];       // some outputs might use "phases"
  roadmapData?: RoadmapPhase[];  // not used, just in case
  // normalized code uses 'phases' — we'll look for phases OR roadmap
  // other fields:
  skill_gaps?: string[];
  estimated_total_time?: string;
  practical_project_ideas?: { title: string; description: string }[];
  interview_prep?: string[];
  motivation_tip?: string;
}

interface LearningRoadmapTabProps {
  state: LearningRoadmapState;
  setState: React.Dispatch<React.SetStateAction<LearningRoadmapState>>;
}

const LearningRoadmapTab = ({ state, setState }: LearningRoadmapTabProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { roadmapData, currentSkills, targetRole } = state;

  const handleGenerateRoadmap = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) {
      toast({ title: "Missing information", description: "Please provide both your current skills and target role.", variant: "destructive" });
      return;
    }

    const skills = currentSkills.split(',').map(s => s.trim()).filter(s => s);
    setLoading(true);
    setState(prev => ({ ...prev, roadmapData: null }));

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'learning_roadmap', current_skills: skills, target_role: targetRole, timestamp: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Accept both shapes:
      // 1) n8n Code node returning: [{ json: { output: normalized } }]
      // 2) direct AI return: { output: { ... } } or { ... }
      let normalized: any = null;
      if (Array.isArray(data) && data.length > 0 && data[0].json && data[0].json.output) {
        normalized = data[0].json.output;
      } else if (data?.json?.output) {
        normalized = data.json.output;
      } else if (data?.output) {
        normalized = data.output;
      } else if (data) {
        normalized = data;
      }

      if (!normalized) throw new Error("Invalid response format from webhook. Expected normalized payload.");

      // Normalize to final RoadmapOutput shape
      const finalOutput: RoadmapOutput = {
        candidate: normalized.candidate,
        overview: normalized.overview,
        outcome: Array.isArray(normalized.outcome) ? normalized.outcome : (typeof normalized.outcome === 'string' ? [normalized.outcome] : []),
        // prefer 'phases', fallback to 'roadmap'
        phases: Array.isArray(normalized.phases) ? normalized.phases : (Array.isArray(normalized.roadmap) ? normalized.roadmap : []),
        skill_gaps: normalized.skill_gaps,
        estimated_total_time: normalized.estimated_total_time,
        practical_project_ideas: normalized.practical_project_ideas,
        interview_prep: normalized.interview_prep,
        motivation_tip: normalized.motivation_tip
      };

      // Save to state in the shape your UI expects (your UI previously used roadmapData.overview etc.)
      setState(prev => ({ ...prev, roadmapData: finalOutput as any }));
      toast({ title: "Learning Roadmap Generated", description: "Successfully received roadmap from n8n." });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: `Failed to generate roadmap: ${error.message}`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleCurrentSkillsChange = (value: string) => {
    setState(prev => ({ ...prev, currentSkills: value }));
  };

  const handleTargetRoleChange = (value: string) => {
    setState(prev => ({ ...prev, targetRole: value }));
  };

  // UI helpers
  const phasesToRender: RoadmapPhase[] = (() => {
    if (!roadmapData) return [];
    // roadmapData was previously typed differently; handle both possible property names
    const maybePhases = (roadmapData as any).phases ?? (roadmapData as any).roadmap ?? (roadmapData as any).phases;
    if (Array.isArray(maybePhases)) return maybePhases;
    return [];
  })();

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
              <Input placeholder="Python, DSA, Machine Learning" value={currentSkills} onChange={(e) => handleCurrentSkillsChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Role</label>
              <Input placeholder="Software Development Engineer" value={targetRole} onChange={(e) => handleTargetRoleChange(e.target.value)} />
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
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FaCheckCircle className="h-5 w-5 mr-2 text-green-600" /> Expected Outcome
              </h3>

              {/* outcome can be array; render as list */}
              {Array.isArray(roadmapData.outcome) ? (
                <ul className="list-disc list-inside pl-4 text-sm space-y-2 text-muted-foreground">
                  {roadmapData.outcome.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-secondary-foreground">{String(roadmapData.outcome ?? '')}</p>
              )}
            </div>

            <Accordion type="single" collapsible className="w-full" defaultValue="phase-0">
              {phasesToRender.map((phase: RoadmapPhase, phaseIndex: number) => (
                <AccordionItem value={`phase-${phaseIndex}`} key={phaseIndex}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 items-center">
                      <span className="text-lg font-medium text-left">{phase.name}</span>
                      <Badge variant="outline" className="ml-4 whitespace-nowrap">{phase.expected_duration}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-base flex items-center"><FaListUl className="h-4 w-4 mr-2 text-primary" /> Focus Areas</h4>
                      <ul className="list-disc list-inside pl-4 text-sm space-y-3 text-muted-foreground">
                        {Array.isArray(phase.focus_areas) && phase.focus_areas.length > 0 ? (
                          phase.focus_areas.map((fa, i) => <li key={i}>{fa}</li>)
                        ) : (
                          <p className="text-sm text-muted-foreground/70 list-none">No focus areas listed.</p>
                        )}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-base flex items-center"><FaBook className="h-4 w-4 mr-2 text-primary" /> Recommended Resources</h4>
                      <ul className="list-disc list-inside pl-4 text-sm space-y-2 text-muted-foreground">
                        {Array.isArray(phase.recommended_resources) && phase.recommended_resources.length > 0 ? (
                          phase.recommended_resources.map((r, i) => (
                            <li key={i}>
                              {r.url ? (
                                <a href={r.url} target="_blank" rel="noreferrer" className="underline">
                                  {r.name}
                                </a>
                              ) : (
                                <span>{r.name}</span>
                              )}
                            </li>
                          ))
                        ) : (
                          <p className="pl-4 text-sm text-muted-foreground/70">No resources listed.</p>
                        )}
                      </ul>
                    </div>

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
