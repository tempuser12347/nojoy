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

interface RelicPiece {
  rank: number;
  relic_piece: { id: number; name: string };
}

interface Relic {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  theme: {id: number, name: string} | null;
  relic_pieces: RelicPiece[] | null;
  adventure_log: string | null;
}

export default function RelicDetail({ data }: { data?: Relic }) {
  const { id } = useParams<{ id: string }>();
  const [relic, setRelic] = useState<Relic | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelic = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/relics/${id}`);
        setRelic(response.data);
      } catch (err) {
        setError("Failed to load Relic details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchRelic();
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

  if (!relic) {
    return <Typography sx={{ p: 3 }}>Relic not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {relic.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={relic.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="테마" value={relic.theme ? renderObjectChip(relic.theme, navigate) : null} />
            </Grid>
            {relic.relic_pieces && relic.relic_pieces.length > 0 && (
              <Grid size={{xs: 12}}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  렐릭 피스
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>랭크</TableCell>
                        <TableCell>렐릭 피스</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {relic.relic_pieces.map((rp, index) => (
                        <TableRow key={index}>
                          <TableCell>{rp.rank}</TableCell>
                          <TableCell>
                            {renderObjectChip(rp.relic_piece, navigate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
            <Grid item xs={12}>
              <DetailItem label="모험담" value={relic.adventure_log} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}