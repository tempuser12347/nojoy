import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid
} from "@mui/material";
import { renderObjectChip } from "../../common/render";
import api from "../../api";

interface TreasureMap {
  id: number;
  name: string;
  description: string;
  required_skill: string;
  category: string;
  academic_field: string;
  library: string;
  destination: { id: number; name: string } | null;
  discovery: { id: number; name: string } | null;
  city_conditions: string;
  preceding: { id: number; name: string }[] | null;
  reward_dukat: string;
  reward_item: string;
  strategy: string;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) =>
  value ? (
    <Box>
      <Typography variant="subtitle1" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  ) : null;

export default function TreasureMapDetail({ data }: { data?: TreasureMap }) {
  const { id } = useParams<{ id: string }>();
  const [treasureMap, setTreasureMap] = useState<TreasureMap | null>(
    data || null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTreasureMap = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await api.get(`/api/treasuremaps/${id}`);
        console.log(response.data);
        setTreasureMap(response.data);
      } catch (err) {
        setError("Failed to load treasure map details");
        console.error("Error fetching treasure map:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTreasureMap();
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
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!treasureMap) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Treasure map not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {treasureMap.name}
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{xs:12}}>
              <DetailItem
                label="설명"
                value={
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                    {treasureMap.description}
                  </Typography>
                }
              />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="분류" value={treasureMap.category} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}} >
              <DetailItem label="필요 스킬" value={treasureMap.required_skill} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}} >
              <DetailItem label="학문" value={treasureMap.academic_field} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}} >
              <DetailItem label="서고" value={treasureMap.library} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}} >
              <DetailItem
                label="목적지"
                value={
                  treasureMap.destination
                    ? renderObjectChip(treasureMap.destination, navigate)
                    : null
                }
              />
            </Grid>
            {treasureMap.discovery ? (
            <Grid size={{xs: 12, sm: 6}} >
                <DetailItem
                  label="발견물"
                  value={
                    treasureMap.discovery
                      ? renderObjectChip(treasureMap.discovery, navigate)
                      : null
                  }
                />
              </Grid>
            ) : null}
            {treasureMap.city_conditions ? (
            <Grid size={{xs: 12, sm: 6}} >
                <DetailItem
                  label="도시 조건"
                  value={treasureMap.city_conditions}
                />
              </Grid>
            ) : null}
            {treasureMap.preceding ? (
            <Grid size={{xs: 12, sm: 6}} >
                <DetailItem
                  label="선행"
                  value={treasureMap.preceding?.map((x) =>
                    renderObjectChip(x, navigate)
                  )}
                />
              </Grid>
            ) : null}
            <Grid size={{xs: 12, sm: 6}} >
              <DetailItem label="보상 (두캇)" value={treasureMap.reward_dukat} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}} >
              <DetailItem label="보상 (아이템)" value={treasureMap.reward_item} />
            </Grid>
            {treasureMap.strategy ? 
            
            <Grid size={{xs:12}}>
              <DetailItem
                label="공략"
                value={
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                    {treasureMap.strategy}
                  </Typography>
                }
              />
            </Grid> : null
          }
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
