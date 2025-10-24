import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LearningResource } from '@/types/api';
import { getLearningRoadmap } from '@/services/api';
import { FaGraduationCap, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

// Developer Configuration: Set your n8n webhook URL here
const WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/learning-roadmap';

const LearningRoadmapTab = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<LearningResource[]>([]);
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

    try {
      // Send to n8n webhook
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: 'learning_roadmap',
          current_skills: skills,
          target_role: targetRole,
          timestamp: new Date().toISOString(),
        }),
      });

      // Mock data for demo (since no-cors doesn't return data)
      const mockResources: LearningResource[] = [
        {
          skill: 'Advanced React Patterns',
          resource: 'React Advanced Patterns Course',
          priority: 'High',
          type: 'Course',
          url: 'https://example.com/react-course'
        },
        {
          skill: 'State Management',
          resource: 'Redux Toolkit Mastery',
          priority: 'High',
          type: 'Course',
          url: 'https://example.com/redux-course'
        },
        {
          skill: 'Testing',
          resource: 'Jest & React Testing Library',
          priority: 'Medium',
          type: 'Course',
          url: 'https://example.com/testing-course'
        },
        {
          skill: 'Performance Optimization',
          resource: 'Web Performance Optimization',
          priority: 'Medium',
          type: 'Book',
          url: 'https://example.com/performance-book'
        },
        {
          skill: 'System Design',
          resource: 'Frontend System Design Certification',
          priority: 'High',
          type: 'Certification',
          url: 'https://example.com/system-design-cert'
        },
        {
          skill: 'GraphQL',
          resource: 'Build a GraphQL API Project',
          priority: 'Low',
          type: 'Project',
          url: 'https://example.com/graphql-project'
        },
        {
          skill: 'TypeScript Advanced',
          resource: 'TypeScript Deep Dive',
          priority: 'Medium',
          type: 'Book',
          url: 'https://example.com/typescript-book'
        },
        {
          skill: 'Next.js',
          resource: 'Next.js Production Applications',
          priority: 'High',
          type: 'Course',
          url: 'https://example.com/nextjs-course'
        }
      ];
      setResources(mockResources);
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
      ['Skill', 'Resource', 'Priority', 'Type', 'URL'],
      ...resources.map(resource => [
        resource.skill,
        resource.resource,
        resource.priority,
        resource.type,
        resource.url || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning-roadmap.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPriorityBadge = (priority: 'High' | 'Medium' | 'Low') => {
    const variants = {
      High: { className: "bg-red-600", text: "High Priority" },
      Medium: { className: "bg-yellow-600", text: "Medium Priority" },
      Low: { className: "bg-green-600", text: "Low Priority" }
    };
    const variant = variants[priority];
    return <Badge className={variant.className}>{variant.text}</Badge>;
  };

  const getTypeBadge = (type: 'Course' | 'Certification' | 'Project' | 'Book') => {
    const variants = {
      Course: "default",
      Certification: "secondary",
      Project: "outline",
      Book: "outline"
    } as const;
    return <Badge variant={variants[type]}>{type}</Badge>;
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
                placeholder="React, JavaScript, CSS, Git"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Role</label>
              <Input
                placeholder="Senior Frontend Developer"
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
      {resources.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Learning Roadmap</CardTitle>
              <CardDescription>
                {resources.length} recommended resources to reach your goal
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
                    <TableHead>Skill to Learn</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{resource.skill}</TableCell>
                      <TableCell>{resource.resource}</TableCell>
                      <TableCell>{getPriorityBadge(resource.priority)}</TableCell>
                      <TableCell>{getTypeBadge(resource.type)}</TableCell>
                      <TableCell>
                        {resource.url ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <FaExternalLinkAlt className="h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
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

export default LearningRoadmapTab;