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

const renderBooleanEmoji = (value: number) => {
  return value === 1 ? "✅" : "❌";
};

interface Nation {
  id: number;
  name: string;
  description: string;
  npc_nation: number;
  is_basic: number;
}

export default function NationDetail({ data }: { data?: Nation }) {
  const { id } = useParams<{ id: string }>();
  const [nation, setNation] = useState<Nation | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNation = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/nations/${id}`);
        setNation(response.data);
      } catch (err) {
        setError("Failed to load nation details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchNation();
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

  if (!nation) {
    return <Typography sx={{ p: 3 }}>Nation not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={nation.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="NPC 국가"
          value={renderBooleanEmoji(nation.npc_nation)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="기본 국가"
          value={renderBooleanEmoji(nation.is_basic)}
        />
      </Grid>
    </Grid>
  );
}
