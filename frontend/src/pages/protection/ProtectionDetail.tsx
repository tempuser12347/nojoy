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

interface Protection {
  id: number;
  name: string;
  description: string | null;
  effect: string | null;
}

export default function ProtectionDetail({ data }: { data?: Protection }) {
  const { id } = useParams<{ id: string }>();
  const [protection, setProtection] = useState<Protection | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProtection = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/protections/${id}`);
        setProtection(response.data);
      } catch (err) {
        setError("Failed to load Protection details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchProtection();
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

  if (!protection) {
    return <Typography sx={{ p: 3 }}>Protection not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {protection.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={protection.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs:12}}>
              <DetailItem label="효과" value={protection.effect} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}