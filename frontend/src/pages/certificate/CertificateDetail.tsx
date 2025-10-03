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

interface Certificate {
  id: number;
  name: string;
  description: string;
  classification: string;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
      {value}
    </Typography>
  </Box>
);

export default function CertificateDetail({ data }: { data?: Certificate }) {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {certificate.name}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <DetailItem label="분류" value={certificate.classification} />
          <DetailItem label="설명" value={certificate.description} />
        </CardContent>
      </Card>
    </Box>
  );
}
