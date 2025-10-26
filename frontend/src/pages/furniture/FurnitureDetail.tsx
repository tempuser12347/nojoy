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

interface Furniture {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  category: string | null;
  installation_effect: {
    type: string;
    value: number;
  } | null;
}

export default function FurnitureDetail({ data }: { data?: Furniture }) {
  const { id } = useParams<{ id: string }>();
  const [furniture, setFurniture] = useState<Furniture | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFurniture = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/furnitures/${id}`);
        setFurniture(response.data);
      } catch (err) {
        setError("Failed to load Furniture details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchFurniture();
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

  if (!furniture) {
    return <Typography sx={{ p: 3 }}>Furniture not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {furniture.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={furniture.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="카테고리" value={furniture.category} />
            </Grid>
            {furniture.installation_effect && (
              <Grid size={{xs: 12, sm: 6}}>
                <DetailItem
                  label="설치 효과"
                  value={`${
                    furniture.installation_effect.type
                  } ${furniture.installation_effect.value > 0 ? "+" : ""}${
                    furniture.installation_effect.value
                  }`}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
