import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Tab, Box, Menu, MenuItem } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const sections = {
  발견물: [
    "발견물",
    "퀘스트",
    "보물지도",
    "침몰선",
    "유적던전",
    "레거시 테마",
    "레거시",
    "레거시 피스",
    "트레져 헌트 테마",
    "렐릭",
    "렐릭 피스",
    "논전 콤보",
    "메모리얼 앨범",
    "발견물 우대보고",
  ],
  아이템: [
    "장비품",
    "교역품",
    "소비품",
    "추천장",
    "가구",
    "장식품",
    "타로카드",
    "레시피책",
    "레시피",
    "변성 연금",
    "아이템 효과",
    "장비효과",
    "장식품 설치 효과",
    "가호",
    "황제 선거 콤보 보상",
    "아이템 샵",
    "트레져박스",
  ],
  선박: [
    "선박",
    "선박 재료",
    "선박스킬",
    "선박 기본 재질",
    "그레이드 성능",
    "그레이드 보너스",
    "대포",
    "보조돛",
    "선수상",
    "추가장갑",
    "특수장비",
    "선원 장비",
    "문장",
    "선박 데코",
    "돛 도료",
  ],
  캐릭터: [
    "스킬",
    "스킬 연성 효과",
    "연구",
    "전공",
    "연구 행동",
    "테크닉",
    "직업",
    "호칭",
    "작위",
    "부관",
    "애완동물",
  ],
  NPC: ["육상 npc", "해상 npc", "가나돌", "도시 인물", "판매 npc"],
  세계: [
    "이벤트",
    "역사적 사건",
    "지역",
    "필드",
    "해역",
    "도시",
    "개인 농장",
    "국가",
    "문화",
    "입항허가",
    "정기선",
  ],
};

