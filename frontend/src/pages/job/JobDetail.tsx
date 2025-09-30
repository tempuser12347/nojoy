import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import api from '../../api';
import { renderObjectsToChips } from '../../common/render';

interface Job {
  id: number;
  name: string;
  description: string;
  category: string;
  reference_letter: {id: number, name: string} | null;
  cost: number | null;
  preferred_skills: {id: number, name: string}[] | null;
  requirements: any;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  value ? <Box><Typography variant="h6" color="text.secondary">{label}</Typography><Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{value}</Typography></Box> : null
);

const RequirementsTable = ({ requirements }: { requirements: any }) => {
  if (!requirements || typeof requirements !== 'object' || Object.keys(requirements).length === 0) {
    return null;
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="requirements table">
        <TableBody>
          {Object.entries(requirements).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell component="th" scope="row">
                {key}
              </TableCell>
              <TableCell>{typeof value === 'string' ? value : JSON.stringify(value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        console.log('Job detail response:', response.data);
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
            <DetailItem label="추천장" value={job.reference_letter?.name || null} />
            <DetailItem label="비용" value={job.cost} />
            <DetailItem label="우대 스킬" value={renderObjectsToChips(job.preferred_skills)} />
            {job.requirements && Object.keys(job.requirements).length > 0 &&
              <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="h6" color="text.secondary">요구 사항</Typography>
                  <RequirementsTable requirements={job.requirements} />
              </Box>
            }
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
