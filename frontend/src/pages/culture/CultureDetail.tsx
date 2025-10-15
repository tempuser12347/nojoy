import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";

interface Culture {
  id: number;
  name: string;
  description: string;
  category: string;
}

export default function CultureDetail() {
  const { id } = useParams<{ id: string }>();
  const [culture, setCulture] = useState<Culture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCulture = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/cultures/${id}`);
        setCulture(response.data);
      } catch (err) {
        setError("Failed to load culture details");
        console.error("Error fetching culture:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCulture();
  }, [id]);

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

  if (!culture) {
    return <Typography sx={{ p: 3 }}>Culture not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {culture.name}
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailItem label="분류" value={culture.category} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <DetailItem label="설명" value={culture.description} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
