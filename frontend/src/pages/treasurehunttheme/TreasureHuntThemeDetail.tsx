import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import { renderObjectChip, renderObjectsToChips } from "../../common/render";

interface TreasureHuntTheme {
  id: number;
  name: string;
  description: string | null;
  theme_rank: number;
  requirements: Array<{ type: string; content: string }> | null;
}

export default function TreasureHuntThemeDetail({
  data,
}: { data?: TreasureHuntTheme }) {
  const { id } = useParams<{ id: string }>();
  const [treasureHuntTheme, setTreasureHuntTheme] = useState<TreasureHuntTheme | null>(
    data || null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


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
            {requirements.map((req, index) => {
              if (req.type == '선행 발견/퀘스트' || req.type == '장비품') {
                return <TableRow key={index}>
                  <TableCell>{req.type}</TableCell>
                  <TableCell>
                    <Box>
                      {req.content.map((item: any, itemIndex: number) => (
                        <Typography key={itemIndex} variant="body2">
                          {renderObjectChip(item, navigate)}
                        </Typography>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              }
              else if (req.type == '기타' || req.type == '시대') {
                return <TableRow key={index}>
                  <TableCell>{req.type}</TableCell>
                  <TableCell>{req.content}</TableCell>
                </TableRow>
              }
              else if (req.type == '아이템') {

                return <TableRow key={index}>
                  <TableCell>{req.type}</TableCell>
                  <TableCell>{renderObjectsToChips(req.content, navigate)}</TableCell>
                </TableRow>
              }
              else if(req.type == '역사적 사건'){

                return <TableRow key={index}>
                  <TableCell>{req.type}</TableCell>
                  <TableCell>{renderObjectChip(req.content, navigate)}</TableCell>
                </TableRow>
              }
              else {
                return <TableRow key={index}>
                  <TableCell>{req.type}</TableCell>
                  <TableCell>
                    {JSON.stringify(req.content)}
                  </TableCell>
                </TableRow>
              }
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  useEffect(() => {
    const fetchTreasureHuntTheme = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/treasurehuntthemes/${id}`);
        setTreasureHuntTheme(response.data);
      } catch (err) {
        setError("Failed to load Treasure Hunt Theme details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTreasureHuntTheme();
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

  if (!treasureHuntTheme) {
    return <Typography sx={{ p: 3 }}>Treasure Hunt Theme not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={treasureHuntTheme.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="테마 랭크" value={treasureHuntTheme.theme_rank} />
      </Grid>
      {treasureHuntTheme.requirements ? <Grid size={{ xs: 12 }}>
        <DetailItem label='요구사항' value={renderRequirements(treasureHuntTheme.requirements)} />
      </Grid> : null}
    </Grid>
  );
}