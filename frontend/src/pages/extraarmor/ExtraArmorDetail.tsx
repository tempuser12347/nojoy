import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import ObtainMethodTabs from "../../components/ObtainMethodTabs";

interface ExtraArmor {
  id: number;
  name: string;
  description: string | null;
  durability: number | null;
  armor: number | null;
  speed: number | null;
  features: string | null;
  obtain_method: any[] | null;
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
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={extraArmor.description} />
      </Grid>
      <Grid size={{ xs: 12 }}>
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
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem
          label="특징"
          value={extraArmor.features}
        />
      </Grid>
      {extraArmor.obtain_method && (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <DetailItem
            label="획득 방법"
            value={
              <ObtainMethodTabs data={extraArmor.obtain_method} />
            }
          />
        </Grid>
      )}
    </Grid>
  );
}
