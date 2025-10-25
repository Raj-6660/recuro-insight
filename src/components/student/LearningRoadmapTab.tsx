import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FaGraduationCap, FaDownload } from 'react-icons/fa';

// 🔗 Your n8n webhook URL
const WEBHOOK_URL = 'https://ghostr.app.n8n.cloud/webhook-test/ea09ac68-19dd-41d1-ab69-84f8822a28b7';

interface RoadmapPhase {
  phase: number;
  title: string;
  expected_duration: string;
  focus_areas: string[];
  recommended_resources: string[];
}

interface RoadmapData {
  overview: string;
  outcome: string;
  roadmap: RoadmapPhase[];
}

const LearningRoadmapTab = () => {
  const [loading, setLoading] = useState(false);
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const { toast } = useToast();

  // 🚀 Generate Roadmap
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

    try {
      // Send request to webhook
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'learning_roadmap',
          current_skills: skills,
          target_role: targetRole,
          timestamp: new Date().toISOString(),
        }),
      });

      // Parse response (from n8n “Respond to Webhook” node)
      const data = await response.json();

      // Ensure the structure matches what we expect
      if (data?.output?.roadmap) {
        setRoadmapData(data.output);
        toast({
          title: "Roadmap generated successfully",
          description: "Your personalized learning roadmap is ready!",
        });
      } else {
        throw new Error("Invalid response format from webhook");
      }

    } catch (error) {
      console.error("Error sending to webhook:", error);
      toast({
        title: "Error",
        description: "Failed to generate roadmap. Check your webhook or workflow.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 📝 Export Roadmap to Word Document
  const exportData = () => {
    if (!roadmapData) return;

    let content = `Learning Roadmap Report\n\n`;
    content += `Overview:\n${roadmapData.overview || "N/A"}\n\n`;

    roadmapData.roadmap.forEach((phase) => {
      content += `Phase ${phase.phase}: ${phase.title}\n`;
      content += `Duration: ${phase.expected_duration || "N/A"}\n\n`;

      content += `Focus Areas:\n`;
      (phase.focus_areas || []).forEach((a) => {
        content += `• ${a}\n`;
      });
      content += `\n`;

      content += `Recommended Resources:\n`;
      (phase.recommended_resources || []).forEach((r) => {
        content += `• ${r}\n`;
      });
      content += `\n----------------------------------------\n\n`;
    });

    content += `Expected Outcome:\n${roadmapData.outcome || "N/A"}\n`;

    const blob = new Blob(["\ufeff", content], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Learning_Roadmap_Report.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
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
                placeholder="Python, DSA, Git"
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

      {/* Results Section */}
      {roadmapData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Learning Roadmap</CardTitle>
              <CardDescription>
                {roadmapData.roadmap.length} Phases to reach your goal
              </CardDescription>
            </div>
            <Button onClick={exportData} variant="outline">
              <FaDownload className="mr-2 h-4 w-4" />
              Export as Word
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-gray-700 text-base"><strong>Overview:</strong> {roadmapData.overview}</p>
              {roadmapData.roadmap.map((phase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Phase {phase.phase}: {phase.title}
                  </h3>
                  <p className="text-sm mb-2"><strong>Duration:</strong> {phase.expected_duration}</p>

                  <div className="mb-2">
                    <strong>Focus Areas:</strong>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {phase.focus_areas.map((area, i) => <li key={i}>{area}</li>)}
                    </ul>
                  </div>

                  <div>
                    <strong>Recommended Resources:</strong>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {phase.recommended_resources.map((res, i) => <li key={i}>{res}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
              <p className="text-gray-700 text-base"><strong>Outcome:</strong> {roadmapData.outcome}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningRoadmapTab;
