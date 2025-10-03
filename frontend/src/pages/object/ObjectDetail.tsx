import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import api from "../../api";

import CertificateDetail from "../certificate/CertificateDetail";
import CityDetail from "../city/CityDetail";
import ConsumableDetail from "../consumable/ConsumableDetail";
import DiscoveryDetail from "../discovery/DiscoveryDetail";
import EquipmentDetail from "../equipment/EquipmentDetail";
import JobDetail from "../job/JobDetail";
import QuestDetail from "../quest/QuestDetail";
import RecipeDetail from "../recipe/RecipeDetail";
import RecipeBookDetail from "../recipebook/RecipeBookDetail";
import ShipDetail from "../ship/ShipDetail";
import ShipwreckDetail from "../shipwreck/ShipwreckDetail";
import TradegoodDetail from "../tradegood/TradegoodDetail";
import TreasureMapDetail from "../treasuremap/TreasureMapDetail";
import SkillDetail from "../skill/SkillDetail";

const componentMapping: { [key: string]: React.ComponentType<any> } = {
  certificate: CertificateDetail,
  city: CityDetail,
  consumable: ConsumableDetail,
  discovery: DiscoveryDetail,
  equipment: EquipmentDetail,
  job: JobDetail,
  quest: QuestDetail,
  recipe: RecipeDetail,
  recipeBook: RecipeBookDetail,
  ship: ShipDetail,
  shipwreck: ShipwreckDetail,
  tradeGoods: TradegoodDetail,
  treasuremap: TreasureMapDetail,
  skill: SkillDetail,
};

export default function ObjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [type, setType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await api.get(`/api/obj/${id}`);
        setData(response.data.data);
        setType(response.data.type);
      } catch (err) {
        setError("Failed to load object details");
        console.error("Error fetching object:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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

  if (!data || !type) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Object not found.</Typography>
      </Box>
    );
  }

  const DetailComponent = componentMapping[type];

  if (!DetailComponent) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>no detail page found for type: {type}</Typography>
      </Box>
    );
  }

  return <DetailComponent data={data} />;
}
