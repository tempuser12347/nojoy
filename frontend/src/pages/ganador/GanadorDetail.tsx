import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { renderObjectChip } from "../../common/render";

interface Ganador {
  id: number;
  name: string;
  description: string;
  category: string;
  era: string;
  difficulty: number;
  durability: number;
  crew: number;
  attack_power: number;
  defense_power: number;
  preparation_item: { id: number; name: string; quantity: number } | null;
  feature: string;
  requirements: { 종류: string; 내용: string }[];
  acquired_items: { id: number; name: string; 종류: string }[];
}

const RequirementsTable: React.FC<{ data: Ganador["requirements"] }> = ({
  data,
}) => {
  if (!data || data.length === 0) return null;
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>종류</TableCell>
            <TableCell>내용</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((req, index) => (
            <TableRow key={index}>
              <TableCell>{req["종류"]}</TableCell>
              <TableCell>{req["내용"]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const AcquiredItemsTable: React.FC<{ data: Ganador["acquired_items"] }> = ({
  data,
}) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;

  // Group by "종류"
  const groupedItems = data.reduce((acc, item) => {
    const key = item["종류"];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as { [key: string]: Ganador["acquired_items"] });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>종류</TableCell>
            <TableCell>아이템</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(groupedItems).map(([type, items]) => {
            const rowSpan = items.length;
            return items.map((item, index) => (
              <TableRow key={`${type}-${item.id}`}>
                {index === 0 && <TableCell rowSpan={rowSpan}>{type}</TableCell>}
                <TableCell>{renderObjectChip(item, navigate)}</TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const StatsTable: React.FC<{ ganador: Ganador }> = ({ ganador }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>내구력</TableCell>
            <TableCell>선원</TableCell>
            <TableCell>공격력</TableCell>
            <TableCell>방어력</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{ganador.durability}</TableCell>
            <TableCell>{ganador.crew}</TableCell>
            <TableCell>{ganador.attack_power}</TableCell>
            <TableCell>{ganador.defense_power}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function GanadorDetail({ data }: { data?: Ganador }) {
  const { id } = useParams<{ id: string }>();
  const [ganador, setGanador] = useState<Ganador | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGanador = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/ganadors/${id}`);
        setGanador(response.data);
      } catch (err) {
        setError("Failed to load Ganador details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchGanador();
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

  if (!ganador) {
    return <Typography sx={{ p: 3 }}>Ganador not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={ganador.description} />
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          능력치
        </Typography>
        <StatsTable ganador={ganador} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="카테고리" value={ganador.category} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="시대" value={ganador.era} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="난이도" value={ganador.difficulty} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="준비물"
          value={
            ganador.preparation_item
              ? `${ganador.preparation_item.name} x ${ganador.preparation_item.quantity}`
              : "-"
          }
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="특징" value={ganador.feature} />
      </Grid>
      {ganador.requirements && ganador.requirements.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            요구 사항
          </Typography>
          <RequirementsTable data={ganador.requirements} />
        </Grid>
      )}

      {ganador.acquired_items && ganador.acquired_items.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            획득 아이템
          </Typography>
          <AcquiredItemsTable data={ganador.acquired_items} />
        </Grid>
      )}
    </Grid>
  );
}
