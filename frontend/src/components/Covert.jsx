import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Image, 
  Zap, 
  Sparkles, 
  Upload, 
  Download, 
  Scissors, 
  Merge, 
  Info,
  Check,
  AlertCircle,
  Loader2,
  FileImage,
  FilePlus,
  Split,
  Settings
} from 'lucide-react';

const Convert = () => {
  const [activeTab, setActiveTab] = useState('convert');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [files, setFiles] = useState([]);
  const [supportedTypes, setSupportedTypes] = useState(null);

  // API Base URL - adjust this to your server URL
  const API_BASE = 'https://img-compressor.onrender.com/';

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
          message: 'File converted successfully!',
          fileUrl: `${API_BASE}/${data.convertedFileUrl}`,
          fileName: data.originalName,
          size: data.convertedSize
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
    >
      <div className="upload-icon">
        <Upload className="w-16 h-16 text-purple-400" />
      </div>
      <div className="upload-text">Click to select {multiple ? 'files' : 'file'} or drag & drop</div>
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
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
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
        
        {result.fileUrl && (
          <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
            <div>
              <p className="font-medium text-white">{result.fileName}</p>
              {result.size && (
                <p className="text-sm text-slate-300">
                  Size: {(result.size / 1024).toFixed(2)} KB
                </p>
              )}
              {result.pageCount && (
                <p className="text-sm text-slate-300">
                  Pages: {result.pageCount}
                </p>
              )}
            </div>
            <a 
              href={result.fileUrl} 
              download
              className="btn btn-success flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
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
                  <li key={index} className="text-slate-300">{type}</li>
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


        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 flex-wrap gap-3">
          {[
            { id: 'convert', label: 'Convert to PDF', icon: <FileText className="w-4 h-4" /> },
            { id: 'compress', label: 'Compress Images', icon: <Settings className="w-4 h-4" /> },
            { id: 'merge', label: 'Merge PDFs', icon: <FilePlus className="w-4 h-4" /> },
            { id: 'split', label: 'Split PDF', icon: <Split className="w-4 h-4" /> },
            { id: 'info', label: 'File Info', icon: <Info className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFiles([]);
                setResult(null);
              }}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''} flex items-center gap-2`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
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
                      className="btn flex items-center "
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
                  
                  <UploadArea 
                    type="compress" 
                    accept=".jpg,.jpeg,.png,.gif,.bmp,.tiff"
                  >
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
                  
                  <UploadArea 
                    type="merge" 
                    accept=".pdf"
                    multiple={true}
                  >
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
                  
                  <UploadArea 
                    type="split" 
                    accept=".pdf"
                  >
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
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">End Page (Optional)</label>
                          <input 
                            type="number" 
                            min="1"
                            placeholder="Last page"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button 
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
                  
                  <UploadArea 
                    type="info" 
                    accept="*"
                  >
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

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                    .supported-types {
            background: rgba(13, 148, 136, 0.06);
            border: 1px solid #06b6d4;
            border-radius: 1.2rem;
            padding: 2rem 2.5rem;
            box-shadow: 0 2px 12px rgba(6, 182, 212, 0.05);
            margin-top: 2rem;
            margin-bottom: 2rem;
            color: #06b6d4;
            }

            .supported-types h3 {
            font-family: 'Inter', sans-serif;
            font-size: 1.6rem;
            font-weight: 700;
            color: #06b6d4;
            margin-bottom: 2rem;
            text-align: center;
            letter-spacing: 0.5px;
            }

            .type-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 2rem;
            }

            .type-category {
            background: rgba(255,255,255,0.08);
            border-radius: 0.8rem;
            padding: 1.2rem 1rem;
            box-shadow: 0 1px 8px rgba(6,182,212,0.03);
            transition: box-shadow 0.2s;
            }

            .type-category:hover {
            box-shadow: 0 4px 14px rgba(6,182,212,0.07);
            background: rgba(6,182,212,0.12);
            }

            .type-category h4 {
            font-family: 'Inter', sans-serif;
            color: #0ea5e9;
            font-size: 1.1rem;
            margin-bottom: 0.7rem;
            }

            .type-list {
            font-family: 'Inter', sans-serif;
            list-style: disc inside;
            padding: 0;
            margin: 0;
            }

            .type-list li {
            font-family: 'Inter', sans-serif;
            color: #f9f8f9ff;
            padding: 0.2rem 0;
            font-size: 0.98rem;
            }

            .supported-types .text-center {
            color: #64748b;
            margin-top: 1.3rem;
            font-size: 1.08rem;
            }

        .home-container {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
          background-attachment: fixed;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          position: relative;
          padding: 2rem;
          margin: 0;
        }

        .bg-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .bg-element {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.2;
          animation: pulse 4s ease-in-out infinite;
        }

        .bg-element-1 {
          width: 300px;
          height: 300px;
          background: #8b5cf6;
          top: -50px;
          left: -50px;
          animation-delay: 0s;
        }

        .bg-element-2 {
          width: 300px;
          height: 300px;
          background: #06b6d4;
          top: 50%;
          right: -50px;
          animation-delay: 2s;
        }

        .bg-element-3 {
          width: 300px;
          height: 300px;
          background: #ec4899;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 4s;
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.2; 
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.3; 
          }
        }

        .home-content {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .header-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .icon-container {
          position: relative;
          display: inline-block;
        }

        .icon-main-combo {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .icon-image {
          width: 3rem;
          height: 3rem;
          color: #a855f7;
        }

        .icon-pdf {
          width: 3rem;
          height: 3rem;
          color: #06b6d4;
        }

        .icon-sparkle {
          position: absolute;
          top: -10px;
          left: -10px;
          width: 2rem;
          height: 2rem;
          color: #a855f7;
        }

        .icon-zap {
          position: absolute;
          bottom: -8px;
          right: -8px;
          width: 1.5rem;
          height: 1.5rem;
          color: #06b6d4;
        }

        .title {
          font-size: 4.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #a855f7, #ec4899, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .subtitle {
          font-size: 1.375rem;
          color: #cbd5e1;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .tab-button {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .tab-button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .tab-button.active {
          background: white;
          color: #667eea;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .option-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(12px);
        border-radius: 1.5rem;
        padding: 2.5rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        margin-bottom: 2rem;
        position: relative;
      }

                .result {
            padding: 1.5rem;
            border-radius: 1rem;
            margin-top: 1rem;
            font-size: 1rem;
            }

            .result.success {
            background-color: rgba(22, 163, 74, 0.15); /* a soft green background */
            border: 1.5px solid #16a34a; /* green border */
            color: #16a34a; /* green text */
            box-shadow: 0 0 10px rgba(22, 163, 74, 0.4);
            }

            .result.success .file-name {
            color: #15803d; /* darker green for filename */
            font-weight: 600;
            }

            .result.success a.btn-success {
            background-color: #16a34a;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            color: white;
            font-weight: 600;
            transition: background-color 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            }

            .result.success a.btn-success:hover {
            background-color: #15803d;
            }

            .result.error {
            background-color: rgba(220, 38, 38, 0.15);
            border: 1.5px solid #dc2626;
            color: #dc2626;
}

      /* You can add additional styles here as needed. */
    `}</style>
  </div>
);
};
export default Convert;

