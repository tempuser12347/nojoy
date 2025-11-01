import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Grid
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import ObtainMethodTabs from "../../components/ObtainMethodTabs";

interface Crest {
  id: number;
  name: string;
  description: string | null;
  obtain_method: any[] | null;
}

export default function CrestDetail({ data }: { data?: Crest }) {
  const { id } = useParams<{ id: string }>();
  const [crest, setCrest] = useState<Crest | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrest = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/crests/${id}`);
        setCrest(response.data);
      } catch (err) {
        setError("Failed to load Crest details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchCrest();
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

  if (!crest) {
    return <Typography sx={{ p: 3 }}>Crest not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={crest.description} />
      </Grid>
      {crest.obtain_method ? (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <DetailItem
            label="획득 방법"
            value={<ObtainMethodTabs data={crest.obtain_method} />}
          />
        </Grid>
      ) : null}
    </Grid>
  );
}