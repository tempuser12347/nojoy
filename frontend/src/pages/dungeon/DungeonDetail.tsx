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

interface Dungeon {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  category: string | null;
  floors: string | null;
  dungeon_rank: number | null;
  dungeon_exploration: number | null;
  boarding_pass: number | null;
  entrance: { id: number; name: string } | null;
  requirements: any[] | null;
  discoveries: any[] | null;
  acquisition_items: any | null;
}

export default function DungeonDetail({ data }: { data?: Dungeon }) {
  const { id } = useParams<{ id: string }>();
  const [dungeon, setDungeon] = useState<Dungeon | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDungeon = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/dungeons/${id}`);
        setDungeon(response.data);
      } catch (err) {
        setError("Failed to load Dungeon details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchDungeon();
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

  if (!dungeon) {
    return <Typography sx={{ p: 3 }}>Dungeon not found.</Typography>;
  }

  const renderRequirements = (requirements: any[]) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>구분</TableCell>
              <TableCell>내용</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requirements.map((req, index) => (
              <TableRow key={index}>
                <TableCell>{req.type}</TableCell>
                <TableCell>
                  {req.type === "선행 발견/퀘스트" && (
                    <Box>
                      {req.content.map((item: any, itemIndex: number) => (
                        <Typography key={itemIndex} variant="body2">
                          {renderObjectChip(item, navigate)}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderDiscoveries = (discoveries: any[]) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>방법</TableCell>
              <TableCell>발견물</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {discoveries.map((disc: any, discIndex: number) => (
              <TableRow key={discIndex}>
                <TableCell>{disc.method}</TableCell>
                <TableCell>{renderObjectChip(disc.discovery, navigate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderAcquisitionItems = (acquisitionItems: any) => {
    return Object.keys(acquisitionItems).map((key) => (
      <Box key={key} sx={{ mb: 2 }}>
        <Typography variant="subtitle1">{key}</Typography>
        {acquisitionItems[key].map((category: any, categoryIndex: number) => (
          <Box key={categoryIndex} sx={{ ml: 2 }}>
            <Typography variant="body2">{category.type}</Typography>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>아이템</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.items.map((item: any, itemIndex: number) => (
                    <TableRow key={itemIndex}>
                      <TableCell>{renderObjectChip(item, navigate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Box>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {dungeon.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={dungeon.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="분류" value={dungeon.category} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="층수" value={dungeon.floors} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="랭크" value={dungeon.dungeon_rank} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="탐험" value={dungeon.dungeon_exploration} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="승선권" value={dungeon.boarding_pass} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem
                label="입구"
                value={dungeon.entrance ? renderObjectChip(dungeon.entrance, navigate) : null}
              />
            </Grid>
            <Grid size={{xs: 12}}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                요구 사항
              </Typography>
              {dungeon.requirements && renderRequirements(dungeon.requirements)}
            </Grid>
            <Grid size={{xs: 12}}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                발견물
              </Typography>
              {dungeon.discoveries && renderDiscoveries(dungeon.discoveries)}
            </Grid>
            <Grid size={{xs: 12}}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                획득 아이템
              </Typography>
              {dungeon.acquisition_items && renderAcquisitionItems(dungeon.acquisition_items)}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}