import {
  Box,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  CircularProgress,
  Chip,
  Grid,
  TableBody,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";
import DetailItem from "../../components/DetailItem";

interface Discovery {
  id: number;
  type: string;
  name: string;
  additional_name: string | null;
  name_key: string | null;
  description: string;
  category: string;
  difficulty: number;
  card_points: number;
  discovery_experience: number;
  card_acquisition_experience: number;
  report_reputation: number;
  discovery_method: string;
  discovery_location: { id: number; name: string }[] | null;
  discovery_rank: string;
  additional_description: string | null;
  era: string | null;
  time_period: string | null;
  weather: string | null;
  coordinates: string | null;
}


const generateDiscoveryLocationPrefixString = (
  method: string,
  era: string | null,
  time_period: string | null
) => {
  if (method) {
    method = "[" + method + "]";
  }
  let obj_arr = [method, era, time_period];
  // filterout null or empty string or undefined vlaues
  return obj_arr
    .filter((x) => x != null)
    .filter((x) => x != "")
    .filter((x) => x != undefined)
    .join(" ");
};

const generateDiscoveryLocationSuffixString = (
  additional_description: string | null,
  discovery_rank: string | null
) => {
  let outstr = "";
  if (additional_description) {
    outstr = " " + additional_description;
  }
  if (discovery_rank) {
    outstr += " (" + discovery_rank + ")";
  }
  return outstr;
};

export default function DiscoveryDetail({ data }: { data?: Discovery }) {
  const { id } = useParams();
  const [discovery, setDiscovery] = useState<Discovery | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscovery = async () => {
      try {
        setError(null);
        const response = await api.get(`/api/discoveries/${id}`);
        console.log(response.data);
        setDiscovery(response.data);
      } catch (error: any) {
        setError(
          error.response?.data?.detail || "Failed to fetch discovery data"
        );
        setDiscovery(null);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchDiscovery();
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

  if (!discovery) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Discovery not found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} >
      <Grid size={{ xs: 12 }}>

        <DetailItem label="설명" value={discovery.description} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem
          label="추가 설명"
          value={discovery.additional_description}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="카테고리" value={discovery.category} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="난이도" value={discovery.difficulty} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TableContainer component={Paper}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>발견 경험치</TableCell>
                <TableCell>카드 포인트</TableCell>
                <TableCell>보고 평판</TableCell>
                <TableCell>좌표</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{discovery.discovery_experience}</TableCell>
                <TableCell>{discovery.card_points}</TableCell>
                <TableCell>{discovery.report_reputation}</TableCell>
                <TableCell>{discovery.coordinates}</TableCell>
              </TableRow>
            </TableBody>

          </Table>
        </TableContainer>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <DetailItem
          label="발견방법"
          value={
            <>
              {generateDiscoveryLocationPrefixString(
                discovery.discovery_method,
                discovery.era,
                discovery.time_period
              )}{" "}
              {discovery.discovery_location?.map((a, idx) => (
                <Chip
                  key={idx}
                  label={a.name}
                  clickable
                  onClick={() => navigate(`/obj/${a.id}`)}
                  sx={{ mr: 1 }}
                />
              ))}
              {generateDiscoveryLocationSuffixString(
                discovery.additional_description,
                discovery.discovery_rank
              ) || null}
            </>
          }
        />
      </Grid>

    </Grid>
  );
}
