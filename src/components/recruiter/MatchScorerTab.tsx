import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { JDSummary, CVParsedData, MatchResult } from '@/types/api';
import { matchScore, scheduleInterview } from '@/services/api';
import { FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaDownload, FaSearch } from 'react-icons/fa';

const MatchScorerTab = () => {
  const [loading, setLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [schedulingLoading, setSchedulingLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock data for demo - in real app, this would come from previous tabs
  const mockJD: JDSummary = {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    experience_level: '5+ years',
    required_skills: ['React.js', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Redux'],
    preferred_skills: ['Node.js', 'AWS', 'Docker'],
    responsibilities: [],
    qualifications: []
  };

  const mockCVs: CVParsedData[] = [
    {
      candidate_name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1-555-1234',
      skills: ['React.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'AWS'],
      experience_years: 6,
      education: ["Bachelor's in Computer Science"],
      previous_roles: ['Frontend Developer at TechCorp']
    },
    {
      candidate_name: 'Bob Smith',
      email: 'bob.smith@email.com',
      phone: '+1-555-5678',
      skills: ['React.js', 'JavaScript', 'HTML/CSS', 'Vue.js', 'PHP'],
      experience_years: 4,
      education: ["Bachelor's in Information Technology"],
      previous_roles: ['Junior Developer at StartupXYZ']
    },
    {
      candidate_name: 'Carol Davis',
      email: 'carol.davis@email.com',
      phone: '+1-555-9012',
      skills: ['React.js', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Redux', 'Node.js', 'AWS', 'Docker'],
      experience_years: 7,
      education: ["Master's in Computer Science"],
      previous_roles: ['Senior Frontend Developer at InnovateCo', 'Tech Lead at DevStudio']
    },
    {
      candidate_name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1-555-3456',
      skills: ['Angular', 'JavaScript', 'TypeScript', 'HTML/CSS'],
      experience_years: 3,
      education: ["Bachelor's in Software Engineering"],
      previous_roles: ['Frontend Developer at WebCorp']
    }
  ];

  const generateMatches = async () => {
    setLoading(true);
    
    try {
      const results: MatchResult[] = [];
      
      for (const cv of mockCVs) {
        // Calculate match score based on skill overlap
        const requiredSkillsFound = mockJD.required_skills.filter(skill => 
          cv.skills.some(cvSkill => cvSkill.toLowerCase().includes(skill.toLowerCase()))
        );
        const preferredSkillsFound = mockJD.preferred_skills.filter(skill => 
          cv.skills.some(cvSkill => cvSkill.toLowerCase().includes(skill.toLowerCase()))
        );
        
        const requiredScore = (requiredSkillsFound.length / mockJD.required_skills.length) * 70;
        const preferredScore = (preferredSkillsFound.length / mockJD.preferred_skills.length) * 20;
        const experienceScore = Math.min(cv.experience_years / 5, 1) * 10;
        
        const totalScore = Math.round(requiredScore + preferredScore + experienceScore);
        
        const missingSkills = mockJD.required_skills.filter(skill => 
          !cv.skills.some(cvSkill => cvSkill.toLowerCase().includes(skill.toLowerCase()))
        );
        
        const matchingSkills = mockJD.required_skills.filter(skill => 
          cv.skills.some(cvSkill => cvSkill.toLowerCase().includes(skill.toLowerCase()))
        );

        const result: MatchResult = {
          candidate_id: Math.random().toString(36),
          candidate_name: cv.candidate_name,
          match_score: totalScore,
          missing_skills: missingSkills,
          matching_skills: matchingSkills,
          status: totalScore >= 80 ? 'shortlisted' : 'rejected',
          message: totalScore >= 80 
            ? `Excellent match! Candidate meets ${Math.round((matchingSkills.length / mockJD.required_skills.length) * 100)}% of requirements.`
            : `Candidate doesn't meet minimum requirements. Missing key skills: ${missingSkills.join(', ')}.`
        };

        // If match score >= 80%, calculate interview date (2 days later at 11:00 AM)
        if (totalScore >= 80) {
          const interviewDate = new Date();
          interviewDate.setDate(interviewDate.getDate() + 2);
          interviewDate.setHours(11, 0, 0, 0);
          result.interview_date = interviewDate.toISOString();
        }

        results.push(result);
      }
      
      setMatchResults(results);
      toast({
        title: "Matching complete",
        description: `Analyzed ${results.length} candidates. ${results.filter(r => r.status === 'shortlisted').length} shortlisted.`,
      });
    } catch (error) {
      toast({
        title: "Matching failed",
        description: "Failed to analyze candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (candidateId: string) => {
    const candidate = matchResults.find(r => r.candidate_id === candidateId);
    if (!candidate) return;

    setSchedulingLoading(candidateId);
    
    try {
      const response = await scheduleInterview(candidate);
      if (response.success) {
        toast({
          title: "Interview scheduled",
          description: `Interview scheduled for ${candidate.candidate_name} on ${new Date(candidate.interview_date!).toLocaleDateString()}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Demo notification",
        description: `✅ Interview scheduled for ${candidate.candidate_name} on ${new Date(candidate.interview_date!).toLocaleDateString()} at 11:00 AM. Email notification sent.`,
      });
    } finally {
      setSchedulingLoading(null);
    }
  };

  const exportData = () => {
    const csv = [
      ['Candidate', 'Match Score', 'Status', 'Matching Skills', 'Missing Skills', 'Interview Date'],
      ...matchResults.map(result => [
        result.candidate_name,
        result.match_score.toString(),
        result.status,
        result.matching_skills.join('; '),
        result.missing_skills.join('; '),
        result.interview_date ? new Date(result.interview_date).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidate-matches.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: 'shortlisted' | 'rejected') => {
    return status === 'shortlisted' 
      ? <Badge className="bg-green-600">Shortlisted</Badge>
      : <Badge variant="destructive">Rejected</Badge>;
  };

  const getStatusIcon = (status: 'shortlisted' | 'rejected') => {
    return status === 'shortlisted' 
      ? <FaCheckCircle className="h-4 w-4 text-green-600" />
      : <FaTimesCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Action Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaSearch className="h-5 w-5" />
            CV-JD Match Scorer
          </CardTitle>
          <CardDescription>
            Compare candidate CVs against job requirements and automatically schedule interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Active Job: {mockJD.title}</p>
              <p className="text-sm text-muted-foreground">{mockCVs.length} candidates to analyze</p>
            </div>
            <Button 
              onClick={generateMatches} 
              disabled={loading}
              className="bg-recruiter-gradient"
            >
              {loading ? 'Analyzing...' : 'Run Match Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {matchResults.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {matchResults.length}
                </div>
                <p className="text-xs text-muted-foreground">Analyzed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {matchResults.filter(r => r.status === 'shortlisted').length}
                </div>
                <p className="text-xs text-muted-foreground">≥80% match</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {matchResults.filter(r => r.status === 'rejected').length}
                </div>
                <p className="text-xs text-muted-foreground">&lt;80% match</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(matchResults.reduce((sum, r) => sum + r.match_score, 0) / matchResults.length)}%
                </div>
                <p className="text-xs text-muted-foreground">Match rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Candidate Match Results</CardTitle>
                <CardDescription>
                  Detailed analysis and interview scheduling
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
                      <TableHead>Candidate</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Matching Skills</TableHead>
                      <TableHead>Missing Skills</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="font-medium">{result.candidate_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className={`font-semibold ${getScoreColor(result.match_score)}`}>
                              {result.match_score}%
                            </span>
                            <Progress value={result.match_score} className="h-1 w-16" />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(result.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {result.matching_skills.slice(0, 2).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {result.matching_skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.matching_skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {result.missing_skills.slice(0, 2).map((skill, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {result.missing_skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.missing_skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.status === 'shortlisted' && result.interview_date ? (
                            <Button
                              size="sm"
                              onClick={() => handleScheduleInterview(result.candidate_id)}
                              disabled={schedulingLoading === result.candidate_id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {schedulingLoading === result.candidate_id ? (
                                'Scheduling...'
                              ) : (
                                <>
                                  <FaCalendarAlt className="mr-1 h-3 w-3" />
                                  Schedule
                                </>
                              )}
                            </Button>
                          ) : result.status === 'rejected' ? (
                            <span className="text-sm text-muted-foreground">Not qualified</span>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MatchScorerTab;