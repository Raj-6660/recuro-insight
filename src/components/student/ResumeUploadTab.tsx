import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FaUpload, FaFilePdf } from 'react-icons/fa';

// Developer Configuration: Set your n8n webhook URL here
const WEBHOOK_URL = 'https://ghostyy.app.n8n.cloud/webhook/0cb6fa0e-6484-4892-a5eb-044073f34004';

const ResumeUploadTab = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a PDF resume to upload.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare multipart/form-data to send actual binary
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filename', selectedFile.name);
      formData.append('timestamp', new Date().toISOString());
      formData.append('action', 'resume_upload');

      // Send binary file to n8n webhook
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData, // important: sends as multipart/form-data automatically
      });

      toast({
        title: 'Resume uploaded successfully!',
        description: "Your resume has been sent for processing. We'll match you with suitable roles.",
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaFilePdf className="h-5 w-5" />
            Resume Matcher
          </CardTitle>
          <CardDescription>
            Upload your resume to get shortlisted for suitable roles today.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 space-y-4">
            <FaUpload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {selectedFile ? selectedFile.name : 'Choose a PDF file or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">PDF up to 10MB</p>
            </div>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="max-w-xs cursor-pointer"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="w-full bg-student-gradient"
          >
            {loading ? 'Uploading...' : 'Upload & Find Matches'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUploadTab;
