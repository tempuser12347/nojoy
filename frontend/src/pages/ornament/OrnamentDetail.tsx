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

interface Ornament {
  id: number;
  name: string;
  description: string | null;
  acquisition: string | null;
  crafter: string | null;
  discovery_card: Array<{ id: number; name: string }> | null;
  installation_effect: Array<{ id: number, name: string, value: number }> | null;
  city: { id: number, name: string } | null;
  cost: { value: number; unit: string } | null;
}

export default function OrnamentDetail({ data }: { data?: Ornament }) {
  const { id } = useParams<{ id: string }>();
  const [ornament, setOrnament] = useState<Ornament | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrnament = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/ornaments/${id}`);
        setOrnament(response.data);
      } catch (err) {
        setError("Failed to load Ornament details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchOrnament();
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

  if (!ornament) {
    return <Typography sx={{ p: 3 }}>Ornament not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {ornament.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={ornament.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="획득" value={ornament.acquisition} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="제작자" value={ornament.crafter} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {ornament.city ?
                <DetailItem label="도시" value={renderObjectChip(ornament.city, navigate)} /> : null}
            </Grid>
            {ornament.cost && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem
                  label="비용"
                  value={`${ornament.cost.value.toLocaleString()} ${ornament.cost.unit}`}
                />
              </Grid>
            )}
            {ornament.discovery_card && ornament.discovery_card.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  발견물 카드
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>이름</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ornament.discovery_card.map((card, index) => (
                        <TableRow key={index}>
                          <TableCell>{renderObjectChip(card, navigate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
            {ornament.installation_effect && ornament.installation_effect.length > 0 && (
              <Grid size={{xs:12}}>
                <Typography variant="h6" gutterBottom>
                  설치 효과
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>유형</TableCell>
                        <TableCell>값</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ornament.installation_effect.map((effect, index) => (
                        <TableRow key={index}>
                          <TableCell>{renderObjectChip(effect, navigate)}</TableCell>
                          <TableCell>{`${effect.value > 0 ? "+" : ""}${effect.value}`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
