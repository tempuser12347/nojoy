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
import { renderObjectChip } from "../../common/render";
import ObtainMethodTabs from "../../components/ObtainMethodTabs";

interface ShipMaterial {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  material_type: string | null;
  availability: string | null;
  durability: string | null;
  armor: string | null;
  cabin: string | null;
  base_ship_material: { id: number; name: string } | null;
  cargo: string | null;
  wave_resistance: string | null;
  maneuverability: string | null;
  rowing_power: string | null;
  features: string | null;
  vertical_sail: string | null;
  horizontal_sail: string | null;
  gunport: string | null;
  obtain_method: any[] | null;
}

export default function ShipMaterialDetail({ data }: { data?: ShipMaterial }) {
  const { id } = useParams<{ id: string }>();
  const [shipMaterial, setShipMaterial] = useState<ShipMaterial | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipMaterial = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/shipmaterials/${id}`);
        setShipMaterial(response.data);
      } catch (err) {
        setError("Failed to load Ship Material details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchShipMaterial();
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

  if (!shipMaterial) {
    return <Typography sx={{ p: 3 }}>Ship Material not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {shipMaterial.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={shipMaterial.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailItem label="종류" value={shipMaterial.material_type} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="가능" value={shipMaterial.availability} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="내구도" value={shipMaterial.durability} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="장갑" value={shipMaterial.armor} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="선실" value={shipMaterial.cabin} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="창고" value={shipMaterial.cargo} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="내파" value={shipMaterial.wave_resistance} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="선회" value={shipMaterial.maneuverability} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="노젓기" value={shipMaterial.rowing_power} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="세로돛" value={shipMaterial.vertical_sail} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="가로돛" value={shipMaterial.horizontal_sail} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <DetailItem label="포문" value={shipMaterial.gunport} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <DetailItem label="특징" value={shipMaterial.features} />
            </Grid>
            <Grid size={{ xs: 12 }} >
              <DetailItem
                label="기본 재료"
                value={
                  shipMaterial.base_ship_material ? renderObjectChip(shipMaterial.base_ship_material, navigate) : null
                }
              />
            </Grid>
            {shipMaterial.obtain_method && (

              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <DetailItem
                  label="획득방법"
                  value={<ObtainMethodTabs data={shipMaterial.obtain_method} />}
                />
              </Grid>
            )
            }

          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
