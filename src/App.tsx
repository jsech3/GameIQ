import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Pricecheck } from './games/pricecheck/Pricecheck';
import { Trend } from './games/trend/Trend';
import { Rank } from './games/rank/Rank';
import { Crossfire } from './games/crossfire/Crossfire';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricecheck" element={<Pricecheck />} />
        <Route path="/trend" element={<Trend />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/crossfire" element={<Crossfire />} />
      </Routes>
    </Layout>
  );
}
