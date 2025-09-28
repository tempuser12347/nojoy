import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import api from '../api';

interface Job {
  id: number;
  name: string;
  description: string;
  category: string;
  reference_letter: string;
  cost: number;
  preferred_skills: string;
  requirements: string;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  value ? <Box><Typography variant="h6" color="text.secondary">{label}</Typography><Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{value}</Typography></Box> : null
);

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Job not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{job.name}</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' } }}>
            <Box sx={{ gridColumn: '1 / -1' }}><DetailItem label="설명" value={job.description} /></Box>
            <DetailItem label="카테고리" value={job.category} />
            <DetailItem label="소개장" value={job.reference_letter} />
            <DetailItem label="비용" value={job.cost} />
            <DetailItem label="우대 스킬" value={job.preferred_skills} />
            <DetailItem label="요구 사항" value={job.requirements} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
