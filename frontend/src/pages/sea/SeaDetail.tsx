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

interface Sea {
  id: number;
  name: string;
  description: string;
  category: string;
  region: { id: number; name: string }[];
  boundary: { [key: string]: number };
  wave: number;
  seacurrent: number;
  max_speed_increase: string;
  gatherable: any; // This will be a JSON object
}

const GatherableTable: React.FC<{ data: any }> = ({ data }) => {
  const navigate = useNavigate();
  if (!data) return null;

  const allMethods = Object.entries(data).map(([method, items]) => {
    const ranks = (items as any[]).reduce((acc, item) => {
      const rank = item["랭크"];
      let rankGroup = acc.find((r: any) => r.rank === rank);
      if (!rankGroup) {
        rankGroup = { rank: rank, rows: [] };
        acc.push(rankGroup);
      }
      rankGroup.rows.push(item);
      return acc;
    }, [] as { rank: number; rows: any[] }[]);

    // Sort ranks
    ranks.sort((a: any, b: any) => a.rank - b.rank);

    return { method, ranks };
  });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>방법</TableCell>
            <TableCell>랭크</TableCell>
            <TableCell>종류</TableCell>
            <TableCell>아이템</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allMethods.map((methodGroup, methodIndex) => {
            const methodRowSpan = methodGroup.ranks.reduce(
              (acc: any, rankGroup: any) => acc + rankGroup.rows.length,
              0
            );
            return methodGroup.ranks.map(
              (rankGroup: any, rankIndex: number) => {
                const rankRowSpan = rankGroup.rows.length;
                return rankGroup.rows.map((row: any, rowIndex: number) => (
                  <TableRow key={`${methodIndex}-${rankIndex}-${rowIndex}`}>
                    {rankIndex === 0 && rowIndex === 0 && (
                      <TableCell rowSpan={methodRowSpan}>
                        {methodGroup.method}
                      </TableCell>
                    )}
                    {rowIndex === 0 && (
                      <TableCell rowSpan={rankRowSpan}>
                        {rankGroup.rank === 0 ? "" : rankGroup.rank}
                      </TableCell>
                    )}
                    <TableCell>{row["종류"]}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {row["아이템"].map((item: any) =>
                          renderObjectChip(item, navigate)
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ));
              }
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function SeaDetail({ data }: { data?: Sea }) {
  const { id } = useParams<{ id: string }>();
  const [sea, setSea] = useState<Sea | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSea = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/seas/${id}`);
        setSea(response.data);
      } catch (err) {
        setError("Failed to load sea details");
        console.error("Error fetching sea:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchSea();
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

  if (!sea) {
    return <Typography sx={{ p: 3 }}>Sea not found.</Typography>;
  }

  const renderBasicInfoTable = (sea: Sea | null)=>{
    if(sea==null){
      return null;
    }
    return (

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {sea.category && (<TableCell>분류</TableCell>)}
              {sea.region && (<TableCell>해역</TableCell>)}
              {sea.wave && (<TableCell>파도</TableCell>)}
              {sea.seacurrent && (<TableCell>해류</TableCell>)}
              {sea.max_speed_increase && (<TableCell>최대 속도 증가</TableCell>)}
              {sea.boundary && (<TableCell>경계</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody> 
            <TableRow>
              {sea.category && (<TableCell>{sea.category}</TableCell>)}
              {sea.region && (<TableCell>{sea.region.map((r) => r.name).join(", ")}</TableCell>)}
              {sea.wave && (<TableCell>{sea.wave}</TableCell>)}
              {sea.seacurrent && (<TableCell>{sea.seacurrent}</TableCell>)}
              {sea.max_speed_increase && (<TableCell>{sea.max_speed_increase}</TableCell>)}
              {sea.boundary && (
                <TableCell>
                  {Object.entries(sea.boundary)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")}
                </TableCell>
              )}
            </TableRow>
          </TableBody>
          </Table>
      </TableContainer>
    )
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="body1" paragraph>
          {sea.description}
        </Typography>
      </Grid>
      <Grid size={{xs: 12}}>
        {renderBasicInfoTable(sea)}
      </Grid>
      {sea.gatherable && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            채집 정보
          </Typography>
          <GatherableTable data={sea.gatherable} />
        </Grid>
      )}
    </Grid>
  );
}
