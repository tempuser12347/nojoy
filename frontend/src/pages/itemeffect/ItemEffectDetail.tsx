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
import { renderObjectsToChips } from "../../common/render";

interface ItemEffect {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  category: string | null;
  skill: any[] | null;
}

export default function ItemEffectDetail({ data }: { data?: ItemEffect }) {
  const { id } = useParams<{ id: string }>();
  const [itemEffect, setItemEffect] = useState<ItemEffect | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItemEffect = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/itemeffects/${id}`);
        setItemEffect(response.data);
      } catch (err) {
        setError("Failed to load Item Effect details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchItemEffect();
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

  if (!itemEffect) {
    return <Typography sx={{ p: 3 }}>Item Effect not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {itemEffect.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={itemEffect.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="분류" value={itemEffect.category} />
            </Grid>
            {itemEffect.skill ?
              <Grid size={{ xs: 12 }}>
                <DetailItem
                  label="스킬"
                  value={renderObjectsToChips(itemEffect.skill, navigate)}
                />
              </Grid> : null
            }
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}