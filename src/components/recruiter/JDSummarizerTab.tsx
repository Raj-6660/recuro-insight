import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { JDSummary } from '@/types/api';
import { summarizeJD } from '@/services/api';
import { FaUpload, FaFileAlt, FaBuilding } from 'react-icons/fa';

const JDSummarizerTab = () => {
  const [loading, setLoading] = useState(false);
  const [jdSummary, setJdSummary] = useState<JDSummary | null>(null);
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

  const handleSummarize = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a job description file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await summarizeJD(selectedFile);
      if (response.success) {
        setJdSummary(response.data);
        toast({
          title: "JD analyzed successfully",
          description: "Job description has been processed and summarized.",
        });
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      // Mock data for demo
      const mockSummary: JDSummary = {
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        experience_level: '5+ years',
        required_skills: [
          'React.js', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Redux',
          'Next.js', 'Jest', 'Git', 'REST APIs', 'GraphQL'
        ],
        preferred_skills: [
          'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Python',
          'PostgreSQL', 'MongoDB', 'Figma', 'Agile/Scrum'
        ],
        responsibilities: [
          'Develop and maintain complex web applications using React and TypeScript',
          'Collaborate with cross-functional teams to define, design, and ship new features',
          'Optimize applications for maximum speed and scalability',
          'Mentor junior developers and conduct code reviews',
          'Participate in technical decision-making and architecture discussions',
          'Write clean, maintainable, and well-documented code',
          'Implement responsive designs and ensure cross-browser compatibility'
        ],
        qualifications: [
          "Bachelor's degree in Computer Science or related field",
          '5+ years of experience in frontend development',
          'Strong proficiency in React.js and modern JavaScript',
          'Experience with state management libraries (Redux, Zustand)',
          'Knowledge of testing frameworks (Jest, React Testing Library)',
          'Familiarity with modern build tools and workflows',
          'Excellent problem-solving and communication skills'
        ]
      };
      setJdSummary(mockSummary);
      toast({
        title: "Demo data loaded",
        description: "Using sample job description analysis.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaFileAlt className="h-5 w-5" />
            Job Description Analyzer
          </CardTitle>
          <CardDescription>
            Upload a job description to extract requirements and generate a structured summary
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
              onClick={handleSummarize} 
              disabled={!selectedFile || loading}
              className="bg-recruiter-gradient"
            >
              {loading ? (
                <>Analyzing...</>
              ) : (
                <>
                  <FaUpload className="mr-2 h-4 w-4" />
                  Analyze JD
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
      {jdSummary && (
        <div className="space-y-6">
          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaBuilding className="h-5 w-5" />
                Job Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Position</label>
                  <p className="text-lg font-semibold">{jdSummary.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-lg font-semibold">{jdSummary.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Experience Level</label>
                  <p className="text-lg font-semibold">{jdSummary.experience_level}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Requirements */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
                <CardDescription>Must-have technical competencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {jdSummary.required_skills.map((skill, index) => (
                    <Badge key={index} className="bg-red-600">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferred Skills</CardTitle>
                <CardDescription>Nice-to-have additional skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {jdSummary.preferred_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Responsibilities and Qualifications */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Responsibilities</CardTitle>
                <CardDescription>Primary duties and expectations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jdSummary.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
                <CardDescription>Education and experience requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jdSummary.qualifications.map((qualification, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{qualification}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default JDSummarizerTab;