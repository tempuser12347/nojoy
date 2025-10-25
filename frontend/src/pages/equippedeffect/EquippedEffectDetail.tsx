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

interface EquippedEffect {
  id: number;
  name: string;
  description: string | null;
  scope: string | null;
}

export default function EquippedEffectDetail({ data }: { data?: EquippedEffect }) {
  const { id } = useParams<{ id: string }>();
  const [equippedEffect, setEquippedEffect] = useState<EquippedEffect | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquippedEffect = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/equippedeffects/${id}`);
        setEquippedEffect(response.data);
      } catch (err) {
        setError("Failed to load Equipped Effect details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchEquippedEffect();
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

  if (!equippedEffect) {
    return <Typography sx={{ p: 3 }}>Equipped Effect not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {equippedEffect.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={equippedEffect.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm: 6}}>
              <DetailItem label="범위" value={equippedEffect.scope} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}