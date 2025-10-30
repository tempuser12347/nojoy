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

interface DiscoveryCard {
  id: number;
  name: string;
}

interface DebateCombo {
  id: number;
  name: string;
  description: string | null;
  category_info: { category: string; bonus: string } | null;
  total_points: number;
  discovery_cards: DiscoveryCard[] | null;
}

export default function DebateComboDetail({
  data,
}: { data?: DebateCombo }) {
  const { id } = useParams<{ id: string }>();
  const [debateCombo, setDebateCombo] = useState<DebateCombo | null>(
    data || null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDebateCombo = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/debatecombos/${id}`);
        setDebateCombo(response.data);
      } catch (err) {
        setError("Failed to load Debate Combo details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchDebateCombo();
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

  if (!debateCombo) {
    return <Typography sx={{ p: 3 }}>Debate Combo not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {debateCombo.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={debateCombo.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm: 6}}>
              <DetailItem
                label="카테고리"
                value={debateCombo.category_info ? debateCombo.category_info.category : null}
              />
            </Grid>
            <Grid size={{xs:12, sm: 6}}>
              <DetailItem
                label="보너스"
                value={debateCombo.category_info ? debateCombo.category_info.bonus : null}
              />
            </Grid>
            <Grid size={{xs:12, sm: 6}}>
              <DetailItem label="총 포인트" value={debateCombo.total_points} />
            </Grid>
            {debateCombo.discovery_cards &&
              debateCombo.discovery_cards.length > 0 && (
                <Grid size={{xs:12}}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
                        {debateCombo.discovery_cards.map((card, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {renderObjectChip(card, navigate)}
                            </TableCell>
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