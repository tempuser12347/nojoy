import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';
import api from '../../api';
import DetailItem from '../../components/DetailItem';

interface Sea {
  id: number;
  name: string;
  description: string;
  category: string;
  region: { id: number; name: string }[];
  boundary: { [key: string]: number };
  wave: number;
  seacurrent: number;
  max_speed_incrase: string;
  gatherable: any; // This will be a JSON object
}

const GatherableItem: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;

  return (
    <Box>
      {Object.entries(data).map(([key, value]: [string, any]) => (
        <Box key={key} mb={2}>
          <Typography variant="h6">{key}</Typography>
          {value.map((item: any, index: number) => (
            <Card key={index} sx={{ mb: 1 }}>
              <CardContent>
                <Typography>랭크: {item['랭크']}</Typography>
                <Typography>종류: {item['종류']}</Typography>
                <Box>
                  <Typography>아이템:</Typography>
                  {item['아이템'].map((i: any) => (
                    <Typography key={i.id}>- {i.name}</Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ))}
    </Box>
  );
};


export default function SeaDetail() {
  const { id } = useParams<{ id: string }>();
  const [sea, setSea] = useState<Sea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSea = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/seas/${id}`);
        setSea(response.data);
      } catch (err) {
        setError('Failed to load sea details');
        console.error('Error fetching sea:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSea();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
  }

  if (!sea) {
    return <Typography sx={{ p: 3 }}>Sea not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{sea.name}</Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" paragraph>{sea.description}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="분류" value={sea.category} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="해역" value={sea.region?.map(r => r.name).join(', ')} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="파도" value={sea.wave} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="해류" value={sea.seacurrent} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="최대 속도 증가" value={sea.max_speed_incrase} />
            </Grid>
            {sea.boundary && (
              <Grid item xs={12}>
                <DetailItem label="경계" value={Object.entries(sea.boundary).map(([key, value]) => `${key}: ${value}`).join(', ')} />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      {sea.gatherable && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>채집 정보</Typography>
          <GatherableItem data={sea.gatherable} />
        </Box>
      )}
    </Box>
  );
}
