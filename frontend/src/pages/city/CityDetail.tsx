import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Card, CardContent } from "@mui/material";
import api from "../../api";

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {city.name}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                지역
              </Typography>
              <Typography variant="body1">{city.region}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                해역
              </Typography>
              <Typography variant="body1">{city.sea_area}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                문화권
              </Typography>
              <Typography variant="body1">{city.culture}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                언어
              </Typography>
              <Typography variant="body1">{city.language}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                설명
              </Typography>
              <Typography variant="body1">{city.description}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                카테고리
              </Typography>
              <Typography variant="body1">{city.category}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                입항허가
              </Typography>
              <Typography variant="body1">
                {city.port_enter_permission}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                진입로
              </Typography>
              <Typography variant="body1">{city.entry_point}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                시설
              </Typography>
              <Typography variant="body1">{city.facility}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                투자액
              </Typography>
              <Typography variant="body1">{city.investment_amount}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                투자보상
              </Typography>
              <Typography variant="body1">{city.investment_reward}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                거래액
              </Typography>
              <Typography variant="body1">{city.transaction_amount}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                거래보상
              </Typography>
              <Typography variant="body1">{city.transaction_reward}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                낚시
              </Typography>
              <Typography variant="body1">{city.fishing}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
