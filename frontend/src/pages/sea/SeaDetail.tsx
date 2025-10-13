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
import { renderObjectChip } from '../../common/render';

interface Sea {
  id: number;
  name: string;
  description: string;
  category: string;
  region: { id: number; name: string }[];
  boundary: { [key: string]: number };
  wave: number;
  seacurrent: number;
  max_speed_increase: string;
  gatherable: any; // This will be a JSON object
}

const GatherableTable: React.FC<{ data: any }> = ({ data }) => {
  const navigate = useNavigate();
  if (!data) return null;

  const allMethods = Object.entries(data).map(([method, items]) => {
    const ranks = (items as any[]).reduce((acc, item) => {
        const rank = item['랭크'];
        let rankGroup = acc.find(r => r.rank === rank);
        if (!rankGroup) {
            rankGroup = { rank: rank, rows: [] };
            acc.push(rankGroup);
        }
        rankGroup.rows.push(item);
        return acc;
    }, [] as { rank: number, rows: any[] }[]);

    // Sort ranks
    ranks.sort((a, b) => a.rank - b.rank);

    return { method, ranks };
  });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>방법</TableCell>
            <TableCell>랭크</TableCell>
            <TableCell>종류</TableCell>
            <TableCell>아이템</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allMethods.map((methodGroup, methodIndex) => {
            const methodRowSpan = methodGroup.ranks.reduce(
              (acc, rankGroup) => acc + rankGroup.rows.length,
              0
            );
            return methodGroup.ranks.map((rankGroup, rankIndex) => {
              const rankRowSpan = rankGroup.rows.length;
              return rankGroup.rows.map((row, rowIndex) => (
                <TableRow key={`${methodIndex}-${rankIndex}-${rowIndex}`}>
                  {rankIndex === 0 && rowIndex === 0 && (
                    <TableCell rowSpan={methodRowSpan}>
                      {methodGroup.method}
                    </TableCell>
                  )}
                  {rowIndex === 0 && (
                    <TableCell rowSpan={rankRowSpan}>
                      {rankGroup.rank === 0 ? "" : rankGroup.rank}
                    </TableCell>
                  )}
                  <TableCell>{row['종류']}</TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                    >
                      {row['아이템'].map((item: any) =>
                        renderObjectChip(item, navigate)
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ));
            });
          })}
        </TableBody>
      </Table>
    </TableContainer>
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
              <DetailItem label="최대 속도 증가" value={sea.max_speed_increase} />
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
          <GatherableTable data={sea.gatherable} />
        </Box>
      )}
    </Box>
  );
}
