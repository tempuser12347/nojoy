import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

interface ExtraArmor {
  id: number;
  name: string;
  description: string | null;
  durability: number | null;
  armor: number | null;
  speed: number | null;
  features: string | null;
}

export default function ExtraArmorDetail({ data }: { data?: ExtraArmor }) {
  const { id } = useParams<{ id: string }>();
  const [extraArmor, setExtraArmor] = useState<ExtraArmor | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExtraArmor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/extraarmors/${id}`);
        setExtraArmor(response.data);
      } catch (err) {
        setError("Failed to load Extra Armor details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchExtraArmor();
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

  if (!extraArmor) {
    return <Typography sx={{ p: 3 }}>Extra Armor not found.</Typography>;
  }

  const stats = {
    "내구도": extraArmor.durability,
    "장갑": extraArmor.armor,
    "속도": extraArmor.speed,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {extraArmor.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={extraArmor.description} />
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
                    label="특징"
                    value={extraArmor.features}
                />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
