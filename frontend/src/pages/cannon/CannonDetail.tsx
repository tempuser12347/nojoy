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

interface Cannon {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  shell_type: string | null;
  durability: number | null;
  penetration: number | null;
  shoot_range: number | null;
  shell_speed: number | null;
  blast_radius: number | null;
  reload_speed: number | null;
}

export default function CannonDetail({ data }: { data?: Cannon }) {
  const { id } = useParams<{ id: string }>();
  const [cannon, setCannon] = useState<Cannon | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCannon = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/cannons/${id}`);
        setCannon(response.data);
      } catch (err) {
        setError("Failed to load Cannon details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchCannon();
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

  if (!cannon) {
    return <Typography sx={{ p: 3 }}>Cannon not found.</Typography>;
  }

  const stats = {
    "내구도": cannon.durability,
    "관통력": cannon.penetration,
    "사정거리": cannon.shoot_range,
    "탄속": cannon.shell_speed,
    "폭발 범위": cannon.blast_radius,
    "장전 속도": cannon.reload_speed,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {cannon.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={cannon.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailItem label="카테고리" value={cannon.category} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailItem label="포탄 종류" value={cannon.shell_type} />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              성능
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(stats).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {Object.values(stats).map((value, index) => (
                      <TableCell key={index}>{value !== null ? value : "-"}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
