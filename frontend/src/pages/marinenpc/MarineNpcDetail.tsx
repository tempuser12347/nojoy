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

interface MarineNpc {
  id: number;
  name: string;
  description: string;
  fleet_count: number;
  sea_areas: { id: number; name: string }[];
  acquired_items: {
    id: number;
    name: string;
    유형: string;
    "획득 방법": string;
    종류: string;
  }[];
  nationality: { id: number; name: string } | null;
  feature: string;
  deck_battle: string;
  penalty_level: number;
}

const SeaAreasTable: React.FC<{ data: { id: number; name: string }[] }> = ({
  data,
}) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>해역</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((seaArea) => (
            <TableRow key={seaArea.id}>
              <TableCell>{renderObjectChip(seaArea, navigate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const AcquiredItemsTable: React.FC<{ data: MarineNpc["acquired_items"] }> = ({
  data,
}) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;

  // Group by "획득 방법"
  const groupedByMethod = data.reduce((acc, item) => {
    const methodKey = item["획득 방법"];
    if (!acc[methodKey]) {
      acc[methodKey] = [];
    }
    acc[methodKey].push(item);
    return acc;
  }, {} as { [method: string]: MarineNpc["acquired_items"] });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>획득 방법</TableCell>
            <TableCell>유형</TableCell>
            <TableCell>종류</TableCell>
            <TableCell>아이템</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            Object.entries(groupedByMethod)
              .map(([method, itemsByMethod]) => {
                // Group by "유형" within each method
                const groupedByType = itemsByMethod.reduce((acc, item) => {
                  const typeKey = item["유형"];
                  if (!acc[typeKey]) {
                    acc[typeKey] = [];
                  }
                  acc[typeKey].push(item);
                  return acc;
                }, {} as { [type: string]: MarineNpc["acquired_items"] });

                const methodRowSpan = itemsByMethod.length; // Total items for this method

                return Object.entries(groupedByType)
                  .map(([type, itemsByType]) => {
                    // Group by "종류" within each type
                    const groupedByCategory = itemsByType.reduce(
                      (acc, item) => {
                        const categoryKey = item["종류"];
                        if (!acc[categoryKey]) {
                          acc[categoryKey] = [];
                        }
                        acc[categoryKey].push(item);
                        return acc;
                      },
                      {} as { [category: string]: MarineNpc["acquired_items"] }
                    );

                    const typeRowSpan = itemsByType.length; // Total items for this type

                    return Object.entries(groupedByCategory)
                      .map(([category, itemsByCategory]) => {
                        const categoryRowSpan = itemsByCategory.length; // Total items for this category

                        return itemsByCategory.map((item) => (
                          <TableRow
                            key={`${method}-${type}-${category}-${item.id}`}
                          >
                            {/* Acquisition Method Cell */}
                            {itemsByMethod.indexOf(item) === 0 && (
                              <TableCell rowSpan={methodRowSpan}>
                                {method}
                              </TableCell>
                            )}
                            {/* Type Cell */}
                            {itemsByType.indexOf(item) === 0 && (
                              <TableCell rowSpan={typeRowSpan}>
                                {type}
                              </TableCell>
                            )}
                            {/* Category Cell */}
                            {itemsByCategory.indexOf(item) === 0 && (
                              <TableCell rowSpan={categoryRowSpan}>
                                {category}
                              </TableCell>
                            )}
                            {/* Item Cell */}
                            <TableCell>
                              {renderObjectChip(item, navigate)}
                            </TableCell>
                          </TableRow>
                        ));
                      })
                      .flat(); // Flatten the nested arrays of TableRows
                  })
                  .flat(); // Flatten the nested arrays of TableRows
              })
              .flat() // Flatten the nested arrays of TableRows
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function MarineNpcDetail({ data }: { data?: MarineNpc }) {
  const { id } = useParams<{ id: string }>();
  const [npc, setNpc] = useState<MarineNpc | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNpc = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/marinenpcs/${id}`);
        setNpc(response.data);
      } catch (err) {
        setError("Failed to load Marine NPC details");
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
    return <Typography sx={{ p: 3 }}>Marine NPC not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={npc.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="함대 수" value={npc.fleet_count} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="특징" value={npc.feature} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="국적"
          value={
            npc.nationality ? renderObjectChip(npc.nationality, navigate) : "-"
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="백병전" value={npc.deck_battle} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="패널티 레벨" value={npc.penalty_level} />
      </Grid>
      {npc.sea_areas && npc.sea_areas.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            해역
          </Typography>
          <SeaAreasTable data={npc.sea_areas} />
        </Grid>
      )}

      {npc.acquired_items && npc.acquired_items.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            획득 아이템
          </Typography>
          <AcquiredItemsTable data={npc.acquired_items} />
        </Grid>
      )}
    </Grid>
  );
}
