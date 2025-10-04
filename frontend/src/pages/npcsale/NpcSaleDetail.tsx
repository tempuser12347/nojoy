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
import { renderObjectsToChips, renderObjectChip } from "../../common/render";

interface NpcSale {
  id: number;
  npc: string;
  location: { id: number; name: string };
  items: { id: number; name: string }[];
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

export default function NpcSaleDetail({ data }: { data?: NpcSale }) {
  const { id } = useParams<{ id: string }>();
  const [npcSale, setNpcSale] = useState<NpcSale | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNpcSale = async () => {
      try {
        const response = await api.get(`/api/npcsale/${id}`);
        setNpcSale(response.data);
      } catch (err) {
        setError("Failed to load npc sale details");
        console.error("Error fetching npc sale:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchNpcSale();
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

  if (!npcSale) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Npc sale not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {npcSale.npc}
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
              },
            }}
          >
            <DetailItem
              label="Location"
              value={renderObjectChip(npcSale.location, navigate)}
            />
            <DetailItem
              label="Items"
              value={renderObjectsToChips(npcSale.items, navigate)}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
