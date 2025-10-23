import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";

interface GradePerformance {
  id: number;
  name: string;
  description: string | null;
  ship_size: string | null;
  ship_type: string | null;
  grade: number | null;
  accumulated_stats: { [key: string]: number | null } | null;
}

const change_stat_key_to_korean = (key: string) => {
  if (key == 'durability') {
    return '내구도'
  }
  else if (key == 'vertical_sail') {
    return '세로돛'
  }
  else if (key == 'horizontal_sail') {
    return '가로돛'
  }
  else if (key == 'rowing_power') {
    return '조력'
  }
  else if (key == 'maneuverability') {
    return '선회'
  }
  else if (key == 'wave_resistance') {
    return '내파'
  }
  else if (key == 'armor') {
    return '장갑'
  }
  else if (key == 'cabin') {
    return '선실'
  }
  else if (key == 'gunport') {
    return '포문'
  }
  else if (key == 'cargo') {
    return '창고'
  }
  return key

}

export default function GradePerformanceDetail({ data }: { data?: GradePerformance }) {
  const { id } = useParams<{ id: string }>();
  const [gradePerformance, setGradePerformance] = useState<GradePerformance | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGradePerformance = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/gradeperformances/${id}`);
        setGradePerformance(response.data);
      } catch (err) {
        setError("Failed to load Grade Performance details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchGradePerformance();
    }
  }, [id, data]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 3 }}>
        {error}
      </Typography>
    );
  }

  if (!gradePerformance) {
    return <Typography sx={{ p: 3 }}>Grade Performance not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {gradePerformance.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={gradePerformance.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="선박 종류" value={gradePerformance.ship_type} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="선박 크기" value={gradePerformance.ship_size} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="등급" value={gradePerformance.grade} />
            </Grid>
          </Grid>

          {gradePerformance.accumulated_stats && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                누적 스탯
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(gradePerformance.accumulated_stats).map((key) => (
                        <TableCell key={key}>{change_stat_key_to_korean(key)}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {Object.values(gradePerformance.accumulated_stats).map((value, index) => (
                        <TableCell key={index}>{value !== null ? value : "-"}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
