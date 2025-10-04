import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  type NavigateFunction,
} from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import api from "../../api";
import { renderObjectChip } from "../../common/render";

interface NpcSale {
  id: number;
  npc: string;
  location: { id: number; name: string };
  items: {
    id: number;
    name: string;
    price: string | null;
    count: number | null;
    progress: string | null;
    invest: string | null;
    contribution: string | null;
    centralcity: string | null;
    era: string | null;
  }[];
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

const renderTableForItems = (
  items: {
    id: number;
    name: string;
    price: string | null;
    count: number | null;
    progress: string | null;
    invest: string | null;
    contribution: string | null;
    centralcity: string | null;
    era: string | null;
  }[],
  navigate: NavigateFunction | null
) => {
  return (
    <Table
      sx={{
        borderCollapse: "collapse",
        width: "100%",
      }}
    >
      <TableHead>
        <TableRow sx={{ backgroundColor: "grey.200" }}>
          <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>아이템</TableCell>
          <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>수량</TableCell>
          <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>가격</TableCell>
          <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>진척도</TableCell>
          <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>투자</TableCell>
          <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>공헌도</TableCell>
          <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>중심도시</TableCell>
          <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>시대</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>
              {navigate
                ? renderObjectChip({ id: item.id, name: item.name }, navigate)
                : item.name}
            </TableCell>
            <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>{item.count}</TableCell>
            <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>{item.price}</TableCell>
            <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>{item.progress}</TableCell>
            <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>{item.invest}</TableCell>
            <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>{item.contribution}</TableCell>
            <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>{item.centralcity}</TableCell>
            <TableCell sx={{ border: "1px solid rgba(224,224,224,1)" }}>{item.era}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function NpcSaleDetail({ data }: { data?: NpcSale }) {
  console.log(data);
  const { id } = useParams<{ id: string }>();
  const [npcSale, setNpcSale] = useState<NpcSale | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNpcSale = async () => {
      try {
        const response = await api.get(`/api/npcsale/${id}`);
        console.log(response.data);
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
              label="위치"
              value={renderObjectChip(npcSale.location, navigate)}
            />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography variant="h6" color="text.secondary">
                판매 아이템
              </Typography>
              {npcSale.items
                ? renderTableForItems(npcSale.items, navigate)
                : null}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
