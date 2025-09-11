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

    const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
    setLoading(true);

    try {
      const response = await getCareerPath(skills);
      if (response.success) {
        setCareerPaths(response.data);
        setFilteredPaths(response.data);
        toast({
          title: "Career paths found",
          description: `Found ${response.data.length} potential career paths.`,
        });
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      // Mock data for demo
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
        title: "Demo data loaded",
        description: "Using sample career path recommendations.",
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