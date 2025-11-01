import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { renderObjectChip, renderObjectsToChips } from "../../common/render";

interface CityNpc {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  city: { id: number; name: string } | null;
  preferential_report: string | null;
  skills: { id: number; name: string }[] | null;
  tarot_cards: { id: number; name: string }[] | null;
  gifts:
    | {
        id: number;
        name: string;
        extraname?: string;
        quantity?: number;
        종류?: string;
      }[]
    | null;
}

export default function CityNpcDetail({ data }: { data?: CityNpc }) {
  const { id } = useParams<{ id: string }>();
  const [cityNpc, setCityNpc] = useState<CityNpc | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCityNpc = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/citynpcs/${id}`);
        setCityNpc(response.data);
      } catch (err) {
        setError("Failed to load City NPC details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchCityNpc();
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

  if (!cityNpc) {
    return <Typography sx={{ p: 3 }}>City NPC not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={cityNpc.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="도시"
          value={cityNpc.city ? renderObjectChip(cityNpc.city, navigate) : null}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="우대 보고"
          value={cityNpc.preferential_report}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem
          label="스킬"
          value={
            cityNpc.skills
              ? renderObjectsToChips(cityNpc.skills, navigate)
              : null
          }
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem
          label="타로 카드"
          value={
            cityNpc.tarot_cards
              ? renderObjectsToChips(cityNpc.tarot_cards, navigate)
              : null
          }
        />
      </Grid>
      {cityNpc.gifts && cityNpc.gifts.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            선물
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>종류</TableCell>
                  <TableCell>아이템</TableCell>
                  <TableCell>수량</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(
                  cityNpc.gifts.reduce((acc, gift) => {
                    const type = gift.종류 || "기타";
                    if (!acc[type]) {
                      acc[type] = [];
                    }
                    acc[type].push(gift);
                    return acc;
                  }, {} as Record<string, typeof cityNpc.gifts>)
                ).map(([type, giftsInType]) =>
                  giftsInType.map((gift, index) => (
                    <TableRow key={gift.id}>
                      {index === 0 && (
                        <TableCell rowSpan={giftsInType.length}>
                          {type}
                        </TableCell>
                      )}
                      <TableCell>
                        <Link to={`/obj/${gift.id}`}>
                          {gift.name}
                          {gift.extraname && ` ${gift.extraname}`}
                        </Link>
                      </TableCell>
                      <TableCell>{gift.quantity}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
}
