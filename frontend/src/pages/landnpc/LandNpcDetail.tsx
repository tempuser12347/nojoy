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

interface LandNpc {
  id: number;
  name: string;
  description: string;
  level: number;
  fields: { id: number; name: string }[];
  techniques: {
    "무기 종류": string | null;
    "테크닉 종류": string;
    랭크: number;
    테크닉: { id: number; name: string };
  }[];
  drop_items: { id: number; name: string; category: string }[];
  feature: string;
}

const FieldsTable: React.FC<{ data: { id: number; name: string }[] }> = ({
  data,
}) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>필드</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((field) => (
            <TableRow key={field.id}>
              <TableCell>{renderObjectChip(field, navigate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const TechniquesTable: React.FC<{ data: LandNpc["techniques"] }> = ({
  data,
}) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;

  // Group by "테크닉 종류"
  const groupedTechniques = data.reduce((acc, tech) => {
    const key = tech["테크닉 종류"];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tech);
    return acc;
  }, {} as { [key: string]: LandNpc["techniques"] });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>테크닉 종류</TableCell>
            <TableCell>무기 종류</TableCell>
            <TableCell>랭크</TableCell>
            <TableCell>테크닉</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(groupedTechniques).map(([techType, techniques]) => {
            const rowSpan = techniques.length;
            return techniques.map((tech, index) => (
              <TableRow key={`${techType}-${index}`}>
                {index === 0 && (
                  <TableCell rowSpan={rowSpan}>{techType}</TableCell>
                )}
                <TableCell>{tech["무기 종류"] || "-"}</TableCell>
                <TableCell>{tech["랭크"]}</TableCell>
                <TableCell>
                  {renderObjectChip(tech["테크닉"], navigate)}
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const DropItemsTable: React.FC<{ data: LandNpc["drop_items"] }> = ({
  data,
}) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;

  // Group by category
  const groupedItems = data.reduce((acc, item) => {
    const key = item.category;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as { [key: string]: LandNpc["drop_items"] });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>카테고리</TableCell>
            <TableCell>아이템</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(groupedItems).map(([category, items]) => {
            const rowSpan = items.length;
            return items.map((item, index) => (
              <TableRow key={`${category}-${index}`}>
                {index === 0 && (
                  <TableCell rowSpan={rowSpan}>{category}</TableCell>
                )}
                <TableCell>{renderObjectChip(item, navigate)}</TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function LandNpcDetail({ data }: { data?: LandNpc }) {
  const { id } = useParams<{ id: string }>();
  const [npc, setNpc] = useState<LandNpc | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNpc = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/landnpcs/${id}`);
        setNpc(response.data);
      } catch (err) {
        setError("Failed to load Land NPC details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchNpc();
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

  if (!npc) {
    return <Typography sx={{ p: 3 }}>Land NPC not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {npc.name}
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <DetailItem label="설명" value={npc.description} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="레벨" value={npc.level} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailItem label="특징" value={npc.feature} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {npc.fields && npc.fields.length > 0 && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>
            필드
          </Typography>
          <FieldsTable data={npc.fields} />
        </Box>
      )}

      {npc.techniques && npc.techniques.length > 0 && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>
            테크닉
          </Typography>
          <TechniquesTable data={npc.techniques} />
        </Box>
      )}

      {npc.drop_items && npc.drop_items.length > 0 && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>
            드롭 아이템
          </Typography>
          <DropItemsTable data={npc.drop_items} />
        </Box>
      )}
    </Box>
  );
}
