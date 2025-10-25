import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FaSearch } from 'react-icons/fa';

const MatchScorerTab = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ✅ Replace this with your actual n8n webhook URL
  const WEBHOOK_URL = 'https://ghostr.app.n8n.cloud/webhook-test/trigger-cv-jd-matcher';

  const handleTrigger = async () => {
    setLoading(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_cv_jd_match',
          source: 'frontend',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Analysis started',
          description: 'The backend has started processing the CV-JD match. Results will be displayed soon.',
        });
      } else {
        toast({
          title: 'Webhook error',
          description: 'Failed to trigger the backend workflow. Please check the webhook URL or connection.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast({
        title: 'Network error',
        description: 'Unable to connect to the backend workflow. Please try again later.',
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
            <FaSearch className="h-5 w-5" />
            CV-JD Match Scorer
          </CardTitle>
          <CardDescription>
            Triggers your n8n backend to analyze resumes and job descriptions already stored there.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Click below to start the analysis. Results will be sent automatically from the backend.
            </p>
            <Button 
              onClick={handleTrigger} 
              disabled={loading}
              className="bg-recruiter-gradient"
            >
              {loading ? 'Triggering...' : 'Run Match Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchScorerTab;
