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
import { renderObjectsToChips } from "../../common/render";

interface Aide {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  job: string | null;
  nationality: string | null;
  gender: string | null;
  hiring_city: { id: number; name: string }[] | null;
  max_required_levels: { type: string; level: number }[] | null;
  max_required_traits: { name: string; value: number }[] | null;
  skills: { id: number; name: string; category: string; adventure_level: number; trade_level: number; battle_level: number; trait: string | null }[] | null;
  rescue_needed: number;
  rescue_area: string | null;
}

export default function AideDetail({ data }: { data?: Aide }) {
  const { id } = useParams<{ id: string }>();
  const [aide, setAide] = useState<Aide | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAide = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/aides/${id}`);
        setAide(response.data);
      } catch (err) {
        setError("Failed to load Aide details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchAide();
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

  if (!aide) {
    return <Typography sx={{ p: 3 }}>Aide not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {aide.name}
      </Typography>
      <Card>
        <CardContent>
          <DetailItem label="설명" value={aide.description} />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="카테고리" value={aide.category} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="직업" value={aide.job} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="국적" value={aide.nationality} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="성별" value={aide.gender} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem
                label="고용 도시"
                value={
                  aide.hiring_city
                    ? renderObjectsToChips(aide.hiring_city, navigate)
                    : null
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem
                label="구조 필요"
                value={aide.rescue_needed === 1 ? "Yes" : "No"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailItem label="구조 지역" value={aide.rescue_area} />
            </Grid>
          </Grid>

          {aide.max_required_levels && aide.max_required_levels.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">
                최대 필요 레벨
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>유형</TableCell>
                      <TableCell>레벨</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {aide.max_required_levels.map((level, index) => (
                      <TableRow key={index}>
                        <TableCell>{level.type}</TableCell>
                        <TableCell>{level.level}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {aide.max_required_traits && aide.max_required_traits.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">
                최대 필요 특성
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>특성</TableCell>
                      <TableCell>값</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {aide.max_required_traits.map((trait, index) => (
                      <TableRow key={index}>
                        <TableCell>{trait.name}</TableCell>
                        <TableCell>{trait.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {aide.skills && aide.skills.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="text.secondary">
                스킬
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>카테고리</TableCell>
                      <TableCell>이름</TableCell>
                      <TableCell>모험 레벨</TableCell>
                      <TableCell>교역 레벨</TableCell>
                      <TableCell>전투 레벨</TableCell>
                      <TableCell>특성</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {aide.skills.map((skill, index) => (
                      <TableRow key={index}>
                        <TableCell>{skill.category}</TableCell>
                        <TableCell>{skill.name}</TableCell>
                        <TableCell>{skill.adventure_level}</TableCell>
                        <TableCell>{skill.trade_level}</TableCell>
                        <TableCell>{skill.battle_level}</TableCell>
                        <TableCell>{skill.trait}</TableCell>
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