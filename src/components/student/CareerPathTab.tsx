import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CareerPath } from '@/types/api';
import { getCareerPath } from '@/services/api';
import { FaSearch, FaDownload, FaRoad } from 'react-icons/fa';

const CareerPathTab = () => {
  const [loading, setLoading] = useState(false);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [skillsInput, setSkillsInput] = useState('');
  const [filteredPaths, setFilteredPaths] = useState<CareerPath[]>([]);
  const [filterRole, setFilterRole] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://ghostr.app.n8n.cloud/webhook-test/382240e3-b2de-49e1-a60e-be8010ba93a5');
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!skillsInput.trim()) {
      toast({
        title: "No skills provided",
        description: "Please enter your skills separated by commas.",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.trim()) {
      toast({
        title: "No webhook URL",
        description: "Please enter your n8n webhook URL.",
        variant: "destructive",
      });
      return;
    }

    const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
    setLoading(true);

    try {
      // Send to n8n webhook
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: 'career_path',
          skills: skills,
          timestamp: new Date().toISOString(),
        }),
      });

      // Mock data for demo (since no-cors doesn't return data)
      const mockPaths: CareerPath[] = [
        {
          role: 'Frontend Developer',
          required_skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
          match_percentage: 85,
          missing_skills: ['Vue.js'],
          industry: 'Technology'
        },
        {
          role: 'Full Stack Developer',
          required_skills: ['React', 'Node.js', 'JavaScript', 'SQL', 'TypeScript'],
          match_percentage: 78,
          missing_skills: ['MongoDB', 'Express.js'],
          industry: 'Technology'
        },
        {
          role: 'Data Scientist',
          required_skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas'],
          match_percentage: 72,
          missing_skills: ['R', 'Deep Learning', 'TensorFlow'],
          industry: 'Data Science'
        },
        {
          role: 'DevOps Engineer',
          required_skills: ['AWS', 'Docker', 'Kubernetes', 'Git', 'Linux'],
          match_percentage: 65,
          missing_skills: ['Docker', 'Kubernetes', 'Jenkins'],
          industry: 'Technology'
        },
        {
          role: 'Product Manager',
          required_skills: ['Project Management', 'Analytics', 'Communication', 'Strategy'],
          match_percentage: 60,
          missing_skills: ['Agile', 'Product Strategy', 'User Research'],
          industry: 'Product'
        }
      ];
      setCareerPaths(mockPaths);
      setFilteredPaths(mockPaths);
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

  useEffect(() => {
    if (filterRole.trim()) {
      setFilteredPaths(careerPaths.filter(path => 
        path.role.toLowerCase().includes(filterRole.toLowerCase()) ||
        path.industry.toLowerCase().includes(filterRole.toLowerCase())
      ));
    } else {
      setFilteredPaths(careerPaths);
    }
  }, [filterRole, careerPaths]);

  const exportData = () => {
    const csv = [
      ['Role', 'Industry', 'Match %', 'Required Skills', 'Missing Skills'],
      ...filteredPaths.map(path => [
        path.role,
        path.industry,
        path.match_percentage.toString(),
        path.required_skills.join('; '),
        path.missing_skills.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'career-paths.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-600">Excellent Match</Badge>;
    if (percentage >= 60) return <Badge variant="secondary">Good Match</Badge>;
    return <Badge variant="outline">Potential Match</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaRoad className="h-5 w-5" />
            Career Path Finder
          </CardTitle>
          <CardDescription>
            Enter your skills to discover matching career opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">n8n Webhook URL</label>
            <Input
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Input
              placeholder="Enter your skills (e.g., React, Python, SQL, Machine Learning)"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="bg-student-gradient"
            >
              {loading ? 'Analyzing...' : 'Find Paths'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {careerPaths.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recommended Career Paths</CardTitle>
              <CardDescription>
                {filteredPaths.length} career paths match your skills
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <FaSearch className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by role or industry"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-48"
                />
              </div>
              <Button onClick={exportData} variant="outline">
                <FaDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Match %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Required Skills</TableHead>
                    <TableHead>Missing Skills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPaths.map((path, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{path.role}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{path.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className={`font-semibold ${getMatchColor(path.match_percentage)}`}>
                            {path.match_percentage}%
                          </span>
                          <Progress value={path.match_percentage} className="h-1 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>{getMatchBadge(path.match_percentage)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {path.required_skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {path.required_skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{path.required_skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {path.missing_skills.slice(0, 2).map((skill, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {path.missing_skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{path.missing_skills.length - 2}
                            </Badge>
                          )}
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

export default CareerPathTab;