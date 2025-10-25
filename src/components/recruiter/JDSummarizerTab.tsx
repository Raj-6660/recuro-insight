import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FaFileAlt, FaUpload } from 'react-icons/fa';

// Developer Configuration: Set your n8n webhook URL here
const WEBHOOK_URL = 'https://ghostr.app.n8n.cloud/webhook-test/4f5f82f6-8b82-449d-a4b0-057638d8adfd';

const JDSummarizerTab = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
        return;
      }
      setSelectedFile(file);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
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
      formData.append('action', 'jd_upload');

      // Send binary file to n8n webhook
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors', // ✅ ensures CORS doesn't block the request
        body: formData,
      });

      toast({
        title: 'JD uploaded successfully!',
        description: 'Your job description has been sent for processing.',
      });

      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading JD:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload job description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaFileAlt className="h-5 w-5" />
          Job Description Uploader
        </CardTitle>
        <CardDescription>
          Upload a job description (Word document) to process it.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Box */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 space-y-4">
          <FaUpload className="h-12 w-12 text-muted-foreground" />
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
          onClick={handleUpload}
          disabled={loading || !selectedFile}
          className="w-full bg-recruiter-gradient"
        >
          {loading ? 'Uploading...' : 'Upload JD'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JDSummarizerTab;

