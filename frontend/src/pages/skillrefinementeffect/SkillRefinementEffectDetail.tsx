import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from '@mui/material';
import api from '../../api';
import DetailItem from '../../components/DetailItem';

interface SkillRefinementEffect {
  id: number;
  name: string;
  description: string | null;
  action_power: string | null;
}

export default function SkillRefinementEffectDetail({ data }: { data?: SkillRefinementEffect }) {
  const { id } = useParams<{ id: string }>();
  const [skillRefinementEffect, setSkillRefinementEffect] = useState<SkillRefinementEffect | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkillRefinementEffect = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/skillrefinementeffects/${id}`);
        setSkillRefinementEffect(response.data);
      } catch (err) {
        setError('Failed to load Skill Refinement Effect details');
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
        fetchSkillRefinementEffect();
    }
  }, [id, data]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
  }

  if (!skillRefinementEffect) {
    return <Typography sx={{ p: 3 }}>Skill Refinement Effect not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{skillRefinementEffect.name}</Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={skillRefinementEffect.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="행동력" value={skillRefinementEffect.action_power} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
