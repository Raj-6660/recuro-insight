import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SkillAnalysis } from '@/types/api';
import { analyzeSkills } from '@/services/api';
import { FaUpload, FaDownload, FaFileAlt } from 'react-icons/fa';

// Developer Configuration: Set your n8n webhook URL here
const WEBHOOK_URL = 'https://ghostr.app.n8n.cloud/webhook-test/af6bd38f-6e02-4bae-8842-1c447025ab64';

const SkillAnalysisTab = () => {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<SkillAnalysis[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
      // Send to n8n webhook
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('action', 'analyze_skills');
      
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      // Mock data for demo (since no-cors doesn't return data)
      const mockSkills: SkillAnalysis[] = [
        { skill: 'React.js', confidence_score: 92, category: 'Frontend Development' },
        { skill: 'TypeScript', confidence_score: 88, category: 'Programming Languages' },
        { skill: 'Node.js', confidence_score: 85, category: 'Backend Development' },
        { skill: 'Python', confidence_score: 78, category: 'Programming Languages' },
        { skill: 'SQL', confidence_score: 82, category: 'Database' },
        { skill: 'Machine Learning', confidence_score: 75, category: 'AI/ML' },
        { skill: 'Git', confidence_score: 90, category: 'Version Control' },
        { skill: 'AWS', confidence_score: 70, category: 'Cloud Computing' },
      ];
      setSkills(mockSkills);
      toast({
        title: "Request sent to n8n",
        description: "Data sent to webhook. Check your n8n workflow for results.",
      });
    } catch (error) {
      console.error("Error sending to webhook:", error);
      toast({
        title: "Error",
        description: "Failed to send data to webhook. Please check the URL.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      ['Skill', 'Confidence Score', 'Category'],
      ...skills.map(skill => [skill.skill, skill.confidence_score.toString(), skill.category])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill-analysis.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default" className="bg-green-600">Expert</Badge>;
    if (score >= 60) return <Badge variant="secondary">Intermediate</Badge>;
    return <Badge variant="outline">Beginner</Badge>;
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
      {skills.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Skill Analysis Results</CardTitle>
              <CardDescription>
                {skills.length} skills identified with confidence scores
              </CardDescription>
            </div>
            <Button onClick={exportData} variant="outline">
              <FaDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Confidence Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skills.map((skill, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{skill.skill}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{skill.category}</Badge>
                      </TableCell>
                      <TableCell>{skill.confidence_score}%</TableCell>
                      <TableCell>{getConfidenceBadge(skill.confidence_score)}</TableCell>
                      <TableCell>
                        <div className="w-full">
                          <Progress 
                            value={skill.confidence_score} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
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