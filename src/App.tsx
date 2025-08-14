import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import WireframeEditor from './pages/WireframeEditor';
import DesignGenerator from './pages/DesignGenerator';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="bcu-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wireframe" element={<WireframeEditor />} />
            <Route path="/generate" element={<DesignGenerator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
