import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
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

interface Legacy {
  id: number;
  name: string;
  description: string | null;
  theme: { id: number; name: string } | null;
  destination: { id: number; name: string } | null;
  rewards: { sophia: number; items: any[] } | null;
  recommended_clues: any[] | null;
  requirements: any[] | null;
}

export default function LegacyDetail({ data }: { data?: Legacy }) {
  const { id } = useParams<{ id: string }>();
  const [legacy, setLegacy] = useState<Legacy | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLegacy = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/legacies/${id}`);
        setLegacy(response.data);
      } catch (err) {
        setError("Failed to load Legacy details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchLegacy();
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

  if (!legacy) {
    return <Typography sx={{ p: 3 }}>Legacy not found.</Typography>;
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

  const renderRewards = (rewards: { sophia: number; items: any[] }) => {
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
            {rewards.sophia && (
              <TableRow>
                <TableCell>소피아</TableCell>
                <TableCell>{rewards.sophia}</TableCell>
              </TableRow>
            )}
            {rewards.items && rewards.items.length > 0 && (
              <TableRow>
                <TableCell>아이템</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {rewards.items.map((item: any, itemIndex: number) => (
                      <Box key={itemIndex}>{renderObjectChip(item, navigate)} x{item.quantity}</Box>
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {legacy.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={legacy.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailItem
                label="테마"
                value={legacy.theme ? renderObjectChip(legacy.theme, navigate) : null}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailItem label="위치" value={legacy.destination ? renderObjectChip(legacy.destination, navigate) : null} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                요구 사항
              </Typography>
              {legacy.requirements && renderRequirements(legacy.requirements)}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                보상
              </Typography>
              {legacy.rewards && renderRewards(legacy.rewards)}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}