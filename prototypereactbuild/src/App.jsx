import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './login';
import MainScreen from './MainScreen';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
