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

interface PortPermit {
  id: number;
  name: string;
  description: string;
  quests_select_one: { id: number; name: string }[];
  required: string;
  fame_per_nation: { [key: string]: number };
}

const QuestsTable: React.FC<{ data: { id: number; name: string }[] }> = ({ data }) => {
    const navigate = useNavigate();
    if (!data || data.length === 0) return null;
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>퀘스트</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((quest) => (
                        <TableRow key={quest.id}>
                            <TableCell>{renderObjectChip(quest, navigate)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const FameTable: React.FC<{ data: { [category: string]: { [nation: string]: number } } }> = ({ data }) => {
    if (!data) return null;

    // Extract all unique nation names for column headers
    const nationNames = Array.from(new Set(
        Object.values(data).flatMap(nationFames => Object.keys(nationFames))
    ));

    // Sort nation names alphabetically for consistent display
    nationNames.sort();

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell> {/* Empty cell for the category column */}
                        {nationNames.map(nation => (
                            <TableCell key={nation}>{nation}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(data).map(([category, nationFames]) => (
                        <TableRow key={category}>
                            <TableCell>{category}</TableCell>
                            {nationNames.map(nation => (
                                <TableCell key={nation}>
                                    {nationFames[nation] !== undefined ? nationFames[nation] : '-'}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};


export default function PortPermitDetail({ data }: { data?: PortPermit }) {
  const { id } = useParams<{ id: string }>();
  const [permit, setPermit] = useState<PortPermit | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermit = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/portpermits/${id}`);
        setPermit(response.data);
      } catch (err) {
        setError('Failed to load port permit details');
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
        fetchPermit();
    }
  }, [id, data]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
  }

  if (!permit) {
    return <Typography sx={{ p: 3 }}>Port permit not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{permit.name}</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <DetailItem label="설명" value={permit.description} />
            </Grid>
            <Grid item xs={12}>
                <DetailItem label="필요 조건" value={permit.required} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {permit.quests_select_one && permit.quests_select_one.length > 0 && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>퀘스트 (선택 1)</Typography>
          <QuestsTable data={permit.quests_select_one} />
        </Box>
      )}

      {permit.fame_per_nation && Object.keys(permit.fame_per_nation).length > 0 && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>국가별 명성</Typography>
          <FameTable data={permit.fame_per_nation} />
        </Box>
      )}
    </Box>
  );
}
