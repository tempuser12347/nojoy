import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discoveries from './pages/discovery/Discoveries';
import DiscoveryDetail from './pages/discovery/DiscoveryDetail';
import Quests from './pages/quest/Quests';
import QuestDetail from './pages/quest/QuestDetail';
import Cities from './pages/city/Cities';
import CityDetail from './pages/city/CityDetail';
import Recipes from './pages/recipe/Recipes';
import RecipeDetail from './pages/recipe/RecipeDetail';
import Shipwrecks from './pages/shipwreck/Shipwrecks';
import ShipwreckDetail from './pages/shipwreck/ShipwreckDetail';
import Ships from './pages/ship/Ships';
import Consumables from './pages/consumable/Consumables';
import ConsumableDetail from './pages/consumable/ConsumableDetail';
import ShipDetail from './pages/ship/ShipDetail';
import TreasureMaps from './pages/treasuremap/TreasureMaps';
import TreasureMapDetail from './pages/treasuremap/TreasureMapDetail';
import Jobs from './pages/job/Jobs';
import JobDetail from './pages/job/JobDetail';
import Equipments from './pages/equipment/Equipments';
import EquipmentDetail from './pages/equipment/EquipmentDetail';
import Tradegoods from './pages/tradegood/Tradegoods';
import TradegoodDetail from './pages/tradegood/TradegoodDetail';
import Certificates from './pages/certificate/Certificates';
import CertificateDetail from './pages/certificate/Certificates';
import NotFound from './pages/NotFound';

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
              <Route path="/발견물/:id" element={<DiscoveryDetail />} />
              <Route path="/퀘스트" element={<Quests />} />
              <Route path="/퀘스트/:id" element={<QuestDetail />} />
              <Route path="/도시" element={<Cities />} />
              <Route path="/도시/:id" element={<CityDetail />} />
              <Route path="/레시피" element={<Recipes />} />
              <Route path="/레시피/:id" element={<RecipeDetail />} />
              <Route path="/침몰선" element={<Shipwrecks />} />
              <Route path="/침몰선/:id" element={<ShipwreckDetail />} />
              <Route path="/소비품" element={<Consumables />} />
              <Route path="/소비품/:id" element={<ConsumableDetail />} />
              <Route path="/선박" element={<Ships />} />
              <Route path="/선박/:id" element={<ShipDetail />} />
              <Route path="/보물지도" element={<TreasureMaps />} />
              <Route path="/보물지도/:id" element={<TreasureMapDetail />} />
              <Route path="/직업" element={<Jobs />} />
              <Route path="/직업/:id" element={<JobDetail />} />
              <Route path="/장비품" element={<Equipments />} />
              <Route path="/장비품/:id" element={<EquipmentDetail />} />
              <Route path="/교역품" element={<Tradegoods />} />
              <Route path="/교역품/:id" element={<TradegoodDetail />} />
              <Route path="/추천장" element={<Certificates />} />
              <Route path="/추천장/:id" element={<CertificateDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
