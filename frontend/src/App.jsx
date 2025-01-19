import React, { useState } from 'react';
import { Loader2, Upload, Download } from 'lucide-react';
// import reactLogo from './assets/react.svg'
import viteLogo from './assets/logo.png'
import './App.css'
import ImageCompressor from './ImageCompressor'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="App">
      <ImageCompressor />
    </div>
    </>
  )
}

export default App
