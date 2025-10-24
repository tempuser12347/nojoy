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
import NpcSaleDetail from "../npcsale/NpcSaleDetail";
import RegionDetail from "../region/RegionDetail";
import TreasureBoxDetail from "../treasurebox/TreasureBoxDetail";
import FieldDetail from "../field/FieldDetail";
import SeaDetail from "../sea/SeaDetail";
import CultureDetail from "../culture/CultureDetail";
import PrivateFarmDetail from "../privatefarm/PrivateFarmDetail";
import NationDetail from "../nation/NationDetail";
import PortPermitDetail from "../portpermit/PortPermitDetail";
import LandNpcDetail from "../landnpc/LandNpcDetail";
import MarineNpcDetail from "../marinenpc/MarineNpcDetail";
import GanadorDetail from "../ganador/GanadorDetail";
import CityNpcDetail from "../citynpc/CityNpcDetail";
import SkillRefinementEffectDetail from "../skillrefinementeffect/SkillRefinementEffectDetail";
import ResearchDetail from "../research/ResearchDetail";
import MajorDetail from "../major/MajorDetail";
import ResearchActionDetail from "../researchaction/ResearchActionDetail";
import TechniqueDetail from "../technique/TechniqueDetail";
import TitleDetail from "../title/TitleDetail";
import CourtRankDetail from "../courtrank/CourtRankDetail";
import AideDetail from "../aide/AideDetail";
import PetDetail from "../pet/PetDetail";
import ShipMaterialDetail from "../shipmaterial/ShipMaterialDetail";
import ShipSkillDetail from "../shipskill/ShipSkillDetail";
import ShipBaseMaterialDetail from "../shipbasematerial/ShipBaseMaterialDetail";
import GradePerformanceDetail from "../gradeperformance/GradePerformanceDetail";
import GradeBonusDetail from "../gradebonus/GradeBonusDetail";
import CannonDetail from "../cannon/CannonDetail";
import StuddingSailDetail from "../studdingsail/StuddingSailDetail";
import FigureheadDetail from "../figurehead/FigureheadDetail";
import ExtraArmorDetail from "../extraarmor/ExtraArmorDetail";
import SpecialEquipmentDetail from "../specialequipment/SpecialEquipmentDetail";
import SailorEquipmentDetail from "../sailorequipment/SailorEquipmentDetail";
import CrestDetail from "../crest/CrestDetail";
import ShipDecorDetail from "../shipdecor/ShipDecorDetail";
import FurnitureDetail from "../furniture/FurnitureDetail";

const componentMapping: { [key: string]: React.ComponentType<any> } = {
  certificate: CertificateDetail,
  city: CityDetail,
  consumable: ConsumableDetail,
  discovery: DiscoveryDetail,
  equipment: EquipmentDetail,
  job: JobDetail,
  quest: QuestDetail,
  recipe: RecipeDetail,
  recipebook: RecipeBookDetail,
  ship: ShipDetail,
  shipwreck: ShipwreckDetail,
  tradegoods: TradegoodDetail,
  treasuremap: TreasureMapDetail,
  skill: SkillDetail,
  sellernpc: NpcSaleDetail,
  region: RegionDetail,
  treasurebox: TreasureBoxDetail,
  field: FieldDetail,
  sea: SeaDetail,
  culture: CultureDetail,
  privatefarm: PrivateFarmDetail,
  nation: NationDetail,
  portpermit: PortPermitDetail,
  landnpc: LandNpcDetail,
  marinenpc: MarineNpcDetail,
  ganador: GanadorDetail,
  citynpc: CityNpcDetail,
  skillrefinementeffect: SkillRefinementEffectDetail,
  research: ResearchDetail,
  major: MajorDetail,
  researchaction: ResearchActionDetail,
  technique: TechniqueDetail,
  title: TitleDetail,
  courtrank: CourtRankDetail,
  aide: AideDetail,
  pet: PetDetail,
  shipmaterial: ShipMaterialDetail,
  shipskill: ShipSkillDetail,
  shipbasematerial: ShipBaseMaterialDetail,
  gradeperformance: GradePerformanceDetail,
  gradebonus: GradeBonusDetail,
  cannon: CannonDetail,
  studdingsail: StuddingSailDetail,
  figurehead: FigureheadDetail,
  extraarmor: ExtraArmorDetail,
  specialequipment: SpecialEquipmentDetail,
  sailorequipment: SailorEquipmentDetail,
  crest: CrestDetail,
  shipdecor: ShipDecorDetail,
  furniture: FurnitureDetail,
};

export default function ObjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [type, setType] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await api.get(`/api/obj/${id}`);
        console.log(response.data);
        setData(response.data.data);
        setType(response.data.type);
        response.data.msg ? setMsg(response.data.msg) : setMsg(null);
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
  if (data == null && type == null && msg == "not in allData") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">object id not exist in allData</Typography>
      </Box>
    );
  }

  if (data == null && type == null && msg == "no detail found") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          object id exist but no detail found
        </Typography>
      </Box>
    );
  }

  if (!data || !type) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>object not found</Typography>
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