const availableSections = [
  "발견물",
  "퀘스트",
  "보물지도",
  "침몰선",
  "유적던전",
  "레거시 테마",
  "레거시",
  "레거시 피스",
  "트레져 헌트 테마",
  "렐릭",
      "렐릭 피스",
      "논전 콤보",
      "메모리얼 앨범",  "장비품",
  "선박",
  "선박 재료",
  "선박스킬",
            "선박 기본 재질",
            "그레이드 성능",
            "그레이드 보너스",
            "대포",
            "보조돛",
            "선수상",
            "추가장갑",
            "특수장비",
            "선원 장비",
            "문장",
            "선박 데코",
            "직업",  "도시",
  "교역품",
  "추천장",
  "가구",
  "장식품",
  "타로카드",
  "소비품",
  "레시피책",
  "레시피",
  "변성 연금",
  "아이템 효과",
  "장비효과",
  "장식품 설치 효과",
  "가호",
  "스킬",
  "스킬 연성 효과",
  "연구",
  "전공",
  "연구 행동",
  "테크닉",
  "호칭",
          "작위",
          "부관",
          "애완동물",
          "판매 npc",
          "지역",
          "필드",
          "해역",
          "문화",
          "개인 농장",
          "국가",
          "입항허가",
          "육상 npc",
          "해상 npc",
          "가나돌",
          "도시 인물",
          "트레져박스",
      ];
      
      const Navigation: React.FC = () => {
        const navigate = useNavigate();
        const location = useLocation();
        const [value, setValue] = React.useState(0);
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const [openSection, setOpenSection] = React.useState<string | null>(null);
      
        const handleChange = (event: React.SyntheticEvent, newValue: number) => {
          const section = Object.keys(sections)[newValue];
      
          // If clicking the same tab when menu is closed, open it
          if (value === newValue && !anchorEl) {
            console.log("same tab, open menu");
            handleOpenMenu(event as React.MouseEvent<HTMLElement>, section);
          }
          // If clicking a different tab, or if menu is already open, update everything
          else {
            setValue(newValue);
            handleOpenMenu(event as React.MouseEvent<HTMLElement>, section);
          }
        };
      
        const handleOpenMenu = (
          event: React.MouseEvent<HTMLElement>,
          section: string
        ) => {
          setAnchorEl(event.currentTarget);
          setOpenSection(section);
        };
      
        const handleCloseMenu = () => {
          setAnchorEl(null);
          setOpenSection(null);
        };
      
        const handleSubsectionClick = (subsection: string) => {
          handleCloseMenu();
      
          // case with subsection to switch values to korean
          switch (subsection) {
            case "스킬":
              subsection = "skills";
              break;
            case "판매 npc":
              subsection = "npcsales";
              break;
            case "지역":
              subsection = "region";
              break;
            case "필드":
              subsection = "field";
              break;
            case "해역":
              subsection = "sea";
              break;
            case "문화":
              subsection = "culture";
              break;
            case "개인 농장":
              subsection = "privatefarm";
              break;
            case "국가":
              subsection = "nation";
              break;
            case "입항허가":
              subsection = "portpermit";
              break;
            case "육상 npc":
              subsection = "landnpc";
              break;
            case "해상 npc":
              subsection = "marinenpc";
              break;
            case "가나돌":
              subsection = "ganador";
              break;
            case "도시 인물":
              subsection = "citynpc";
              break;
            case "스킬 연성 효과":
              subsection = "skillrefinementeffects";
              break;
            case "연구":
              subsection = "researches";
              break;
            case "전공":
              subsection = "majors";
              break;
            case "연구 행동":
              subsection = "researchactions";
              break;
            case "테크닉":
              subsection = "techniques";
              break;
            case "호칭":
              subsection = "titles";
              break;
            case "작위":
              subsection = "courtranks";
              break;
            case "트레져박스":
              subsection = "treasurebox";
              break;
            case "부관":
              subsection = "aides";
              break;
            case "애완동물":
              subsection = "pets";
              break;
            case "선박 재료":
              subsection = "shipmaterials";
              break;
            case "선박스킬":
              subsection = "shipskills";
              break;
            case "선박 기본 재질":
              subsection = "shipbasematerials";
              break;
            case "그레이드 성능":
              subsection = "gradeperformances";
              break;
            case "그레이드 보너스":
              subsection = "gradebonuses";
              break;
            case "대포":
              subsection = "cannons";
              break;
            case "보조돛":
              subsection = "studdingsails";
              break;
            case "선수상":
              subsection = "figureheads";
              break;
            case "추가장갑":
              subsection = "extraarmors";
              break;
            case "특수장비":
              subsection = "specialequipments";
              break;
            case "선원 장비":
              subsection = "sailorequipments";
              break;
            case "문장":
              subsection = "crests";
              break;
            case "선박 데코":
              subsection = "shipdecors";
              break;
            case "추천장":
              subsection = "certificates";
              break;
            case "가구":
              subsection = "furnitures";
              break;
            case "장식품":
              subsection = "ornaments";
              break;
            case "레시피":
              subsection = "recipes";
              break;
            case "변성 연금":
              subsection = "transmutations";
              break;
            case "아이템 효과":
              subsection = "itemeffects";
              break;
            case "장비효과":
              subsection = "equippedeffects";
              break;
            case "장식품 설치 효과":
              subsection = "installationeffects";
              break;
            case "침몰선":
              subsection = "shipwrecks";
              break;
            case "유적던전":
              subsection = "dungeons";
              break;
            case "레거시 테마":
              subsection = "legacythemes";
              break;
            case "레거시":
              subsection = "legacies";
              break;
            case "레거시 피스":
              subsection = "legacyclues";
              break;
            case "트레져 헌트 테마":
              subsection = "treasurehuntthemes";
              break;
            case "렐릭":
              subsection = "relics";
              break;
            case "렐릭 피스":
              subsection = "relicpieces";
              break;
            case "메모리얼 앨범":
              subsection = "memorialalbums";
              break;
            case "논전 콤보":
              subsection = "debatecombos";
              break;
            default:
              break;
          }
      
          navigate(`/${subsection}`);
        };  React.useEffect(() => {
    // Update the tab value based on the current route
    const path = location.pathname.substring(1);
    const index = Object.keys(sections).findIndex(
      (section) => section.toLowerCase() === path
    );
    if (index !== -1) {
      setValue(index);
    }
  }, [location]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Tabs
        value={value}
        sx={{
          minHeight: 64,
          "& .MuiTab-root": {
            color: "white",
            opacity: 0.7,
            "&.Mui-selected": {
              opacity: 1,
              color: "white",
              fontWeight: "bold",
            },
          },
        }}
      >
        {Object.keys(sections).map((section, index) => (
          <Tab
            onClick={(e) => handleChange(e, index)}
            key={index}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {section}
                <ArrowDropDownIcon sx={{ ml: 0.5 }} />
              </Box>
            }
          />
        ))}
      </Tabs>
      {Object.keys(sections).map((section) => (
        <Menu
          key={section}
          anchorEl={anchorEl}
          open={openSection === section}
          onClose={handleCloseMenu}
          MenuListProps={{
            "aria-labelledby": `${section}-button`,
          }}
          sx={{ mt: 1 }}
        >
          {sections[section as keyof typeof sections].map((subsection) => (
            <MenuItem
              disabled={!availableSections.includes(subsection)}
              key={subsection}
              onClick={() => handleSubsectionClick(subsection)}
            >
              {subsection}
            </MenuItem>
          ))}
        </Menu>
      ))}
    </Box>
  );
};

export default Navigation;
