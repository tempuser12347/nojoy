import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import api from '../../api';

interface Ship {
  id: number;
  name: string;
  additional_name: string;
  description: string;
  type: string;
  size: string;
  category: string;
  lv_adventure: number;
  lv_trade: number;
  lv_battle: number;
  default_material: string;
  base_reinforcement: number;
  re_reinforcement: number;
  shipbuilding: number;
  dry_days: number;
  city_progress: string;
  city_invest: string;
  durability: number;
  vertical_sail: number;
  horizontal_sail: number;
  rowing_power: number;
  turning_performance: number;
  wave_resistance: number;
  armor: number;
  cabin_capacity: number;
  required_crew: number;
  cannon_chambers: number;
  warehouse_capacity: number;
  durability_plus: number;
  vertical_sail_plus: number;
  horizontal_sail_plus: number;
  rowing_power_plus: number;
  turning_performance_plus: number;
  wave_resistance_plus: number;
  armor_plus: number;
  cabin_capacity_plus: number;
  cannon_chambers_plus: number;
  warehouse_capacity_plus: number;
  auxiliary_sails: number;
  figurehead: number;
  crest: number;
  special_equipment: number;
  additional_armor: number;
  broadside_ports: number;
  bow_ports: number;
  stern_ports: number;
}

const DetailItem = ({ label, value }: { label: string; value: any }) => (
  <Box>
    <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
    <Typography variant="body1">{value || '-'}</Typography>
  </Box>
);

export default function ShipDetail() {
  const { id } = useParams<{ id: string }>();
  const [ship, setShip] = useState<Ship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShip = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/ships/${id}`);
        setShip(response.data);
      } catch (err) {
        setError('Failed to load ship details');
        console.error('Error fetching ship:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShip();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
  }

  if (!ship) {
    return <Typography sx={{ p: 3 }}>Ship not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{ship.name}</Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" paragraph>{ship.description}</Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' } }}>
            <DetailItem label="종류" value={ship.type} />
            <DetailItem label="크기" value={ship.size} />
            <DetailItem label="분류" value={ship.category} />
            <DetailItem label="모험 레벨" value={ship.lv_adventure} />
            <DetailItem label="교역 레벨" value={ship.lv_trade} />
            <DetailItem label="전투 레벨" value={ship.lv_battle} />
            <DetailItem label="기본 재질" value={ship.default_material} />
            <DetailItem label="기본 강화" value={ship.base_reinforcement} />
            <DetailItem label="재강화" value={ship.re_reinforcement} />
            <DetailItem label="조선" value={ship.shipbuilding} />
            <DetailItem label="건조일수" value={ship.dry_days} />
            <DetailItem label="도시진척도" value={ship.city_progress} />
            <DetailItem label="도시투자" value={ship.city_invest} />
            <DetailItem label="내구도" value={`${ship.durability} (+${ship.durability_plus})`} />
            <DetailItem label="세로돛" value={`${ship.vertical_sail} (+${ship.vertical_sail_plus})`} />
            <DetailItem label="가로돛" value={`${ship.horizontal_sail} (+${ship.horizontal_sail_plus})`} />
            <DetailItem label="선회" value={`${ship.turning_performance} (+${ship.turning_performance_plus})`} />
            <DetailItem label="내파" value={`${ship.wave_resistance} (+${ship.wave_resistance_plus})`} />
            <DetailItem label="장갑" value={`${ship.armor} (+${ship.armor_plus})`} />
            <DetailItem label="선실" value={`${ship.cabin_capacity} (+${ship.cabin_capacity_plus})`} />
            <DetailItem label="필요 선원" value={ship.required_crew} />
            <DetailItem label="포실" value={`${ship.cannon_chambers} (+${ship.cannon_chambers_plus})`} />
            <DetailItem label="창고" value={`${ship.warehouse_capacity} (+${ship.warehouse_capacity_plus})`} />
            <DetailItem label="보조돛" value={ship.auxiliary_sails} />
            <DetailItem label="선수상" value={ship.figurehead} />
            <DetailItem label="문장" value={ship.crest} />
            <DetailItem label="특수장비" value={ship.special_equipment} />
            <DetailItem label="추가장갑" value={ship.additional_armor} />
            <DetailItem label="선측포" value={ship.broadside_ports} />
            <DetailItem label="선수포" value={ship.bow_ports} />
            <DetailItem label="선미포" value={ship.stern_ports} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}