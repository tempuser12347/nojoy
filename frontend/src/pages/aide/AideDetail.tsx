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
import { renderObjectsToChips, renderObjectChip } from "../../common/render";

interface Aide {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  job: { id: number; name: string } | null;
  nationality: { id: number; name: string } | null;
  gender: string | null;
  hiring_city: { id: number; name: string }[] | null;
  max_required_levels: string | null;
  max_required_traits: string | null;
  skills:
    | {
        id: number;
        name: string;
        category: string;
        adventure_level: number;
        trade_level: number;
        battle_level: number;
        trait: string | null;
      }[]
    | null;
  rescue_needed: number | null;
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
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={aide.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem label="카테고리" value={aide.category} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem
          label="직업"
          value={aide.job ? renderObjectsToChips([aide.job], navigate) : null}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem
          label="국적"
          value={
            aide.nationality
              ? renderObjectsToChips([aide.nationality], navigate)
              : null
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem label="성별" value={aide.gender} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem
          label="고용 도시"
          value={
            aide.hiring_city
              ? renderObjectsToChips(aide.hiring_city, navigate)
              : null
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem
          label="최대 필요 레벨"
          value={aide.max_required_levels}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem
          label="최대 필요 특성"
          value={aide.max_required_traits}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem
          label="구조 필요"
          value={aide.rescue_needed === 1 ? "✅" : "❌"}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem label="구조 지역" value={aide.rescue_area} />
      </Grid>

      {aide.skills && aide.skills.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            스킬
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>카테고리</TableCell>
                  <TableCell>스킬</TableCell>
                  <TableCell>모험 레벨</TableCell>
                  <TableCell>교역 레벨</TableCell>
                  <TableCell>전투 레벨</TableCell>
                  <TableCell>특성</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(
                  aide.skills.reduce((acc, skill) => {
                    const category = skill.category;
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(skill);
                    return acc;
                  }, {} as Record<string, typeof aide.skills>)
                ).map(([category, skillsInType]) =>
                  skillsInType.map((skill, index) => (
                    <TableRow key={skill.id}>
                      {index === 0 && (
                        <TableCell rowSpan={skillsInType.length}>
                          {category}
                        </TableCell>
                      )}
                      <TableCell>
                        {renderObjectChip(skill, navigate)}
                      </TableCell>
                      <TableCell>{skill.adventure_level}</TableCell>
                      <TableCell>{skill.trade_level}</TableCell>
                      <TableCell>{skill.battle_level}</TableCell>
                      <TableCell>{skill.trait}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
}
