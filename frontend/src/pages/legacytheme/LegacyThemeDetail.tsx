import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import { renderObjectChip } from "../../common/render";

interface LegacyTheme {
  id: number;
  name: string;
  description: string | null;
  requirements: any[] | null;
}

export default function LegacyThemeDetail({ data }: { data?: LegacyTheme }) {
  const { id } = useParams<{ id: string }>();
  const [legacyTheme, setLegacyTheme] = useState<LegacyTheme | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLegacyTheme = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/legacythemes/${id}`);
        setLegacyTheme(response.data);
      } catch (err) {
        setError("Failed to load Legacy Theme details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchLegacyTheme();
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

  if (!legacyTheme) {
    return <Typography sx={{ p: 3 }}>Legacy Theme not found.</Typography>;
  }

  const renderRequirements = (requirements: any[]) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>구분</TableCell>
              <TableCell>내용</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requirements.map((req, index) => (
              <TableRow key={index}>
                <TableCell>{req.type}</TableCell>
                <TableCell>
                  {req.type === "선행 발견/퀘스트" && (
                    <Box>
                      {req.content.map((item: any, itemIndex: number) => (
                        <Typography key={itemIndex} variant="body2">
                          {renderObjectChip(item, navigate)}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={legacyTheme.description} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          요구 사항
        </Typography>
        {legacyTheme.requirements && renderRequirements(legacyTheme.requirements)}
      </Grid>
    </Grid>
  );
}