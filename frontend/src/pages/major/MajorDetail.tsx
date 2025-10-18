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
  TableRow,
  Paper,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import { renderObjectChip, renderObjectsToChips } from "../../common/render";

interface Major {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  acquisition_conditions: any;
}

export default function MajorDetail({ data }: { data?: Major }) {
  const { id } = useParams<{ id: string }>();
  const [major, setMajor] = useState<Major | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMajor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/majors/${id}`);
        setMajor(response.data);
      } catch (err) {
        setError("Failed to load Major details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchMajor();
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

  if (!major) {
    return <Typography sx={{ p: 3 }}>Major not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {major.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={major.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="카테고리" value={major.category} />
            </Grid>
          </Grid>
          {major.acquisition_conditions &&
            Object.keys(major.acquisition_conditions).length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" color="text.secondary">
                  획득 조건
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(major.acquisition_conditions).map(
                        ([key, value]) => {
                          let renderedValue;
                          switch (key) {
                            case "building_level":
                              renderedValue = value;
                              break;
                            case "thesis_submissions":
                              renderedValue = value;
                              break;
                            case "skills":
                              renderedValue = renderObjectsToChips(
                                value.map((skill: any) => ({
                                  ...skill,
                                  value: skill.rank,
                                })),
                                navigate
                              );
                              break;
                            case "job":
                              renderedValue = renderObjectChip(value, navigate);
                              break;
                            case "etc":
                              renderedValue = value;
                              break;
                            default:
                              renderedValue =
                                typeof value === "object" && value !== null
                                  ? JSON.stringify(value)
                                  : String(value);
                          }
                          return (
                            <TableRow key={key}>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                {(() => {
                                  switch (key) {
                                    case "building_level":
                                      return "건물 레벨";
                                    case "thesis_submissions":
                                      return "논문 제출";
                                    case "skills":
                                      return "스킬";
                                    case "job":
                                      return "직업";
                                    case "etc":
                                      return "기타";
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
        </CardContent>
      </Card>
    </Box>
  );
}
