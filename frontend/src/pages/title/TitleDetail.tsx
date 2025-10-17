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

interface Title {
  id: number;
  name: string;
  description: string | null;
  requirements: any;
  effect: string | null;
}

export default function TitleDetail({ data }: { data?: Title }) {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState<Title | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTitle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/titles/${id}`);
        setTitle(response.data);
      } catch (err) {
        setError("Failed to load Title details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTitle();
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

  if (!title) {
    return <Typography sx={{ p: 3 }}>Title not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {title.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={title.description} />
          </Box>
          {title.requirements &&
            Object.keys(title.requirements).length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" color="text.secondary">
                  요구 사항
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(title.requirements).map(
                        ([key, value]) => {
                          let renderedValue;
                          switch (key) {
                            case "skills":
                              renderedValue = renderObjectsToChips(
                                value.map((skill: any) => ({ ...skill, value: skill.rank }))
                                , navigate);
                              break;
                            case "quests":
                              renderedValue = renderObjectsToChips(value, navigate);
                              break;
                            case "jobs":
                              renderedValue = renderObjectsToChips(value, navigate);
                              break;
                            case "etc":
                              renderedValue = value;
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
                                    case "quests":
                                      return "퀘스트";
                                    case "jobs":
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
            <Box sx={{ mt: 2 }}>
            <DetailItem label="효과" value={title.effect} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
