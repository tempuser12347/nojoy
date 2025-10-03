import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import api from "../../api";
import {
  renderObjectsToChips,
  renderRequirementsTable,
} from "../../common/render";

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {equipment.name}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
                lg: "1fr 1fr 1fr 1fr",
              },
            }}
          >
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DetailItem label="설명" value={equipment.description} />
            </Box>
            <DetailItem label="종류" value={equipment.type} />
            <DetailItem label="분류" value={equipment.classification} />
            <DetailItem label="공격력" value={equipment.attack_power} />
            <DetailItem label="방어력" value={equipment.defense_power} />
            <DetailItem label="내구도" value={equipment.durability} />
            <DetailItem label="변장도" value={equipment.disguise} />
            <DetailItem label="필요명성" value={equipment.attire} />
            <DetailItem
              label="사용효과"
              value={equipment.use_effect?.name || "-"}
            />
            <DetailItem
              label="장착효과"
              value={equipment.equipped_effect?.name || "-"}
            />
            <DetailItem
              label="스킬"
              value={renderObjectsToChips(equipment.skills, navigate)}
            />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DetailItem
                label="요구사항"
                value={renderRequirementsTable(equipment.requirements)}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
