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

interface ShipBaseMaterial {
  id: number;
  name: string;
  description: string | null;
  durability: string | null;
  vertical_sail: string | null;
  horizontal_sail: string | null;
  normal_build: number; // 1 for true, 0 for false
}

export default function ShipBaseMaterialDetail({ data }: { data?: ShipBaseMaterial }) {
  const { id } = useParams<{ id: string }>();
  const [shipBaseMaterial, setShipBaseMaterial] = useState<ShipBaseMaterial | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipBaseMaterial = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/shipbasematerials/${id}`);
        setShipBaseMaterial(response.data);
      } catch (err) {
        setError("Failed to load Ship Base Material details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchShipBaseMaterial();
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

  if (!shipBaseMaterial) {
    return <Typography sx={{ p: 3 }}>Ship Base Material not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {shipBaseMaterial.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={shipBaseMaterial.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm: 6, md: 4}}>
              <DetailItem label="내구도" value={shipBaseMaterial.durability} />
            </Grid>
            <Grid size={{xs:12, sm: 6, md: 4}} >
              <DetailItem label="세로돛" value={shipBaseMaterial.vertical_sail} />
            </Grid>
            <Grid size={{xs:12, sm: 6, md: 4}} >
              <DetailItem label="가로돛" value={shipBaseMaterial.horizontal_sail} />
            </Grid>
            <Grid size={{xs:12, sm: 6, md: 4}}>
              <DetailItem label="일반 건조" value={shipBaseMaterial.normal_build ? '✅' : '❌'} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
