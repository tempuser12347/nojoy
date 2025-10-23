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

interface GradeBonus {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  ship_skill_increase: number | null;
  performance_improvement: any[] | null;
  ship_skill: any[] | null;
}

export default function GradeBonusDetail({ data }: { data?: GradeBonus }) {
  const { id } = useParams<{ id: string }>();
  const [gradeBonus, setGradeBonus] = useState<GradeBonus | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGradeBonus = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/gradebonuses/${id}`);
        setGradeBonus(response.data);
      } catch (err) {
        setError("Failed to load Grade Bonus details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchGradeBonus();
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

  if (!gradeBonus) {
    return <Typography sx={{ p: 3 }}>Grade Bonus not found.</Typography>;
  }

  const renderPerformanceImprovement = () => {
    if (!gradeBonus.performance_improvement || gradeBonus.performance_improvement.length === 0) {
      return null;
    }

    const headers = Object.keys(gradeBonus.performance_improvement[0]).filter(h => h !== 'type');

    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {gradeBonus.performance_improvement.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.type}</TableCell>
                {headers.map((header) => (
                  <TableCell key={header}>{item[header]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {gradeBonus.name}
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DetailItem label="설명" value={gradeBonus.description} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailItem label="카테고리" value={gradeBonus.category} />
            </Grid>
            {gradeBonus.ship_skill_increase ?
              <Grid item xs={12} sm={6}>
                <DetailItem label="선박 스킬 증가" value={gradeBonus.ship_skill_increase} />
              </Grid>
              : null}
            {
              gradeBonus.ship_skill ?
                <Grid item xs={12}>
                  <DetailItem
                    label="선박 스킬"
                    value={
                      gradeBonus.ship_skill?.map((s) => renderObjectChip(s, navigate))
                    }
                  />
                </Grid> : null
            }
            {gradeBonus.performance_improvement ?
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>성능 향상</Typography>
                {renderPerformanceImprovement()}
              </Grid> : null}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
