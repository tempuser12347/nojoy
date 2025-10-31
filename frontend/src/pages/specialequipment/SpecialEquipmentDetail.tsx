import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import ObtainMethodTabs from "../../components/ObtainMethodTabs";

interface SpecialEquipment {
    id: number;
    name: string;
    description: string | null;
    durability: number | null;
    vertical_sail: number | null;
    melee_support: number | null;
    effect: string | null;
    ballistic_defense: number | null;
    fire_resistance: number | null;
    firepower: number | null;
    shoot_range: number | null;
    shoot_area: string | null;
    cooling_speed: number | null;
    horizontal_sail: number | null;
    ramming: number | null;
    proximity_effect: number | null;
    obtain_method: any[] | null;
}

export default function SpecialEquipmentDetail({ data }: { data?: SpecialEquipment }) {
  const { id } = useParams<{ id: string }>();
  const [specialEquipment, setSpecialEquipment] = useState<SpecialEquipment | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialEquipment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/specialequipments/${id}`);
        setSpecialEquipment(response.data);
      } catch (err) {
        setError("Failed to load Special Equipment details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchSpecialEquipment();
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

  if (!specialEquipment) {
    return <Typography sx={{ p: 3 }}>Special Equipment not found.</Typography>;
  }

  const allStats = {
    "내구도": specialEquipment.durability,
    "세로돛": specialEquipment.vertical_sail,
    "가로돛": specialEquipment.horizontal_sail,
    "백병전 지원": specialEquipment.melee_support,
    "내탄방어": specialEquipment.ballistic_defense,
    "내화방어": specialEquipment.fire_resistance,
    "화력": specialEquipment.firepower,
    "사정거리": specialEquipment.shoot_range,
    "사정범위": specialEquipment.shoot_area,
    "방열속도": specialEquipment.cooling_speed,
    "충돌공격": specialEquipment.ramming,
    "접현효과": specialEquipment.proximity_effect,
    "효과": specialEquipment.effect,
  };

  const stats = Object.fromEntries(Object.entries(allStats).filter(([_, v]) => v !== null && v !== undefined));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {specialEquipment.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={specialEquipment.description} />
          </Box>
          <Grid container spacing={2}>

          {Object.keys(stats).length > 0 && (
            <Grid size={{xs:12}}>
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
                        <TableCell key={index}>{value}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
          {specialEquipment.obtain_method && (
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <DetailItem
                  label="획득 방법"
                  value={
                    <ObtainMethodTabs data={specialEquipment.obtain_method} />
                  }
                />
              </Grid>
            )}

          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
