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
import ObtainMethodTabs from "../../components/ObtainMethodTabs";

interface Tradegood {
  id: number;
  name: string;
  description: string;
  culture: { id: number; name: string } | null;
  category: string;
  classification: string;
  obtain_method: any[] | null;
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
          <Grid container spacing={2}>
            <Grid size={{xs: 12}}>
              <DetailItem label="설명" value={tradegood.description} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="카테고리" value={tradegood.category} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="분류" value={tradegood.classification} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="문화권" value={tradegood.culture?.name} />
            </Grid>
            {tradegood.obtain_method && (
              <Grid size={{xs: 12}}>
                <DetailItem
                  label="획득방법"
                  value={<ObtainMethodTabs data={tradegood.obtain_method} />}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
