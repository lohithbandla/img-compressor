import React, { useState, useRef } from 'react';
import { Upload, Scissors, Info, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import './SplitPdfs.css'


const PDFProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [splitResult, setSplitResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const splitFileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
      getFileInfo(file);
    } else {
      setError('Please select a valid PDF file');
      setSelectedFile(null);
      setFileInfo(null);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (type === 'info') {
      handleFileSelect(file);
    } else if (type === 'split') {
      handleSplitFileSelect(file);
    }
  };

  const handleSplitFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
      getFileInfo(file);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const getFileInfo = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://img-compressor.onrender.com/file-info', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const info = await response.json();
        setFileInfo(info);
        if (info.pageCount) {
          setEndPage(info.pageCount);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to get file information');
      }
    } catch (err) {
      console.error('File info error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const splitPDF = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setSplitResult(null);
    console.log('Splitting PDF:', selectedFile.name, 'Pages:', startPage, 'to', endPage);
    
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('startPage', startPage.toString());
    formData.append('endPage', endPage.toString());

    try {
      const response = await fetch('https://img-compressor.onrender.com/split-pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSplitResult(result);
        setError('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Split PDF error:', response.status, errorData);
        setError(errorData.error || `HTTP ${response.status}: Failed to split PDF`);
      }
    } catch (err) {
      console.error('Split PDF network error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      

      <div className="header">
        <FileText className="logo react spinning" size={64} />
        <h1 className="title">PDF Processor</h1>
        <p className="subtitle">Split PDFs and get file information with ease</p>
      </div>

      <div className="main-content">
        {error && (
          <div className="alert error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {splitResult && (
          <div className="alert success">
            <CheckCircle size={20} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                {splitResult.message}
              </div>
              <a
                href={`https://img-compressor.onrender.com/${splitResult.splitFileUrl}`}
                download
                className="download-btn"
              >
                <Download size={16} />
                Download Split PDF
              </a>
            </div>
          </div>
        )}

        <div className="card-grid">
          {/* File Info Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">
                <Info size={24} />
              </div>
              <h2 className="card-title">File Information</h2>
            </div>

            <div
              className={`upload-area ${dragOver ? 'dragover' : ''} ${selectedFile ? 'has-file' : ''}`}
              onDrop={(e) => handleDrop(e, 'info')}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="upload-icon" size={48} />
              <p className="upload-text">
                {selectedFile ? selectedFile.name : 'Drop PDF here or click to browse'}
              </p>
              <p className="upload-subtext">
                {selectedFile ? 'File selected' : 'Supports PDF files only'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                className="file-input"
              />
            </div>

            {fileInfo && (
              <div className="file-info">
                <h3>File Details:</h3>
                <div className="info-row">
                  <span className="info-label">Filename:</span>
                  <span className="info-value">{fileInfo.filename}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Size:</span>
                  <span className="info-value">
                    {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{fileInfo.mimetype}</span>
                </div>
                {fileInfo.pageCount && (
                  <div className="info-row">
                    <span className="info-label">Pages:</span>
                    <span className="info-value">{fileInfo.pageCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PDF Split Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">
                <Scissors size={24} />
              </div>
              <h2 className="card-title">Split PDF</h2>
            </div>

            <div
              className={`upload-area ${selectedFile ? 'has-file' : ''}`}
              onDrop={(e) => handleDrop(e, 'split')}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => splitFileInputRef.current?.click()}
            >
              <Upload className="upload-icon" size={48} />
              <p className="upload-text">
                {selectedFile ? selectedFile.name : 'Select PDF to split'}
              </p>
              <input
                ref={splitFileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleSplitFileSelect(e.target.files?.[0])}
                className="file-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Page</label>
                <input
                  type="number"
                  min="1"
                  max={fileInfo?.pageCount || 999}
                  value={startPage}
                  onChange={(e) => setStartPage(parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Page</label>
                <input
                  type="number"
                  min={startPage}
                  max={fileInfo?.pageCount || 999}
                  value={endPage}
                  onChange={(e) => setEndPage(e.target.value)}
                  placeholder={fileInfo?.pageCount?.toString() || 'Auto'}
                  className="form-input"
                />
              </div>
            </div>

            <button
              onClick={splitPDF}
              disabled={!selectedFile || loading}
              className="btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Scissors size={20} />
                  Split PDF
                </>
              )}
            </button>

            {fileInfo?.pageCount && (
              <p className="page-info">
                Total pages: {parseInt(endPage) - parseInt(startPage) + 1} | 
                Selected: {startPage} to {endPage || fileInfo.pageCount}
              </p>
            )}
          </div>
        </div>

        <p className="read-the-docs">
          Upload your PDF files to get information or split them into custom page ranges
        </p>
      </div>
      </div>
    
  );
};

export default PDFProcessor;