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

interface Figurehead {
  id: number;
  name: string;
  description: string | null;
  durability: number | null;
  disaster_protection: number | null;
  fatigue_reduction: number | null;
  crew_control: number | null;
  shell_evasion: number | null;
  use_effect: { id: number; name: string } | null;
}

export default function FigureheadDetail({ data }: { data?: Figurehead }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [figurehead, setFigurehead] = useState<Figurehead | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFigurehead = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/figureheads/${id}`);
        setFigurehead(response.data);
      } catch (err) {
        setError("Failed to load Figurehead details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchFigurehead();
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

  if (!figurehead) {
    return <Typography sx={{ p: 3 }}>Figurehead not found.</Typography>;
  }

  const stats = {
    "내구도": figurehead.durability,
    "재해 방지": figurehead.disaster_protection,
    "피로 감소": figurehead.fatigue_reduction,
    "선원 통제": figurehead.crew_control,
    "포탄 회피": figurehead.shell_evasion,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {figurehead.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={figurehead.description} />
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              성능
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(stats).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {Object.values(stats).map((value, index) => (
                      <TableCell key={index}>{value !== null ? value : "-"}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Grid container spacing={2} sx={{mt: 2}}>
            <Grid item xs={12}>
                <DetailItem
                    label="사용 효과"
                    value={
                    figurehead.use_effect ? renderObjectChip(figurehead.use_effect, navigate) : null
                    }
                />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
