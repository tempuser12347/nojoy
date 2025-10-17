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
import { renderObjectsToChips, renderObjectChip } from "../../common/render";

interface Pet {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  apartment_rank: number | null;
  certificate: { id: number; name: string } | null;
  feed: { item: { id: number; name: string }; closeness: number }[] | null;
  skills: { skill: { id: number; name: string }; rank: number; closeness: number }[] | null;
}

export default function PetDetail({ data }: { data?: Pet }) {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/pets/${id}`);
        setPet(response.data);
      } catch (err) {
        setError("Failed to load Pet details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchPet();
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

  if (!pet) {
    return <Typography sx={{ p: 3 }}>Pet not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {pet.name}
      </Typography>
      <Card>
        <CardContent>
          <DetailItem label="설명" value={pet.description} />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}>
              <DetailItem label="아파트 랭크" value={pet.apartment_rank} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} component="div" sx={{ border: '1px solid #e0e0e0', p: 1 }}>
              <DetailItem
                label="증명서"
                value={pet.certificate ? renderObjectChip(pet.certificate, navigate) : null}
              />
            </Grid>
          </Grid>

          {pet.feed && pet.feed.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">
                먹이
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>아이템</TableCell>
                      <TableCell>친밀도</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pet.feed.map((f, index) => (
                      <TableRow key={index}>
                        <TableCell>{renderObjectChip(f.item, navigate)}</TableCell>
                        <TableCell>{f.closeness}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {pet.skills && pet.skills.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">
                스킬
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>스킬</TableCell>
                      <TableCell>랭크</TableCell>
                      <TableCell>친밀도</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pet.skills.map((s, index) => (
                      <TableRow key={index}>
                        <TableCell>{renderObjectChip(s.skill, navigate)}</TableCell>
                        <TableCell>{s.rank}</TableCell>
                        <TableCell>{s.closeness}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}