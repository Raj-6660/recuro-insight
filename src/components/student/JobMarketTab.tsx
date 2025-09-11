import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { JobMarketInsight } from '@/types/api';
import { getJobMarket } from '@/services/api';
import { FaChartLine, FaDownload, FaSearch, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const JobMarketTab = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<JobMarketInsight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<JobMarketInsight[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadJobMarketData();
  }, []);

  useEffect(() => {
    if (roleFilter.trim()) {
      setFilteredInsights(insights.filter(insight => 
        insight.role.toLowerCase().includes(roleFilter.toLowerCase()) ||
        insight.location.toLowerCase().includes(roleFilter.toLowerCase())
      ));
    } else {
      setFilteredInsights(insights);
    }
  }, [roleFilter, insights]);

  const loadJobMarketData = async () => {
    setLoading(true);
    try {
      const response = await getJobMarket();
      if (response.success) {
        setInsights(response.data);
        setFilteredInsights(response.data);
        toast({
          title: "Market data loaded",
          description: `Found ${response.data.length} job market insights.`,
        });
      } else {
        throw new Error(response.error || 'Failed to load data');
      }
    } catch (error) {
      // Mock data for demo
      const mockInsights: JobMarketInsight[] = [
        {
          role: 'Frontend Developer',
          openings: 1250,
          salary_range: '$70K - $120K',
          growth_trend: 'Rising',
          location: 'Remote/Global'
        },
        {
          role: 'Full Stack Developer',
          openings: 980,
          salary_range: '$80K - $140K',
          growth_trend: 'Rising',
          location: 'Remote/Global'
        },
        {
          role: 'Data Scientist',
          openings: 750,
          salary_range: '$95K - $160K',
          growth_trend: 'Rising',
          location: 'San Francisco, CA'
        },
        {
          role: 'DevOps Engineer',
          openings: 650,
          salary_range: '$85K - $150K',
          growth_trend: 'Stable',
          location: 'Remote/Global'
        },
        {
          role: 'Product Manager',
          openings: 420,
          salary_range: '$100K - $180K',
          growth_trend: 'Stable',
          location: 'New York, NY'
        },
        {
          role: 'UI/UX Designer',
          openings: 380,
          salary_range: '$65K - $110K',
          growth_trend: 'Rising',
          location: 'Remote/Global'
        },
        {
          role: 'Mobile Developer',
          openings: 320,
          salary_range: '$75K - $130K',
          growth_trend: 'Stable',
          location: 'Remote/Global'
        },
        {
          role: 'QA Engineer',
          openings: 280,
          salary_range: '$60K - $100K',
          growth_trend: 'Declining',
          location: 'Austin, TX'
        },
        {
          role: 'Machine Learning Engineer',
          openings: 220,
          salary_range: '$110K - $190K',
          growth_trend: 'Rising',
          location: 'Seattle, WA'
        },
        {
          role: 'Cybersecurity Analyst',
          openings: 190,
          salary_range: '$80K - $140K',
          growth_trend: 'Rising',
          location: 'Washington, DC'
        }
      ];
      setInsights(mockInsights);
      setFilteredInsights(mockInsights);
      toast({
        title: "Demo data loaded",
        description: "Using sample job market insights.",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      ['Role', 'Openings', 'Salary Range', 'Growth Trend', 'Location'],
      ...filteredInsights.map(insight => [
        insight.role,
        insight.openings.toString(),
        insight.salary_range,
        insight.growth_trend,
        insight.location
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-market-insights.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: 'Rising' | 'Stable' | 'Declining') => {
    switch (trend) {
      case 'Rising':
        return <FaArrowUp className="h-4 w-4 text-green-600" />;
      case 'Declining':
        return <FaArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <FaMinus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTrendBadge = (trend: 'Rising' | 'Stable' | 'Declining') => {
    const variants = {
      Rising: { className: "bg-green-600", text: "Rising" },
      Stable: { className: "bg-yellow-600", text: "Stable" },
      Declining: { className: "bg-red-600", text: "Declining" }
    };
    const variant = variants[trend];
    return <Badge className={variant.className}>{variant.text}</Badge>;
  };

  const getOpeningsColor = (openings: number) => {
    if (openings >= 1000) return 'text-green-600 font-semibold';
    if (openings >= 500) return 'text-blue-600 font-medium';
    if (openings >= 200) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaChartLine className="h-5 w-5" />
            Job Market Insights
          </CardTitle>
          <CardDescription>
            Real-time job market data, salary ranges, and growth trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaSearch className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by role or location"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-64"
              />
            </div>
            <Button onClick={loadJobMarketData} disabled={loading} className="bg-student-gradient">
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Openings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {filteredInsights.reduce((sum, insight) => sum + insight.openings, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active job positions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rising Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredInsights.filter(insight => insight.growth_trend === 'Rising').length}
            </div>
            <p className="text-xs text-muted-foreground">Growing roles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remote Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredInsights.filter(insight => insight.location.includes('Remote')).length}
            </div>
            <p className="text-xs text-muted-foreground">Remote opportunities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredInsights.filter(insight => insight.openings >= 500).length}
            </div>
            <p className="text-xs text-muted-foreground">High-demand roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Market Analysis</CardTitle>
            <CardDescription>
              {filteredInsights.length} roles matching your criteria
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
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Openings</TableHead>
                  <TableHead>Salary Range</TableHead>
                  <TableHead>Growth Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInsights.map((insight, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{insight.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{insight.location}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={getOpeningsColor(insight.openings)}>
                        {insight.openings.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{insight.salary_range}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(insight.growth_trend)}
                        {getTrendBadge(insight.growth_trend)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobMarketTab;