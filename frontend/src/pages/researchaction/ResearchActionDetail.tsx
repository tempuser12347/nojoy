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

interface ResearchAction {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
}

export default function ResearchActionDetail({
  data,
}: {
  data?: ResearchAction;
}) {
  const { id } = useParams<{ id: string }>();
  const [researchAction, setResearchAction] = useState<ResearchAction | null>(
    data || null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResearchAction = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/researchactions/${id}`);
        setResearchAction(response.data);
      } catch (err) {
        setError("Failed to load Research Action details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchResearchAction();
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

  if (!researchAction) {
    return <Typography sx={{ p: 3 }}>Research Action not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={researchAction.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="카테고리" value={researchAction.category} />
      </Grid>
    </Grid>
  );
}
