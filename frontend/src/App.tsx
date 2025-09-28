import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discoveries from './pages/Discoveries';
import DiscoveryDetail from './pages/DiscoveryDetail';
import Quests from './pages/Quests';
import QuestDetail from './pages/QuestDetail';
import Cities from './pages/Cities';
import CityDetail from './pages/CityDetail';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Shipwrecks from './pages/Shipwrecks';
import ShipwreckDetail from './pages/ShipwreckDetail';
import Ships from './pages/Ships';
import Consumables from './pages/Consumables';
import ConsumableDetail from './pages/ConsumableDetail';
import ShipDetail from './pages/ShipDetail';
import TreasureMaps from './pages/TreasureMaps';
import TreasureMapDetail from './pages/TreasureMapDetail';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
