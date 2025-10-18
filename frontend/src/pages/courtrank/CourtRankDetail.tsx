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

interface CourtRank {
  id: number;
  name: string;
  level: number | null;
  ottoman: string | null;
  royal_fleet_rank: number | null;
  fame: number | null;
}

export default function CourtRankDetail({ data }: { data?: CourtRank }) {
  const { id } = useParams<{ id: string }>();
  const [courtRank, setCourtRank] = useState<CourtRank | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourtRank = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/courtranks/${id}`);
        setCourtRank(response.data);
      } catch (err) {
        setError("Failed to load Court Rank details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchCourtRank();
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

  if (!courtRank) {
    return <Typography sx={{ p: 3 }}>Court Rank not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {courtRank.name}
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="레벨" value={courtRank.level} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="오스만" value={courtRank.ottoman} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem
                label="왕실 함대 랭크"
                value={courtRank.royal_fleet_rank}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="명성" value={courtRank.fame} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
