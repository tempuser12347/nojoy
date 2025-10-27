import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

interface TreasureHuntTheme {
  id: number;
  name: string;
  description: string | null;
  theme_rank: number;
  requirements: Array<{ type: string; content: string }> | null;
}

export default function TreasureHuntThemeDetail({
  data,
}: { data?: TreasureHuntTheme }) {
  const { id } = useParams<{ id: string }>();
  const [treasureHuntTheme, setTreasureHuntTheme] = useState<TreasureHuntTheme | null>(
    data || null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTreasureHuntTheme = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/treasurehuntthemes/${id}`);
        setTreasureHuntTheme(response.data);
      } catch (err) {
        setError("Failed to load Treasure Hunt Theme details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTreasureHuntTheme();
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

  if (!treasureHuntTheme) {
    return <Typography sx={{ p: 3 }}>Treasure Hunt Theme not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {treasureHuntTheme.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={treasureHuntTheme.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="테마 랭크" value={treasureHuntTheme.theme_rank} />
            </Grid>
            {treasureHuntTheme.requirements &&
              treasureHuntTheme.requirements.map((req, index) => (
                <Grid item xs={12} key={index}>
                  <DetailItem label={req.type} value={req.content} />
                </Grid>
              ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}