import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';

interface Discovery {
  id: number;
  type: string;
  name: string;
  additional_name: string | null;
  name_key: string | null;
  description: string;
  category: string;
  difficulty: number;
  card_points: number;
  discovery_experience: number;
  card_acquisition_experience: number;
  report_reputation: number;
  discovery_method: string;
  discovery_location: any; // JSON type
  discovery_rank: string;
  additional_description: string | null;
  era: string | null;
  time_period: string | null;
  weather: string | null;
  coordinates: string | null;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  value ? <Box><Typography variant="h6" color="text.secondary">{label}</Typography><Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{value}</Typography></Box> : null
);

export default function DiscoveryDetail() {
  const { id } = useParams();
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscovery = async () => {
      try {
        setError(null);
        const response = await api.get(`/api/discoveries/${id}`);
        setDiscovery(response.data);
      } catch (error: any) {
        setError(error.response?.data?.detail || 'Failed to fetch discovery data');
        setDiscovery(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscovery();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!discovery) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Discovery not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{discovery.name}{discovery.additional_name && ` (${discovery.additional_name})`}</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <Box sx={{ gridColumn: '1 / -1' }}><DetailItem label="설명" value={discovery.description} /></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><DetailItem label="추가 설명" value={discovery.additional_description} /></Box>
            <DetailItem label="종류" value={discovery.type} />
            <DetailItem label="카테고리" value={discovery.category} />
            <DetailItem label="난이도" value={discovery.difficulty} />
            <DetailItem label="발견 방법" value={discovery.discovery_method} />
            <DetailItem label="발견 랭크" value={discovery.discovery_rank} />
            <DetailItem label="발견 경험치" value={discovery.discovery_experience} />
            <DetailItem label="카드 포인트" value={discovery.card_points} />
            <DetailItem label="보고 평판" value={discovery.report_reputation} />
            <DetailItem label="시대" value={discovery.era} />
            <DetailItem label="시간" value={discovery.time_period} />
            <DetailItem label="날씨" value={discovery.weather} />
            <DetailItem label="좌표" value={discovery.coordinates} />
            <DetailItem label="위치 상세" value={discovery.discovery_location } />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}