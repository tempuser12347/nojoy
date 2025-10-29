import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import { renderObjectChip } from "../../common/render";

interface RelicPiece {
  id: number;
  name: string;
  description: string | null;
  theme: { id: number; name: string } | null;
  piece_rank: number;
  quest: { id: number; name: string } | null;
  associated_relic: { id: number; name: string } | null;
}

export default function RelicPieceDetail({
  data,
}: { data?: RelicPiece }) {
  const { id } = useParams<{ id: string }>();
  const [relicPiece, setRelicPiece] = useState<RelicPiece | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelicPiece = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/relicpieces/${id}`);
        setRelicPiece(response.data);
      } catch (err) {
        setError("Failed to load Relic Piece details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchRelicPiece();
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

  if (!relicPiece) {
    return <Typography sx={{ p: 3 }}>Relic Piece not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {relicPiece.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={relicPiece.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="피스 랭크" value={relicPiece.piece_rank} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem
                label="테마"
                value={relicPiece.theme ? renderObjectChip(relicPiece.theme, navigate) : null}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem
                label="퀘스트"
                value={relicPiece.quest ? renderObjectChip(relicPiece.quest, navigate) : null}
              />
            </Grid>
            <Grid item xs={12}>
              <DetailItem
                label="관련 렐릭"
                value={relicPiece.associated_relic ? renderObjectChip(relicPiece.associated_relic, navigate) : null}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}