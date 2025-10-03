import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import api from '../../api';

interface Shipwreck {
  id: number;
  name: string;
  explanation: string;
  difficulty: string;
  sea_area: string;
  destination: string;
  discovery_coordinates: string;
  skill: string;
  characteristics: string;
  discovery: string;
  consumables: string;
  trade_goods: string;
  equipment: string;
  recipebook: string;
  aux_sail: string;
  ship_material: string;
  cannon: string;
  special_equipment: string;
  additional_armor: string;
  figurehead: string;
  emblem: string;
  ship_decoration: string;
}

export default function ShipwreckDetail({ data }: { data?: Shipwreck }) {
  const { id } = useParams<{ id: string }>();
  const [shipwreck, setShipwreck] = useState<Shipwreck | null>(data || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    const fetchShipwreck = async () => {
      try {
        const response = await api.get(`/api/shipwrecks/${id}`);
        console.log(response.data);
        setShipwreck(response.data);
      } catch (err) {
        setError('Failed to load shipwreck details');
        console.error('Error fetching shipwreck:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchShipwreck();
    }
  }, [id, data]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!shipwreck) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{shipwreck.name}</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">난이도</Typography>
              <Typography variant="body1">{shipwreck.difficulty}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">해역</Typography>
              <Typography variant="body1">{shipwreck.sea_area}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">목적지</Typography>
              <Typography variant="body1">{shipwreck.destination}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">발견좌표</Typography>
              <Typography variant="body1">{shipwreck.discovery_coordinates}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">필요스킬</Typography>
              <Typography variant="body1">{shipwreck.skill}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography variant="subtitle1" color="text.secondary">설명</Typography>
              <Typography variant="body1">{shipwreck.explanation}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography variant="subtitle1" color="text.secondary">특징</Typography>
              <Typography variant="body1">{shipwreck.characteristics}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">발견물</Typography>
              <Typography variant="body1">{shipwreck.discovery}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">소비품</Typography>
              <Typography variant="body1">{shipwreck.consumables}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">교역품</Typography>
              <Typography variant="body1">{shipwreck.trade_goods}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">장비</Typography>
              <Typography variant="body1">{shipwreck.equipment}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">레시피북</Typography>
              <Typography variant="body1">{shipwreck.recipebook}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">보조돛</Typography>
              <Typography variant="body1">{shipwreck.aux_sail}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">선체재료</Typography>
              <Typography variant="body1">{shipwreck.ship_material}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">함포</Typography>
              <Typography variant="body1">{shipwreck.cannon}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">특수장비</Typography>
              <Typography variant="body1">{shipwreck.special_equipment}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">추가장갑</Typography>
              <Typography variant="body1">{shipwreck.additional_armor}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">장식상</Typography>
              <Typography variant="body1">{shipwreck.figurehead}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">문장</Typography>
              <Typography variant="body1">{shipwreck.emblem}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">선체장식</Typography>
              <Typography variant="body1">{shipwreck.ship_decoration}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}