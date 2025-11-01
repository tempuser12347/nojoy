import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
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
import ObtainMethodTabs from "../../components/ObtainMethodTabs";

interface StuddingSail {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  durability: number | null;
  vertical_sail: number | null;
  horizontal_sail: number | null;
  maneuverability: number | null;
  features: string | null;
  obtain_method: any[] | null;
}

export default function StuddingSailDetail({ data }: { data?: StuddingSail }) {
  const { id } = useParams<{ id: string }>();
  const [studdingSail, setStuddingSail] = useState<StuddingSail | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStuddingSail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/studdingsails/${id}`);
        setStuddingSail(response.data);
      } catch (err) {
        setError("Failed to load StuddingSail details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchStuddingSail();
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

  if (!studdingSail) {
    return <Typography sx={{ p: 3 }}>StuddingSail not found.</Typography>;
  }

  const stats = {
    "내구도": studdingSail.durability,
    "세로돛": studdingSail.vertical_sail,
    "가로돛": studdingSail.horizontal_sail,
    "선회": studdingSail.maneuverability,
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={studdingSail.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="카테고리" value={studdingSail.category} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="특징" value={studdingSail.features} />
      </Grid>
      <Grid size={{ xs: 12 }}>
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
      </Grid>
      {studdingSail.obtain_method && (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <DetailItem
            label="획득방법"
            value={<ObtainMethodTabs data={studdingSail.obtain_method} />}
          />
        </Grid>
      )}
    </Grid>
  );
}
