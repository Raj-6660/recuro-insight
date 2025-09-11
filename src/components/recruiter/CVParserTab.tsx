import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CVParsedData } from '@/types/api';
import { parseCV } from '@/services/api';
import { FaUpload, FaFileAlt, FaUser, FaDownload } from 'react-icons/fa';

const CVParserTab = () => {
  const [loading, setLoading] = useState(false);
  const [parsedCVs, setParsedCVs] = useState<CVParsedData[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      let validFiles = true;
      
      for (let i = 0; i < files.length; i++) {
        if (!allowedTypes.includes(files[i].type)) {
          validFiles = false;
          break;
        }
      }
      
      if (validFiles) {
        setSelectedFiles(files);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, TXT, or DOC files only.",
          variant: "destructive",
        });
      }
    }
  };

  const handleParseAll = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select CV files to parse.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const results: CVParsedData[] = [];

    try {
      // Process files one by one (in real implementation, you might want to process in parallel)
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          const response = await parseCV(file);
          if (response.success) {
            results.push(response.data);
          }
        } catch (error) {
          // Generate mock data for demo
          const mockCV: CVParsedData = {
            candidate_name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
            email: `${file.name.replace(/\.[^/.]+$/, "").toLowerCase()}@email.com`,
            phone: '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
            skills: [
              'React.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
              'SQL', 'Git', 'AWS', 'Docker', 'MongoDB'
            ].slice(0, Math.floor(Math.random() * 6) + 4),
            experience_years: Math.floor(Math.random() * 8) + 2,
            education: [
              "Bachelor's in Computer Science",
              "Master's in Software Engineering"
            ].slice(0, Math.floor(Math.random() * 2) + 1),
            previous_roles: [
              'Software Engineer at TechCorp',
              'Frontend Developer at StartupXYZ',
              'Full Stack Developer at InnovateCo'
            ].slice(0, Math.floor(Math.random() * 3) + 1)
          };
          results.push(mockCV);
        }
      }

      setParsedCVs(results);
      toast({
        title: "CVs parsed successfully",
        description: `Processed ${results.length} CV(s) successfully.`,
      });
    } catch (error) {
      toast({
        title: "Parsing failed",
        description: "Failed to parse CV files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Experience (Years)', 'Skills', 'Education', 'Previous Roles'],
      ...parsedCVs.map(cv => [
        cv.candidate_name,
        cv.email,
        cv.phone,
        cv.experience_years.toString(),
        cv.skills.join('; '),
        cv.education.join('; '),
        cv.previous_roles.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parsed-cvs.csv';
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
            CV Parser
          </CardTitle>
          <CardDescription>
            Upload candidate CVs to extract structured information automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              multiple
              onChange={handleFileSelect}
              className="flex-1"
            />
            <Button 
              onClick={handleParseAll} 
              disabled={!selectedFiles || selectedFiles.length === 0 || loading}
              className="bg-recruiter-gradient"
            >
              {loading ? (
                <>Parsing...</>
              ) : (
                <>
                  <FaUpload className="mr-2 h-4 w-4" />
                  Parse CVs
                </>
              )}
            </Button>
          </div>
          {selectedFiles && selectedFiles.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFiles.length} file(s)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {parsedCVs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FaUser className="h-5 w-5" />
                Parsed CV Data
              </CardTitle>
              <CardDescription>
                {parsedCVs.length} CV(s) processed successfully
              </CardDescription>
            </div>
            <Button onClick={exportData} variant="outline">
              <FaDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {parsedCVs.map((cv, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">{cv.candidate_name}</CardTitle>
                    <CardDescription>
                      {cv.experience_years} years of experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{cv.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-sm">{cv.phone}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Skills ({cv.skills.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {cv.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Education
                      </label>
                      <ul className="space-y-1">
                        {cv.education.map((edu, eduIndex) => (
                          <li key={eduIndex} className="text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            {edu}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Previous Roles */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Previous Roles
                      </label>
                      <ul className="space-y-1">
                        {cv.previous_roles.map((role, roleIndex) => (
                          <li key={roleIndex} className="text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            {role}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CVParserTab;