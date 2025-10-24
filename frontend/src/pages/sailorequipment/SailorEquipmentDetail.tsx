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

interface SailorEquipment {
    id: number;
    name: string;
    description: string | null;
    durability: number | null;
    vertical_sail: number | null;
    horizontal_sail: number | null;
    wave_resistance: number | null;
    equipment_effect: { id: number; name: string } | null;
    armor: number | null;
    maneuverability: number | null;
}

export default function SailorEquipmentDetail({ data }: { data?: SailorEquipment }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sailorEquipment, setSailorEquipment] = useState<SailorEquipment | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSailorEquipment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/sailorequipments/${id}`);
        setSailorEquipment(response.data);
      } catch (err) {
        setError("Failed to load Sailor Equipment details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchSailorEquipment();
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

  if (!sailorEquipment) {
    return <Typography sx={{ p: 3 }}>Sailor Equipment not found.</Typography>;
  }

  const stats = {
    "내구도": sailorEquipment.durability,
    "세로돛": sailorEquipment.vertical_sail,
    "가로돛": sailorEquipment.horizontal_sail,
    "내파": sailorEquipment.wave_resistance,
    "장갑": sailorEquipment.armor,
    "선회": sailorEquipment.maneuverability,
  };

  const filteredStats = Object.fromEntries(Object.entries(stats).filter(([_, v]) => v !== null && v !== undefined));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {sailorEquipment.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={sailorEquipment.description} />
          </Box>
          {Object.keys(filteredStats).length > 0 &&
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                성능
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(filteredStats).map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {Object.values(filteredStats).map((value, index) => (
                        <TableCell key={index}>{value}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          }
          <Grid container spacing={2} sx={{mt: 2}}>
            <Grid item xs={12}>
                <DetailItem
                    label="장비 효과"
                    value={
                    sailorEquipment.equipment_effect ? renderObjectChip(sailorEquipment.equipment_effect, navigate) : null
                    }
                />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
