import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FairsPage from './presentation/pages/FairsPage';
import FairBooksPage from './presentation/pages/FairBooksPage';
import FairDetailPage from './presentation/pages/FairDetailPage';


function App() {
  return (
    <Router>
      <div className="container app-shell">
        <Routes>
          <Route path="/" element={<FairsPage />} />
          <Route path="/fair/:id" element={<FairDetailPage />} />
          <Route path="/fairs/:fairId/books" element={<FairBooksPage />} />
          <Route path="/fair/:id" element={<FairDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
