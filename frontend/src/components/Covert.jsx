import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Image, 
  Zap, 
  Sparkles, 
  Upload, 
  Download, 
  Scissors, 
  FilePlus, 
  Info,
  Check,
  AlertCircle,
  Loader2,
  FileImage,
  Split,
  Settings,
} from 'lucide-react';
import './Convert.css'

const Convert = () => {
  const [activeTab, setActiveTab] = useState('convert');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [files, setFiles] = useState([]);
  const [supportedTypes, setSupportedTypes] = useState(null);

  const API_BASE = 'https://img-compressor.onrender.com';

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (type === 'merge') {
      setFiles(droppedFiles);
    } else {
      setFiles([droppedFiles[0]]);
    }
  }, []);

  const handleFileSelect = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    if (type === 'merge') {
      setFiles(selectedFiles);
    } else {
      setFiles([selectedFiles[0]]);
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
    return interval;
  };

  // Convert files to PDF
  const convertToPdf = async () => {
    if (!files[0]) {
      setResult({ type: 'error', message: 'Please select a file to convert' });
      return;
    }

    setLoading(true);
    setResult(null);
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch(`${API_BASE}/api/convert-to-pdf`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        setResult({
          type: 'success',
          message: 'File converted successfully! into a pdf',
          fileUrl: `${API_BASE}/${data.convertedFileUrl}`,
          fileName: data.originalName,
          size: data.convertedSize,
        });
      } else {
        setResult({ type: 'error', message: data.error || 'Conversion failed' });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setResult({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  // Compress Images
  const compressImage = async () => {
    if (!files[0]) {
      setResult({ type: 'error', message: 'Please select an image to compress' });
      return;
    }

    setLoading(true);
    setResult(null);
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('quality', '80');

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        setResult({
          type: 'success',
          message: 'Image compressed successfully!',
          fileUrl: `${API_BASE}/${data.compressedFileUrl}`,
          fileName: files[0].name,
        });
      } else {
        setResult({ type: 'error', message: data.error || 'Compression failed' });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setResult({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  // Merge PDFs
  const mergePdfs = async () => {
    if (files.length < 2) {
      setResult({ type: 'error', message: 'Please select at least 2 PDF files to merge' });
      return;
    }

    setLoading(true);
    setResult(null);
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('pdfs', file));

      const response = await fetch(`${API_BASE}/merge-pdfs`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        setResult({
          type: 'success',
          message: `${files.length} PDFs merged successfully!`,
          fileUrl: `${API_BASE}/${data.mergedFileUrl}`,
          fileName: 'merged.pdf',
          pageCount: data.pageCount,
        });
      } else {
        setResult({ type: 'error', message: data.error || 'Merge failed' });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setResult({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  // Split PDF (placeholder UI logic given, you can implement actual call)
  const splitPdf = async () => {
    // For split PDF, you need to grab startPage and endPage from input fields.
    // Add controlled inputs for startPage and endPage, then include in formData
    setResult({ type: 'error', message: 'Split PDF feature not implemented in this snippet.' });
  };

  // Get file info API
  const getFileInfo = async () => {
    if (!files[0]) {
      setResult({ type: 'error', message: 'Please select a file to get info' });
      return;
    }

    setLoading(true);
    setResult(null);
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch(`${API_BASE}/file-info`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        // Show file info in result; adapt as needed
        setResult({
          type: 'success',
          message: 'File information retrieved successfully!',
          fileName: data.filename || files[0].name,
          size: data.size,
          pageCount: data.pageCount,
          width: data.width,
          height: data.height,
          format: data.format,
        });
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to get file info' });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setResult({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  // Supported types fetch on demand
  const getSupportedTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supported-types`);
      const data = await response.json();
      setSupportedTypes(data);
    } catch (error) {
      console.error('Failed to fetch supported types:', error);
    }
  };

  const UploadArea = ({ type, accept, multiple = false, children }) => (
    <div
      className={`upload-area ${dragOver ? 'dragover' : ''}`}
      onClick={() => document.getElementById(`${type}File`).click()}
      onDrop={(e) => handleDrop(e, type)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{cursor: 'pointer'}}
    >
      <div className="upload-icon">
        <Upload className="w-16 h-16 text-purple-400" />
      </div>
      <div className="upload-text">
        Click to select {multiple ? 'files' : 'file'} or drag & drop
      </div>
      <div className="upload-subtext">{children}</div>
      <input
        type="file"
        id={`${type}File`}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e, type)}
      />
    </div>
  );

  const ProgressBar = () => (
    <div className={`progress-container ${loading ? 'block' : 'hidden'}`}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-center mt-2 text-slate-300">
        {Math.round(progress)}% Complete
      </div>
    </div>
  );

  const ResultDisplay = () => {
    if (!result) return null;

    return (
      <div className={`result ${result.type}`}>
        <div className="flex items-center gap-3 mb-3">
          {result.type === 'success' ? (
            <Check className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
          <span className="font-semibold">{result.message}</span>
        </div>

        {(result.fileUrl || result.pageCount || result.width) && (
          <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
            <div>
              <p className="font-medium text-white">{result.fileName}</p>
              {result.size && (
                <p className="text-sm text-slate-300">
                  Size: {(result.size / 1024).toFixed(2)} KB
                </p>
              )}
              {result.pageCount && (
                <p className="text-sm text-slate-300">Pages: {result.pageCount}</p>
              )}
              {result.width && result.height && (
                <p className="text-sm text-slate-300">
                  Dimensions: {result.width} x {result.height} px
                </p>
              )}
              {result.format && (
                <p className="text-sm text-slate-300">Format: {result.format}</p>
              )}
            </div>
            {result.fileUrl && (
              <a
                href={result.fileUrl}
                download
                className="btn btn-success flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  const SupportedTypesDisplay = () => {
    if (!supportedTypes) return null;

    return (
      <div className="supported-types">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Supported File Types</h3>
        <div className="type-grid">
          {Object.entries(supportedTypes.supportedTypes).map(([category, types]) => (
            <div key={category} className="type-category">
              <h4 className="font-semibold capitalize text-white mb-2">{category}</h4>
              <ul className="type-list">
                {types.map((type, index) => (
                  <li key={index} className="text-slate-300">
                    {type}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-slate-300">Max file size: {supportedTypes.maxFileSize}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      {/* Animated Background Elements */}
      <div className="bg-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      <div className="home-content">
        {/* Header */}
        <div className="header">
          <div className="header-icons">
            <div className="icon-container">
              <div className="icon-main-combo">
                <FileImage className="icon-image" />
                <FileText className="icon-pdf" />
                <Sparkles className="icon-sparkle animate-pulse" />
                <Zap className="icon-zap animate-bounce" />
              </div>
            </div>
          </div>
          <h1 className="title">File Processor Pro</h1>
          <p className="subtitle">
            Convert, compress, merge & split your files with lightning speed and professional quality
          </p>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {/* Convert to PDF */}
          {activeTab === 'convert' && (
            <div className="tab-content active">
              <div className="option-card">
                <div className="option-header">
                  <div className="option-icon pdf-icon">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="option-badge new">Popular</div>
                </div>

                <div className="option-content">
                  <h3>Convert Files to PDF</h3>
                  <p>Transform any document, presentation, or image into a professional PDF format</p>

                  <UploadArea
                    type="convert"
                    accept=".docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.pdf"
                  >
                    Supports DOCX, PPT, XLS, TXT, Images and more
                  </UploadArea>

                  {files.length > 0 && (
                    <div className="file-list">
                      <div className="file-item">
                        <div className="file-info">
                          <div className="file-name">{files[0].name}</div>
                          <div className="file-details">
                            {(files[0].size / 1024).toFixed(2)} KB • {files[0].type}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={convertToPdf}
                      disabled={loading || files.length === 0}
                      className="btn flex items-center gap-2"
                      style={{ margin: '0.5rem' }}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      {loading ? 'Converting...' : 'Convert to PDF'}
                    </button>
                    <button
                      onClick={getSupportedTypes}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Info className="w-4 h-4" />
                      View Supported Types
                    </button>
                  </div>

                  <ProgressBar />
                  <ResultDisplay />
                  <SupportedTypesDisplay />
                </div>
              </div>
            </div>
          )}

          {/* Compress Images */}
          {activeTab === 'compress' && (
            <div className="tab-content active">
              <div className="option-card">
                <div className="option-header">
                  <div className="option-icon image-icon">
                    <Image className="w-8 h-8" />
                  </div>
                  <div className="option-badge popular">Popular</div>
                </div>

                <div className="option-content">
                  <h3>Compress Images</h3>
                  <p>Reduce image file sizes while maintaining quality for web and storage optimization</p>

                  <UploadArea type="compress" accept=".jpg,.jpeg,.png,.gif,.bmp,.tiff">
                    Supports JPG, PNG, GIF, BMP, TIFF formats
                  </UploadArea>

                  {files.length > 0 && (
                    <div className="file-list">
                      <div className="file-item">
                        <div className="file-info">
                          <div className="file-name">{files[0].name}</div>
                          <div className="file-details">
                            {(files[0].size / 1024).toFixed(2)} KB • {files[0].type}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={compressImage}
                      disabled={loading || files.length === 0}
                      className="btn flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                      {loading ? 'Compressing...' : 'Compress Image'}
                    </button>
                  </div>

                  <ProgressBar />
                  <ResultDisplay />
                </div>
              </div>
            </div>
          )}

          {/* Merge PDFs */}
          {activeTab === 'merge' && (
            <div className="tab-content active">
              <div className="option-card">
                <div className="option-header">
                  <div className="option-icon pdf-icon">
                    <FilePlus className="w-8 h-8" />
                  </div>
                  <div className="option-badge new">New</div>
                </div>

                <div className="option-content">
                  <h3>Merge PDF Files</h3>
                  <p>Combine multiple PDF documents into a single, organized file</p>

                  <UploadArea type="merge" accept=".pdf" multiple={true}>
                    Select multiple PDF files to merge
                  </UploadArea>

                  {files.length > 0 && (
                    <div className="file-list">
                      {files.map((file, index) => (
                        <div key={index} className="file-item">
                          <div className="file-info">
                            <div className="file-name">{file.name}</div>
                            <div className="file-details">
                              {(file.size / 1024).toFixed(2)} KB • PDF
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={mergePdfs}
                      disabled={loading || files.length < 2}
                      className="btn flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
                      {loading ? 'Merging...' : 'Merge PDFs'}
                    </button>
                  </div>

                  <ProgressBar />
                  <ResultDisplay />
                </div>
              </div>
            </div>
          )}

          {/* Split PDF */}
          {activeTab === 'split' && (
            <div className="tab-content active">
              <div className="option-card">
                <div className="option-header">
                  <div className="option-icon image-icon">
                    <Scissors className="w-8 h-8" />
                  </div>
                  <div className="option-badge popular">Useful</div>
                </div>

                <div className="option-content">
                  <h3>Split PDF Files</h3>
                  <p>Extract specific pages or split large PDFs into smaller documents</p>

                  <UploadArea type="split" accept=".pdf">
                    Select a PDF file to split
                  </UploadArea>

                  {files.length > 0 && (
                    <div>
                      <div className="file-list">
                        <div className="file-item">
                          <div className="file-info">
                            <div className="file-name">{files[0].name}</div>
                            <div className="file-details">
                              {(files[0].size / 1024).toFixed(2)} KB • PDF
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Start Page</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400"
                            id="startPage"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">End Page (Optional)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Last page"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400"
                            id="endPage"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => {
                        // You can grab values from inputs here or use controlled inputs.
                        splitPdf();
                      }}
                      disabled={loading || files.length === 0}
                      className="btn flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                      {loading ? 'Splitting...' : 'Split PDF'}
                    </button>
                  </div>

                  <ProgressBar />
                  <ResultDisplay />
                </div>
              </div>
            </div>
          )}

          {/* File Info */}
          {activeTab === 'info' && (
            <div className="tab-content active">
              <div className="option-card">
                <div className="option-header">
                  <div className="option-icon pdf-icon">
                    <Info className="w-8 h-8" />
                  </div>
                  <div className="option-badge new">Tool</div>
                </div>

                <div className="option-content">
                  <h3>Get File Information</h3>
                  <p>Analyze and get detailed information about your files</p>

                  <UploadArea type="info" accept="*" multiple={false}>
                    Upload any file to get detailed information
                  </UploadArea>

                  {files.length > 0 && (
                    <div className="file-list">
                      <div className="file-item">
                        <div className="file-info">
                          <div className="file-name">{files[0].name}</div>
                          <div className="file-details">
                            {(files[0].size / 1024).toFixed(2)} KB • {files[0].type}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={getFileInfo}
                      disabled={loading || files.length === 0}
                      className="btn flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Info className="w-4 h-4" />}
                      {loading ? 'Analyzing...' : 'Get File Info'}
                    </button>
                  </div>

                  <ProgressBar />
                  <ResultDisplay />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="stats-section mt-16">
          <div className="stats-container">
            <div className="stat-block">
              <div className="stat-number-large">10K+</div>
              <div className="stat-label-large">Files Processed</div>
            </div>
            <div className="stat-block">
              <div className="stat-number-large">99.9%</div>
              <div className="stat-label-large">Success Rate</div>
            </div>
            <div className="stat-block">
              <div className="stat-number-large">15+</div>
              <div className="stat-label-large">File Formats</div>
            </div>
            <div className="stat-block">
              <div className="stat-number-large">24/7</div>
              <div className="stat-label-large">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Do NOT change styles here, styles come from your existing code */}

    </div>
  );
};

export default Convert;
