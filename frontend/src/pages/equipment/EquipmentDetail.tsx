import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  TableRow,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableBody
} from "@mui/material";
import api from "../../api";
import {
  renderObjectsToChips,
  renderRequirementsTable,
} from "../../common/render";
import ObtainMethodTabs from "../../components/ObtainMethodTabs";

interface Equipment {
  id: number;
  name: string;
  description: string;
  type: string;
  classification: string;
  attack_power: number;
  defense_power: number;
  durability: number;
  attire: number;
  disguise: number;
  use_effect: any;
  equipped_effect: any;
  requirements: { type: string; content: any }[] | null;
  skills: Array<{ id: number; name: string; value: number }>;
  obtain_method: any[] | null;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) =>
  value ? (
    <Box>
      <Typography variant="h6" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
        {value}
      </Typography>
    </Box>
  ) : null;

export default function EquipmentDetail({ data }: { data?: Equipment }) {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipment = async () => {
      if (id) {
        try {
          const response = await api.get(`/api/equipment/${id}`);
          setEquipment(response.data);
        } catch (err) {
          setError("Failed to load equipment details");
          console.error("Error fetching equipment:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    if (!data && id) {
      fetchEquipment();
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
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!equipment) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Equipment not found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} >
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={equipment.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="종류" value={equipment.type} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="분류" value={equipment.classification} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          주요 속성
        </Typography>
        <TableContainer component={Paper}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                {equipment.durability && <TableCell>내구도</TableCell>}
                {equipment.attack_power && <TableCell>공격력</TableCell>}
                {equipment.defense_power && <TableCell>방어력</TableCell>}
                {equipment.disguise && <TableCell>변장도</TableCell>}
                {equipment.attire && <TableCell>복장예절</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {equipment.durability && <TableCell>{equipment.durability}</TableCell>}
                {equipment.attack_power && <TableCell>{equipment.attack_power}</TableCell>}
                {equipment.defense_power && <TableCell>{equipment.defense_power}</TableCell>}
                {equipment.disguise && <TableCell>{equipment.disguise}</TableCell>}
                {equipment.attire && <TableCell>{equipment.attire}</TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {equipment.use_effect ?

        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem
            label="사용효과"
            value={equipment.use_effect?.name || "-"}
          />
        </Grid> : null
      }
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="장착효과"
          value={equipment.equipped_effect?.name || "-"}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="스킬"
          value={renderObjectsToChips(equipment.skills, navigate, v => '+' + v)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>

        <DetailItem
          label="요구사항"
          value={renderRequirementsTable(equipment.requirements)}
        />
      </Grid>
      {equipment.obtain_method ? (
        <Grid size={{ xs: 12 }}>
          <DetailItem
            label="획득방법"
            value={<ObtainMethodTabs data={equipment.obtain_method} />}
          />
        </Grid>

      ) : null}
    </Grid>
  );
}
