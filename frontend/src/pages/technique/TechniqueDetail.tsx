import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { renderObjectChip, renderObjectsToChips } from "../../common/render";

interface Technique {
  id: number;
  name: string;
  description: string | null;
  technique_type: string | null;
  weapon_type: string | null;
  rank: number | null;
  gauge_cost: number | null;
  hitrange: number | null;
  area: number | null;
  requirements: any;
  extraname: string | null;
  effect: string | null;
}

export default function TechniqueDetail({ data }: { data?: Technique }) {
  const { id } = useParams<{ id: string }>();
  const [technique, setTechnique] = useState<Technique | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTechnique = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/techniques/${id}`);
        setTechnique(response.data);
      } catch (err) {
        setError("Failed to load Technique details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTechnique();
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

  if (!technique) {
    return <Typography sx={{ p: 3 }}>Technique not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {technique.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={technique.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs:12,  sm:6 }}>
              <DetailItem label="타입" value={technique.technique_type} />
            </Grid>
            <Grid size={{xs:12,  sm:6 }}>
              <DetailItem label="무기 타입" value={technique.weapon_type} />
            </Grid>
            <Grid size={{xs:12,  sm:6 }}>
              <DetailItem label="랭크" value={technique.rank} />
            </Grid>
            <Grid size={{xs:12,  sm:6 }}>
              <DetailItem label="게이지 코스트" value={technique.gauge_cost} />
            </Grid>
            <Grid size={{xs:12,  sm:6 }}>
              <DetailItem label="사거리" value={technique.hitrange} />
            </Grid>
            <Grid size={{xs:12,  sm:6 }}>
              <DetailItem label="범위" value={technique.area} />
            </Grid>
          </Grid>
          {technique.requirements &&
            Object.keys(technique.requirements).length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" color="text.secondary">
                  요구 사항
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(technique.requirements).map(
                        ([key, value]) => {
                          let renderedValue;
                          switch (key) {
                            case "skills":
                              renderedValue = renderObjectsToChips(
                                value.map((skill: any) => ({ ...skill, value: skill.rank }))
                                , navigate);
                              break;
                            case "technique_rank":
                              renderedValue = Object.entries(value).map(([rankKey, rankValue]) => (
                                <Typography key={rankKey}>{`${rankKey}: ${rankValue}`}</Typography>
                              ));
                              break;
                            case "techniques":
                              renderedValue = renderObjectsToChips(
                                value.map((tech: any) => ({ ...tech, value: tech.level }))
                                , navigate);
                              break;
                            default:
                              renderedValue = typeof value === "object" && value !== null
                                ? JSON.stringify(value)
                                : String(value);
                          }
                          return (
                            <TableRow key={key}>
                              <TableCell
                                sx={{ fontWeight: "bold", width: "30%" }}
                              >
                                {(() => {
                                  switch (key) {
                                    case "skills":
                                      return "스킬";
                                    case "technique_rank":
                                      return "테크닉 랭크";
                                    case "techniques":
                                      return "테크닉";
                                    default:
                                      return key;
                                  }
                                })()}
                              </TableCell>
                              <TableCell>{renderedValue}</TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
            <DetailItem label="효과" value={technique.effect} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
