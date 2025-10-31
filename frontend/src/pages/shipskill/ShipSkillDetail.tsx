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
import { renderObjectsToChips } from "../../common/render";

interface ShipSkill {
  id: number;
  name: string;
  description: string;
  action_points: string;
  apply_range: string;
  required_skill: { id: number; name: string; rank: number }[];
  dedicated_skill: {
    "조선 랭크": string;
    "전용함 건조증": string;
    "재료": { id: number; name: string; quantity: number }[];
    "제외 선박": string;
  }[];
}

export default function ShipSkillDetail({ data }: { data?: ShipSkill }) {
  const { id } = useParams<{ id: string }>();
  const [shipSkill, setShipSkill] = useState<ShipSkill | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipSkill = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/shipskills/${id}`);
        setShipSkill(response.data);
      } catch (err) {
        setError("Failed to load Ship Skill details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchShipSkill();
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

  if (!shipSkill) {
    return <Typography sx={{ p: 3 }}>Ship Skill not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={shipSkill.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="행동력" value={shipSkill.action_points} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="적용범위" value={shipSkill.apply_range} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem
          label="필요스킬"
          value={
            shipSkill.required_skill
              ? renderObjectsToChips(
                  shipSkill.required_skill.map((s) => ({
                    ...s,
                    name: `${s.name} ${s.rank}`,
                  })),
                  navigate
                )
              : null
          }
        />
      </Grid>

      {shipSkill.dedicated_skill && shipSkill.dedicated_skill.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <Typography variant="h6" color="text.secondary">
            전용함 스킬 부여
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>조선 랭크</TableCell>
                  <TableCell>전용함 건조증</TableCell>
                  <TableCell>재료</TableCell>
                  <TableCell>제외 선박</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipSkill.dedicated_skill.map((skill, index) => (
                  <TableRow key={index}>
                    <TableCell>{skill["조선 랭크"]}</TableCell>
                    <TableCell>{skill["전용함 건조증"]}</TableCell>
                    <TableCell>
                      {skill["재료"]
                        ? renderObjectsToChips(
                            skill["재료"].map((m) => ({
                              ...m,
                              name: `${m.name} ${m.quantity}`,
                            })),
                            navigate
                          )
                        : null}
                    </TableCell>
                    <TableCell>{skill["제외 선박"]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
}
