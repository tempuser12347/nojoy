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

interface InstallationEffect {
  id: number;
  name: string;
  description: string | null;
  scope: string | null;
}

export default function InstallationEffectDetail({ data }: { data?: InstallationEffect }) {
  const { id } = useParams<{ id: string }>();
  const [installationEffect, setInstallationEffect] = useState<InstallationEffect | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstallationEffect = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/installationeffects/${id}`);
        setInstallationEffect(response.data);
      } catch (err) {
        setError("Failed to load Installation Effect details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchInstallationEffect();
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

  if (!installationEffect) {
    return <Typography sx={{ p: 3 }}>Installation Effect not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {installationEffect.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={installationEffect.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DetailItem label="범위" value={installationEffect.scope} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}