import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Tempo } from './games/tempo/Tempo';
import { OddAngle } from './games/odd-angle/OddAngle';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tempo" element={<Tempo />} />
        <Route path="/odd-angle" element={<OddAngle />} />
      </Routes>
    </Layout>
  );
}
