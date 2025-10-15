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

interface Skill {
  id: number;
  name: string;
  description: string | null;
  type: string | null;
  action_point: string | null;
  apply_range: string | null;
  acquire_cost: string | null;
  equip_cost: string | null;
  max_rank_adjustment: string | null;
  adjutant_position: string | null;
  refinement_effect:
    | { id: number; name: string }[]
    | { id: number; name: string }
    | null;
  acquire_requirement: { 종류: string; 내용: string }[] | null;
}

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const renderContentOfRequirement = (req: string | any[] | null) => {
    if (!req) return null;
    if (Array.isArray(req)) {
      return renderObjectsToChips(req, navigate);
    }
    return req;
  };

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const response = await api.get(`/api/skills/${id}`);
        setSkill(response.data);
      } catch (err) {
        setError("Failed to load skill details");
        console.error("Error fetching skill:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSkill();
    }
  }, [id]);

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

  if (!skill) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Skill not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {skill.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={skill.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="타입" value={skill.type} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="행동력" value={skill.action_point} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="적용 범위" value={skill.apply_range} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="습득 비용" value={skill.acquire_cost} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="장착 비용" value={skill.equip_cost} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem
                label="최대 랭크 조정"
                value={skill.max_rank_adjustment}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="부관 배치" value={skill.adjutant_position} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <DetailItem
                label="연성 효과"
                value={
                  skill.refinement_effect
                    ? renderObjectsToChips(
                        Array.isArray(skill.refinement_effect)
                          ? skill.refinement_effect
                          : [skill.refinement_effect],
                        navigate
                      )
                    : null
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {skill.acquire_requirement && skill.acquire_requirement.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            습득 조건
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>종류</TableCell>
                  <TableCell>내용</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {skill.acquire_requirement.map((req, index) => (
                  <TableRow key={index}>
                    <TableCell>{req.종류}</TableCell>
                    <TableCell>
                      {renderContentOfRequirement(req.내용)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
