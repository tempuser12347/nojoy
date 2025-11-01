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
import OrnamentDetail from "../ornament/OrnamentDetail";
import TarotCardDetail from "../tarotcard/TarotCardDetail";
import TransmutationDetail from "../transmutation/TransmutationDetail";
import ItemEffectDetail from "../itemeffect/ItemEffectDetail";
import EquippedEffectDetail from "../equippedeffect/EquippedEffectDetail";
import ProtectionDetail from "../protection/ProtectionDetail";
import InstallationEffectDetail from "../installationeffect/InstallationEffectDetail";
import DungeonDetail from "../dungeon/DungeonDetail";
import LegacyThemeDetail from "../legacytheme/LegacyThemeDetail";
import LegacyDetail from "../legacy/LegacyDetail";
import LegacyClueDetail from "../legacyclue/LegacyClueDetail";
import TreasureHuntThemeDetail from "../treasurehunttheme/TreasureHuntThemeDetail";
import RelicDetail from "../relic/RelicDetail";
import RelicPieceDetail from "../relicpiece/RelicPieceDetail";
import MemorialAlbumDetail from "../memorialalbum/MemorialAlbumDetail";
import DebateComboDetail from "../debatecombo/DebateComboDetail";
import DetailPageTitle from "../../components/DetailPageTitle";

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
  ornament: OrnamentDetail,
  tarotcard: TarotCardDetail,
  transmutation: TransmutationDetail,
  itemeffect: ItemEffectDetail,
  equippedeffect: EquippedEffectDetail,
  protection: ProtectionDetail,
  installationeffect: InstallationEffectDetail,
  dungeon: DungeonDetail,
  legacytheme: LegacyThemeDetail,
  legacy: LegacyDetail,
  legacyclue: LegacyClueDetail,
  treasurehunttheme: TreasureHuntThemeDetail,
  relic: RelicDetail,
  relicpiece: RelicPieceDetail,
  memorialalbum: MemorialAlbumDetail,
  debatecombo: DebateComboDetail,
};

const typeNameMapping: { [key: string]: string } = {
  certificate: '추천장',
  city: '도시',
  consumable: '소비품',
  discovery: '발견물',
  equipment: '장비품',
  job: '직업',
  quest: '퀘스트',
  recipe: '레시피',
  recipebook: '레시피북',
  ship: '선박',
  shipwreck: '침몰선',
  tradegoods: '교역품',
  treasuremap: '보물지도',
  skill: '스킬',
  sellernpc: '판매NPC',
  region: '지역',
  treasurebox: '트레쳐박스',
  field: '필드',
  sea: '해역',
  culture: '문화',
  privatefarm: '개인농장',
  nation: '국가',
  portpermit: '입항허가증',
  landnpc: '육상 NPC',
  marinenpc: '해상 NPC',
  ganador: '가나돌',
  citynpc: '도시 NPC',
  skillrefinementeffect: '스킬 연성 효과',
  research: '연구',
  major: '전공',
  researchaction: '연구 행동',
  technique: '테크닉',
  title: '칭호',
  courtrank: '작위',
  aide: '부관',
  pet: '애완동물',
  shipmaterial: '선박 재료',
  shipskill: '선박스킬',
  shipbasematerial: '선박 기본 재료',
  gradeperformance: '그레이드 성능',
  gradebonus: '그레이드 보너스',
  cannon: '대포',
  studdingsail: '보조돛',
  figurehead: '선수상',
  extraarmor: '추가 장갑',
  specialequipment: '특수 장비',
  sailorequipment: '선원 장비',
  crest: '문장',
  shipdecor: '선박데코',
  furniture: "가구",
  ornament: "장식품",
  tarotcard: '타로카드',
  transmutation: '변성연금',
  itemeffect: '아이템 효과',
  equippedeffect: '장비효과',
  protection: '가호',
  installationeffect: '장식품 설치 효과',
  dungeon: '던전',
  legacytheme: '레거시테마',
  legacy: '레거시',
  legacyclue: '레거시피스',
  treasurehunttheme: '트레져헌트 테마',
  relic: '렐릭',
  relicpiece: '렐릭피스',
  memorialalbum: '메모리얼 앨범',
  debatecombo: '논전콤보',
};

const fetchTitleName = (data: any, type: string)=>{
  if(data.name){
    return data.name;
  }
  if(type=='sellernpc'){
    return data.npc;
  }
  return null
}

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

  return <Box sx={{width: '100%', p: 3 }}>
    <DetailPageTitle title={fetchTitleName(data, type)} typename={typeNameMapping[type]} />
<DetailComponent data={data} type={typeNameMapping[type]} />
    </Box>;
}
