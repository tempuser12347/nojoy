import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import api from '../../api';
import DetailItem from '../../components/DetailItem';
import { renderObjectChip, renderObjectsToChips } from '../../common/render';

interface Ship {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  required_levels: { adventure: number; trade: number; battle: number } | null;
  base_material: { id: number; name: string } | null;
  upgrade_count: { total: number; base: number; rebuild: number } | null;
  build_info: { days: number; development?: string; investment?: number } | null;
  base_performance: {
    durability: number;
    vertical_sail: number;
    horizontal_sail: number;
    rowing_power: number;
    maneuverability: number;
    wave_resistance: number;
    armor: number;
  } | null;
  capacity: {
    cabin: number;
    required_crew: number;
    gunport: number;
    cargo: number;
  } | null;
  improvement_limit: {
    durability: number;
    vertical_sail: number;
    horizontal_sail: number;
    rowing_power: number;
    maneuverability: number;
    wave_resistance: number;
    armor: number;
    cabin: number;
    gunport: number;
    cargo: number;
  } | null;
  ship_parts: {
    studdingsail?: number;
    figurehead?: number;
    crest?: number;
    special_equipment?: number;
    extra_armor?: number;
    side_cannon?: number;
    bow_cannon?: number;
    stern_cannon?: number;
  } | null;
  ship_skills: {
    skill: { id: number; name: string };
    sail: string | null;
    gunport: string | null;
    material1: { id: number; name: string } | null;
    material2: { id: number; name: string } | null;
  }[] | null;
  ship_deco: { [key: string]: boolean } | null;
  special_build_cities: {
    hull: { id: number; name: string };
    rank: number;
    material: { id: number; name: string };
    region: string;
    city: { id: number; name: string };
  }[] | null;
  standard_build_cities: { id: number; name: string }[] | null;
}

export default function ShipDetail({ data }: { data?: Ship }) {
  const { id } = useParams<{ id: string }>();
  const [ship, setShip] = useState<Ship | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

    if (!data && id) {
      fetchShip();
    }
  }, [id, data]);

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
      <Typography variant="h4" gutterBottom>{ship.name} {ship.extraname && `(${ship.extraname})`}</Typography>
      <Card>
        <CardContent>
          <DetailItem label="설명" value={ship.description} />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}>
              <DetailItem
                label="필요 레벨"
                value={ship.required_levels ? `모험 Lv${ship.required_levels.adventure}, 교역 Lv${ship.required_levels.trade}, 전투 Lv${ship.required_levels.battle}` : '-'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}>
              <DetailItem
                label="기본 재질"
                value={ship.base_material ? renderObjectChip(ship.base_material, navigate) : '-'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}>
              <DetailItem
                label="강화 횟수"
                value={ship.upgrade_count ? `총 ${ship.upgrade_count.total} (기본 ${ship.upgrade_count.base}, 재건조 ${ship.upgrade_count.rebuild})` : '-'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}>
              <DetailItem
                label="건조 정보"
                value={ship.build_info ? `${ship.build_info.days}일${ship.build_info.development ? ', 개발 필요' : ''}${ship.build_info.investment ? `, 투자 ${ship.build_info.investment}` : ''}` : '-'}
              />
            </Grid>
          </Grid>

          {ship.base_performance && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">기본 성능</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="내구도" value={ship.base_performance.durability} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="세로돛" value={ship.base_performance.vertical_sail} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="가로돛" value={ship.base_performance.horizontal_sail} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="저항" value={ship.base_performance.rowing_power} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="선회" value={ship.base_performance.maneuverability} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="내파" value={ship.base_performance.wave_resistance} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="장갑" value={ship.base_performance.armor} /></Grid>
              </Grid>
            </Box>
          )}

          {ship.capacity && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">선박 용량</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="선실" value={ship.capacity.cabin} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="필요 선원" value={ship.capacity.required_crew} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="포실" value={ship.capacity.gunport} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="창고" value={ship.capacity.cargo} /></Grid>
              </Grid>
            </Box>
          )}

          {ship.improvement_limit && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">강화 한계</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="내구도" value={ship.improvement_limit.durability} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="세로돛" value={ship.improvement_limit.vertical_sail} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="가로돛" value={ship.improvement_limit.horizontal_sail} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="저항" value={ship.improvement_limit.rowing_power} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="선회" value={ship.improvement_limit.maneuverability} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="내파" value={ship.improvement_limit.wave_resistance} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="장갑" value={ship.improvement_limit.armor} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="선실" value={ship.improvement_limit.cabin} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="포실" value={ship.improvement_limit.gunport} /></Grid>
                <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="창고" value={ship.improvement_limit.cargo} /></Grid>
              </Grid>
            </Box>
          )}

          {ship.ship_parts && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">선박 부품</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {ship.ship_parts.studdingsail && <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="보조돛" value={ship.ship_parts.studdingsail} /></Grid>}
                {ship.ship_parts.figurehead && <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="선수상" value={ship.ship_parts.figurehead} /></Grid>}
                {ship.ship_parts.crest && <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="문장" value={ship.ship_parts.crest} /></Grid>}
                {ship.ship_parts.special_equipment && <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="특수장비" value={ship.ship_parts.special_equipment} /></Grid>}
                {ship.ship_parts.extra_armor && <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="추가장갑" value={ship.ship_parts.extra_armor} /></Grid>}
                {ship.ship_parts.side_cannon && <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="선측포" value={ship.ship_parts.side_cannon} /></Grid>}
                {ship.ship_parts.bow_cannon && <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="선수포" value={ship.ship_parts.bow_cannon} /></Grid>}
                {ship.ship_parts.stern_cannon && <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}><DetailItem label="선미포" value={ship.ship_parts.stern_cannon} /></Grid>}
              </Grid>
            </Box>
          )}

          {ship.ship_skills && ship.ship_skills.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">선박 스킬</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>스킬</TableCell>
                      <TableCell>돛</TableCell>
                      <TableCell>포문</TableCell>
                      <TableCell>재료 1</TableCell>
                      <TableCell>재료 2</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ship.ship_skills.map((s, index) => (
                      <TableRow key={index}>
                        <TableCell>{renderObjectChip(s.skill, navigate)}</TableCell>
                        <TableCell>{s.sail || '-'}</TableCell>
                        <TableCell>{s.gunport || '-'}</TableCell>
                        <TableCell>{s.material1 ? renderObjectChip(s.material1, navigate) : '-'}</TableCell>
                        <TableCell>{s.material2 ? renderObjectChip(s.material2, navigate) : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {ship.ship_deco && Object.keys(ship.ship_deco).length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">선박 장식</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {Object.entries(ship.ship_deco).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }} key={key}>
                    <DetailItem label={key} value={value ? '✅' : '❌'} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {ship.special_build_cities && ship.special_build_cities.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">특수 건조 도시</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>선체</TableCell>
                      <TableCell>랭크</TableCell>
                      <TableCell>재료</TableCell>
                      <TableCell>지역</TableCell>
                      <TableCell>도시</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ship.special_build_cities.map((sbc, index) => (
                      <TableRow key={index}>
                        <TableCell>{renderObjectChip(sbc.hull, navigate)}</TableCell>
                        <TableCell>{sbc.rank}</TableCell>
                        <TableCell>{renderObjectChip(sbc.material, navigate)}</TableCell>
                        <TableCell>{sbc.region}</TableCell>
                        <TableCell>{renderObjectChip(sbc.city, navigate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {ship.standard_build_cities && ship.standard_build_cities.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">일반 건조 도시</Typography>
              <DetailItem
                label="도시"
                value={renderObjectsToChips(ship.standard_build_cities, navigate)}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}