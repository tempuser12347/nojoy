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

interface MemorialAlbumItem {
  item: { id: number; name: string };
  explanation: string;
}

interface MemorialAlbum {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  reward_npc: { id: number; name: string } | null;
  reward_item: { id: number; name: string } | null;
  items: MemorialAlbumItem[] | null;
}

export default function MemorialAlbumDetail({
  data,
}: { data?: MemorialAlbum }) {
  const { id } = useParams<{ id: string }>();
  const [memorialAlbum, setMemorialAlbum] = useState<MemorialAlbum | null>(
    data || null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemorialAlbum = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/memorialalbums/${id}`);
        setMemorialAlbum(response.data);
      } catch (err) {
        setError("Failed to load Memorial Album details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchMemorialAlbum();
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

  if (!memorialAlbum) {
    return <Typography sx={{ p: 3 }}>Memorial Album not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {memorialAlbum.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={memorialAlbum.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="카테고리" value={memorialAlbum.category} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}} >
              <DetailItem
                label="보상 NPC"
                value={memorialAlbum.reward_npc ? renderObjectChip(memorialAlbum.reward_npc, navigate) : null}
              />
            </Grid>
            <Grid size={{xs: 12, sm: 6}} >
              <DetailItem
                label="보상 아이템"
                value={memorialAlbum.reward_item ? renderObjectChip(memorialAlbum.reward_item, navigate) : null}
              />
            </Grid>
            {memorialAlbum.items && memorialAlbum.items.length > 0 && (
              <Grid size={{xs: 12}}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  아이템 목록
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>아이템</TableCell>
                        <TableCell>설명</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {memorialAlbum.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {renderObjectChip(item.item, navigate)}
                          </TableCell>
                          <TableCell>{item.explanation}</TableCell>
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