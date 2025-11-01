import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import api from "../../api";
import ObtainMethodTabs from "../../components/ObtainMethodTabs";
import DetailItem from "../../components/DetailItem";

interface Certificate {
  id: number;
  name: string;
  description: string;
  classification: string;
  obtain_method: any[] | null;
}

export default function CertificateDetail({ data }: { data?: Certificate }) {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(
    data || null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await api.get(`/api/certificates/${id}`);
        setCertificate(response.data);
      } catch (err) {
        setError("Failed to load certificate details");
        console.error("Error fetching certificate:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchCertificate();
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

  if (!certificate) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Certificate not found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="분류" value={certificate.classification} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={certificate.description} />
      </Grid>
      {certificate.obtain_method ? (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <DetailItem
            label="획득방법"
            value={<ObtainMethodTabs data={certificate.obtain_method} />}
          />
        </Grid>
      ) : null}
    </Grid>
  );
}
