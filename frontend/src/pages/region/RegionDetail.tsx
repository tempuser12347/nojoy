
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";

interface Region {
  id: number;
  name: string;
}

export default function RegionDetail({ data }: { data?: Region }) {
  const { id } = useParams<{ id: string }>();
  const [region, setRegion] = useState<Region | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const response = await api.get(`/api/region/${id}`);
        setRegion(response.data);
      } catch (err) {
        setError("Failed to load region details");
        console.error("Error fetching region:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchRegion();
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

  if (!region) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Region not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {region.name}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
            }}
          >
            {/* <DetailItem label="ID" value={region.id} /> */}
            <DetailItem label="이름" value={region.name} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
