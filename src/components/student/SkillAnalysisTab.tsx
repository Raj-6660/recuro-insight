import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FaUpload, FaDownload, FaFileAlt } from 'react-icons/fa';

// Developer Configuration: Set your n8n webhook URL here
const WEBHOOK_URL = 'https://ghostr.app.n8n.cloud/webhook-test/382240e3-b2de-49e1-a60e-be8010ba93a5';

const SkillAnalysisTab = () => {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, TXT, or DOC file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('action', 'analyze_skills');
      
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Webhook request failed");
      }

      const result = await response.json();

      if (result.candidates && Array.isArray(result.candidates)) {
        setCandidates(result.candidates);
        toast({
          title: "Analysis Complete",
          description: "Candidate skill analysis received successfully.",
        });
      } else {
        throw new Error("Invalid response format from n8n");
      }
    } catch (error) {
      console.error("Error sending to webhook:", error);
      toast({
        title: "Error",
        description: "Failed to send data to webhook. Please check the URL or n8n configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      [
        "Candidate Name",
        "Core Technical Skills",
        "Supporting Soft Skills",
        "Skill Gaps / Improvement Areas",
        "Suggested Career Paths",
        "Career Growth Potential",
        "Overall Skill Readiness (0–10)",
        "Justification for Rating"
      ],
      ...candidates.map(c => [
        c.candidate_name,
        c.core_technical_skills,
        c.supporting_soft_skills,
        c.skill_gaps,
        c.suggested_career_paths,
        c.career_growth_potential,
        c.overall_skill_readiness,
        c.justification_for_rating
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidate-skill-analysis.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaFileAlt className="h-5 w-5" />
            Upload CV/Transcript
          </CardTitle>
          <CardDescription>
            Upload your CV or academic transcript to analyze your skills automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileSelect}
              className="flex-1"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={!selectedFile || loading}
              className="bg-student-gradient"
            >
              {loading ? (
                <>Analyzing...</>
              ) : (
                <>
                  <FaUpload className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {candidates.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Candidate Skill Analysis</CardTitle>
              <CardDescription>
                {candidates.length} record{candidates.length > 1 ? 's' : ''} analyzed
              </CardDescription>
            </div>
            <Button onClick={exportData} variant="outline">
              <FaDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate Name</TableHead>
                    <TableHead>Core Technical Skills</TableHead>
                    <TableHead>Supporting Soft Skills</TableHead>
                    <TableHead>Skill Gaps / Improvement Areas</TableHead>
                    <TableHead>Suggested Career Paths</TableHead>
                    <TableHead>Career Growth Potential</TableHead>
                    <TableHead>Overall Skill Readiness (0–10)</TableHead>
                    <TableHead>Justification for Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{c.candidate_name}</TableCell>
                      <TableCell>{c.core_technical_skills}</TableCell>
                      <TableCell>{c.supporting_soft_skills}</TableCell>
                      <TableCell>{c.skill_gaps}</TableCell>
                      <TableCell>{c.suggested_career_paths}</TableCell>
                      <TableCell>{c.career_growth_potential}</TableCell>
                      <TableCell>{c.overall_skill_readiness}</TableCell>
                      <TableCell>{c.justification_for_rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillAnalysisTab;
