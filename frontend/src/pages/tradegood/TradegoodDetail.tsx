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

interface Tradegood {
  id: number;
  name: string;
  description: string;
  culture: { id: number; name: string } | null;
  category: string;
  classification: string;
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
      <Typography variant="h6" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
        {value}
      </Typography>
    </Box>
  ) : null;

export default function TradegoodDetail({ data }: { data?: Tradegood }) {
  const { id } = useParams<{ id: string }>();
  const [tradegood, setTradegood] = useState<Tradegood | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTradegood = async () => {
      try {
        const response = await api.get(`/api/tradegoods/${id}`);
        setTradegood(response.data);
      } catch (err) {
        setError("Failed to load tradegood details");
        console.error("Error fetching tradegood:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTradegood();
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

  if (!tradegood) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Tradegood not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {tradegood.name}
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
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DetailItem label="설명" value={tradegood.description} />
            </Box>
            <DetailItem label="카테고리" value={tradegood.category} />
            <DetailItem label="분류" value={tradegood.classification} />
            <DetailItem label="문화권" value={tradegood.culture?.name} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
