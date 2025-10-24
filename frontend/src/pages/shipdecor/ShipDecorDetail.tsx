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

interface ShipDecor {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  positions: {
    flag: boolean;
    side_front_right: boolean;
    side_front_left: boolean;
    side_rear_right: boolean;
    side_rear_left: boolean;
  };
}

export default function ShipDecorDetail({ data }: { data?: ShipDecor }) {
  const { id } = useParams<{ id: string }>();
  const [shipDecor, setShipDecor] = useState<ShipDecor | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipDecor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/shipdecors/${id}`);
        setShipDecor(response.data);
      } catch (err) {
        setError("Failed to load Ship Decor details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchShipDecor();
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

  if (!shipDecor) {
    return <Typography sx={{ p: 3 }}>Ship Decor not found.</Typography>;
  }

  const positionLabels = {
    flag: "깃발",
    side_front_right: "우측 전면",
    side_front_left: "좌측 전면",
    side_rear_right: "우측 후면",
    side_rear_left: "좌측 후면",
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {shipDecor.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={shipDecor.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                장착 위치
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.values(positionLabels).map((label) => (
                        <TableCell key={label}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {Object.keys(positionLabels).map((key) => (
                        <TableCell key={key}>
                          {shipDecor.positions[key as keyof typeof shipDecor.positions] ? "O" : "X"}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
