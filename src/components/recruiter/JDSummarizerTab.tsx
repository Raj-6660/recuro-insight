import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Download } from 'lucide-react'; // Changed from react-icons
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Developer Configuration: Set your n8n webhook URL here
const WEBHOOK_URL = 'https://ghostyy.app.n8n.cloud/webhook/4f5f82f6-8b82-449d-a4b0-057638d8adfd';

const JDSummarizerTab = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaries, setSummaries] = useState<any[]>([]); // <-- ADDED state for results
  const { toast } = useToast();

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a Word document (.doc or .docx).',
          variant: 'destructive',
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setSummaries([]); // Clear previous results when a new file is selected
    }
  };

  // Handle file upload and analysis
  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a Word document to upload.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filename', selectedFile.name);
      formData.append('timestamp', new Date().toISOString());
      formData.append('action', 'jd_upload_and_analyze');

      // Send binary file to n8n webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }

      const result = await response.json();

      // --- FIX: normalize the response to always get summaries ---
      const summariesData = Array.isArray(result)
        ? result[0]?.summaries || []
        : result.summaries || [];

      if (!Array.isArray(summariesData)) {
        throw new Error("Invalid response format from webhook. Expected 'summaries' array.");
      }

      setSummaries(summariesData);
      toast({
        title: 'Analysis Complete!',
        description: `Successfully analyzed ${summariesData.length} resume(s).`,
      });

    } catch (error: any) {
      console.error('Error uploading/analyzing JD:', error);
      toast({
        title: 'Analysis failed',
        description: `Failed to get analysis. ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export summaries to CSV
  const exportData = () => {
    const headers = [
      "Date", "Resume", "First Name", "Last Name", "Email",
      "Strengths", "Weaknesses", "Risk Factor", "Reward Factor",
      "Overall Fit", "Justification"
    ];

    const csvRows = [
      headers.join(','), // Header row
      ...summaries.map(s => {
        const safeCSV = (field: any) => `"${String(field || '').replace(/"/g, '""')}"`;
        return [
          safeCSV(s.date),
          safeCSV(s.resume),
          safeCSV(s.first_name),
          safeCSV(s.last_name),
          safeCSV(s.email),
          safeCSV(s.strengths),
          safeCSV(s.weaknesses),
          safeCSV(s.risk_factor),
          safeCSV(s.reward_factor),
          safeCSV(s.overall_fit),
          safeCSV(s.justification)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jd-summary-analysis.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Description Uploader
          </CardTitle>
          <CardDescription>
            Upload a job description (Word document) to process and analyze resumes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Box */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {selectedFile ? selectedFile.name : 'Choose a Word document or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">Word documents (.doc, .docx) only</p>
            </div>
            <Input
              type="file"
              accept=".doc,.docx"
              onChange={handleFileSelect}
              className="max-w-xs cursor-pointer"
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleAnalyze}
            disabled={loading || !selectedFile}
            className="w-full bg-recruiter-gradient"
          >
            {loading ? 'Analyzing...' : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Analyze
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {summaries.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Candidate Analysis Results</CardTitle>
              <CardDescription>
                {summaries.length} resume{summaries.length > 1 ? 's' : ''} analyzed against the JD
              </CardDescription>
            </div>
            <Button onClick={exportData} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resume</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Overall Fit</TableHead>
                    <TableHead>Strengths</TableHead>
                    <TableHead>Weaknesses</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Justification</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((s, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {s.resume.startsWith('http') ? (
                          <a href={s.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Resume
                          </a>
                        ) : s.resume}
                      </TableCell>
                      <TableCell>{s.first_name} {s.last_name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell className="font-medium text-center">{s.overall_fit}</TableCell>
                      <TableCell>{s.strengths}</TableCell>
                      <TableCell>{s.weakenesses}</TableCell>
                      <TableCell>{s.risk_factor}</TableCell>
                      <TableCell>{s.reward_factor}</TableCell>
                      <TableCell>{s.justification}</TableCell>
                      <TableCell>{s.date}</TableCell>
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

export default JDSummarizerTab;
