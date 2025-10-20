import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Discoveries from "./pages/discovery/Discoveries";
import Quests from "./pages/quest/Quests";
import Cities from "./pages/city/Cities";
import Recipes from "./pages/recipe/Recipes";
import Shipwrecks from "./pages/shipwreck/Shipwrecks";
import Ships from "./pages/ship/Ships";
import Consumables from "./pages/consumable/Consumables";
import TreasureMaps from "./pages/treasuremap/TreasureMaps";
import Jobs from "./pages/job/Jobs";
import Equipments from "./pages/equipment/Equipments";
import Tradegoods from "./pages/tradegood/Tradegoods";
import Certificates from "./pages/certificate/Certificates";
import Recipebooks from "./pages/recipebook/RecipeBooks";
import NotFound from "./pages/NotFound";
import ObjectDetail from "./pages/object/ObjectDetail";
import Skills from "./pages/skill/Skills";
import NpcSales from "./pages/npcsale/NpcSales";
import Regions from "./pages/region/Regions";
import TreasureBoxes from "./pages/treasurebox/TreasureBoxes";
import Fields from "./pages/field/Fields";
import Seas from "./pages/sea/Seas";
import Cultures from "./pages/culture/Cultures";
import PrivateFarms from "./pages/privatefarm/PrivateFarms";
import Nations from "./pages/nation/Nations";
import PortPermits from "./pages/portpermit/PortPermits";
import LandNpcs from "./pages/landnpc/LandNpcs";
import MarineNpcs from "./pages/marinenpc/MarineNpcs";
import Ganadors from "./pages/ganador/Ganadors";
import CityNpcs from "./pages/citynpc/CityNpcs";
import SkillRefinementEffects from "./pages/skillrefinementeffect/SkillRefinementEffects";
import Researches from "./pages/research/Researches";
import Majors from "./pages/major/Majors";
import ResearchActions from "./pages/researchaction/ResearchActions";
import Techniques from "./pages/technique/Techniques";
import Titles from "./pages/title/Titles";
import CourtRanks from "./pages/courtrank/CourtRanks";
import Aides from "./pages/aide/Aides";
import Pets from "./pages/pet/Pets";
import ShipMaterials from "./pages/shipmaterial/ShipMaterials";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/발견물" element={<Discoveries />} />
              <Route path="/퀘스트" element={<Quests />} />
              <Route path="/도시" element={<Cities />} />
              <Route path="/레시피" element={<Recipes />} />
              <Route path="/침몰선" element={<Shipwrecks />} />
              <Route path="/소비품" element={<Consumables />} />
              <Route path="/선박" element={<Ships />} />
              <Route path="/보물지도" element={<TreasureMaps />} />
              <Route path="/직업" element={<Jobs />} />
              <Route path="/장비품" element={<Equipments />} />
              <Route path="/교역품" element={<Tradegoods />} />
              <Route path="/추천장" element={<Certificates />} />
              <Route path="/레시피책" element={<Recipebooks />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/npcsales" element={<NpcSales />} />
              <Route path="/region" element={<Regions />} />
              <Route path="/treasurebox" element={<TreasureBoxes />} />
              <Route path="/field" element={<Fields />} />
              <Route path="/sea" element={<Seas />} />
              <Route path="/culture" element={<Cultures />} />
              <Route path="/privatefarm" element={<PrivateFarms />} />
              <Route path="/nation" element={<Nations />} />
              <Route path="/portpermit" element={<PortPermits />} />
              <Route path="/landnpc" element={<LandNpcs />} />
              <Route path="/marinenpc" element={<MarineNpcs />} />
              <Route path="/ganador" element={<Ganadors />} />
              <Route path="/citynpc" element={<CityNpcs />} />
              <Route
                path="/skillrefinementeffects"
                element={<SkillRefinementEffects />}
              />
              <Route path="/researches" element={<Researches />} />
              <Route path="/majors" element={<Majors />} />
              <Route path="/researchactions" element={<ResearchActions />} />
              <Route path="/techniques" element={<Techniques />} />
              <Route path="/titles" element={<Titles />} />
              <Route path="/courtranks" element={<CourtRanks />} />
              <Route path="/aides" element={<Aides />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/shipmaterials" element={<ShipMaterials />} />

              <Route path="/obj/:id" element={<ObjectDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
