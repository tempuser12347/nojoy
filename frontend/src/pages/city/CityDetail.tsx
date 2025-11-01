import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Grid } from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";

interface City {
  id: number;
  name: string;
  region: string;
  sea_area: string;
  culture: string;
  language: string;
  description: string;
  map_image_point_x: string;
  map_image_point_y: string;
  city_coord_x: string;
  city_coord_y: string;
  category: string;
  port_enter_permission: string;
  entry_point: string;
  facility: string;
  flag_quest_id: string;
  investment_amount: string;
  investment_reward: string;
  transaction_amount: string;
  transaction_reward: string;
  fishing: string;
}

export default function CityDetail({ data }: { data: City }) {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City>(data);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const response = await api.get(`/api/cities/${id}`);
        setCity(response.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchCity();
    }
  }, [id, data]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="지역" value={city.region} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="해역" value={city.sea_area} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="문화권" value={city.culture} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="언어" value={city.language} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={city.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="카테고리" value={city.category} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="입항허가" value={city.port_enter_permission} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="진입로" value={city.entry_point} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="시설" value={city.facility} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="투자액" value={city.investment_amount} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="투자보상" value={city.investment_reward} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="거래액" value={city.transaction_amount} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="거래보상" value={city.transaction_reward} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="낚시" value={city.fishing} />
      </Grid>
    </Grid>
  );
}
