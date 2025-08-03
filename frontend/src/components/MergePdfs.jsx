import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Download, Loader, AlertCircle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import './MergePdfs.css'; // Import the CSS file


const URLBackend = "https://img-compressor.onrender.com/";
// const URLBackend = "https://img-compressor.onrender.com";
function MergePdfs() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mergedFileUrl, setMergedFileUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      setError('Please select only PDF files');
      return;
    }

    setSelectedFiles(prev => [...prev, ...pdfFiles]);
    setError('');
    setSuccess('');
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex, toIndex) => {
    const newFiles = [...selectedFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setSelectedFiles(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const mergePdfs = async () => {
    if (selectedFiles.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('pdfs', file);
    });

    try {
      const response = await fetch(`${URLBackend}merge-pdfs`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
         setMergedFileUrl(`${URLBackend}${result.mergedFileUrl}`);
        setSuccess(`Successfully merged ${selectedFiles.length} PDFs (${result.pageCount} total pages)`);
         setSelectedFiles([]);
      } else {
        setError(result.error || 'Error merging PDFs');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error('Error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setMergedFileUrl('');
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
 
    <div className="pdf-merger-container">
      {/* Animated background elements */}
      <div className="bg-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      <div className="compressor-content">
        {/* Header */}
        <div className="header">
          <div className="header-icons">
            <div className="icon-container">
              <FileText className="icon-main" />
              <div className="icon-sparkle animate-pulse">✨</div>
              <div className="icon-zap animate-bounce">⚡</div>
            </div>
          </div>
          <h1 className="title">PDF Merger</h1>
          <p className="subtitle">
            Combine multiple PDF files into a single document with ease. 
            Maintain quality while organizing your documents efficiently.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <CheckCircle size={20} />
            <p>{success}</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
            <div className="upload-content">
              <div className="upload-icon-container">
                <div className="upload-icon">
                  <Upload />
                </div>
              </div>
              <div className="upload-text">
                <h3>Choose PDF Files</h3>
                <p>Click here or drag and drop your PDF files</p>
                <div className="file-info">
                  Supports multiple PDF files up to 10MB each
                </div>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="file-input"
          />
        </div>

        {/* Main Content */}
        {selectedFiles.length > 0 && (
          <div className="main-grid">
            {/* Selected Files */}
            <div className="card">
              <div className="card-title">
                <FileText className="title-icon purple" />
                Selected Files ({selectedFiles.length})
                <button onClick={clearAll} className="clear-btn">
                  Clear All
                </button>
              </div>
              
              <div className="files-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info-container">
                      <FileText className="file-icon" size={20} />
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    
                    <div className="file-controls">
                      <div className="order-controls">
                        <button 
                          onClick={() => moveFile(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          className="order-btn"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <span className="order-number">{index + 1}</span>
                        <button 
                          onClick={() => moveFile(index, Math.min(selectedFiles.length - 1, index + 1))}
                          disabled={index === selectedFiles.length - 1}
                          className="order-btn"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFile(index)}
                        className="remove-btn"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Merge Controls */}
            <div className="card">
              <div className="card-title">
                <FileText className="title-icon cyan" />
                Merge Settings
              </div>
              
              <div className="merge-info">
                <div className="stats-grid">
                  <div className="stat-card">
                    <p className="stat-label">Total Files</p>
                    <p className="stat-value">{selectedFiles.length}</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Total Size</p>
                    <p className="stat-value">
                      {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
                    </p>
                  </div>
                </div>

                <button
                  onClick={mergePdfs}
                  disabled={selectedFiles.length < 2 || isUploading}
                  className={`btn ${isUploading ? 'btn-loading' : 'btn-primary'}`}
                >
                  {isUploading ? (
                    <>
                      <Loader className="spinner" size={20} />
                      Merging PDFs...
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      Merge {selectedFiles.length} PDFs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download Section */}
        {mergedFileUrl && (
          <div className="card compressed-result">
            <div className="card-title">
              <Download className="title-icon green" />
              Download Merged PDF
            </div>
            
            <a 
              href={mergedFileUrl} 
              download="merged-document.pdf"
              className="btn btn-success"
            >
              <Download size={20} />
              Download Merged PDF
            </a>
          </div>
        )}

        {/* Features Section */}
        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon purple">
              <FileText size={24} />
            </div>
            <h3>Multiple PDFs</h3>
            <p>Combine unlimited PDF files into a single document while preserving quality and formatting.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon cyan">
              <ArrowUp size={24} />
            </div>
            <h3>Custom Order</h3>
            <p>Easily reorder your PDF files before merging to get the exact sequence you want.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon pink">
              <Download size={24} />
            </div>
            <h3>Instant Download</h3>
            <p>Get your merged PDF instantly after processing. No waiting, no email required.</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default MergePdfs;