import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // ✅ Import these
import ImageCompressor from './ImageCompressor';
import MergePdf from './components/MergePdfs'; // ✅ Make sure this component exists
import viteLogo from './assets/logo.png';
import './App.css';
import { Home } from 'lucide-react';
import HomePage from './components/HomePage';
import PDFProcessor from './components/SplitPdfs';


function App() {


  return (
    
    <BrowserRouter>
      <Routes>
        <Route path='/split' element={<PDFProcessor/>}></Route>
        <Route path="/" element={<HomePage />} />
        <Route path="/compress" element={<ImageCompressor />} />
        <Route path="/merge" element={<MergePdf />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
