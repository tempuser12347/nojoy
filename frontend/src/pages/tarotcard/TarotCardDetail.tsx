import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";

interface TarotCard {
  id: number;
  name: string;
  description: string | null;
  effect: string | null;
  summary: string | null;
}

export default function TarotCardDetail({ data }: { data?: TarotCard }) {
  const { id } = useParams<{ id: string }>();
  const [tarotCard, setTarotCard] = useState<TarotCard | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTarotCard = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/tarotcards/${id}`);
        setTarotCard(response.data);
      } catch (err) {
        setError("Failed to load Tarot Card details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTarotCard();
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

  if (!tarotCard) {
    return <Typography sx={{ p: 3 }}>Tarot Card not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={tarotCard.description} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <DetailItem label="효과" value={tarotCard.effect} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <DetailItem label="요약" value={tarotCard.summary} />
      </Grid>
    </Grid>
  );
}
