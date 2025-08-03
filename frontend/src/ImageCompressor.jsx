// ImageCompressor.jsx
import React, { useState, useRef } from 'react';
import { Loader2, Upload, Download, Image, Zap, Sparkles } from 'lucide-react';
import './index.css';

function ImageCompressor() {
  const URLBackend = import.meta.env.VITE_BACKEND || "https://img-compressor.onrender.com";
  // const URLBackend = ;
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [preview, setPreview] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setPreview(URL.createObjectURL(selectedFile));
    setCompressedUrl(null);
    setCompressedSize(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setOriginalSize(droppedFile.size);
      setPreview(URL.createObjectURL(droppedFile));
      setCompressedUrl(null);
      setCompressedSize(0);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);

    try {
      // Replace this with your actual API call
      const response = await fetch(`${URLBackend}upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setCompressedUrl(`${URLBackend.replace(/\/+$/, '')}/${data.compressedFileUrl.replace(/^\/+/, '')}`);

      
      // Get compressed file size (you might need to adjust this based on your API response)
      const compressedResponse = await fetch(`${URLBackend}/${data.compressedFileUrl}`);
      const blob = await compressedResponse.blob();
      setCompressedSize(blob.size);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!compressedUrl) return;

    try {
      const response = await fetch(compressedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compressed-${file.name}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download the image');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalSize && compressedSize ? 
    Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;

  return (
    <div className="image-compressor-container">
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
              <Sparkles className="icon-sparkle animate-pulse" />
              <Image className="icon-main" />
              <Zap className="icon-zap animate-bounce" />
            </div>
          </div>
          <h1 className="title">Image Compressor</h1>
          <p className="subtitle">
            Transform your images with intelligent compression. Maintain quality while dramatically reducing file sizes.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Upload Area */}
        <div className="upload-section">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-content">
              <div className="upload-icon-container">
                <div className="upload-icon">
                  <Upload />
                </div>
              </div>
              <div className="upload-text">
                <h3>Drop your image here</h3>
                <p>or click to browse files</p>
                <p className="file-info">Supports JPG, PNG, WebP • Max 10MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>
        </div>

        {/* Preview and Controls */}
        {preview && (
          <div className="main-grid">
            {/* Original Image */}
            <div className="card">
              <h3 className="card-title">
                <Image className="title-icon purple" />
                Original Image
              </h3>
              <div className="image-container">
                <img 
                  src={preview} 
                  alt="Original" 
                  className="image-preview" 
                />
              </div>
              <div className="image-info">
                <p>Size: <span>{formatFileSize(originalSize)}</span></p>
                <p>Format: <span>{file?.type.split('/')[1].toUpperCase()}</span></p>
              </div>
            </div>

            {/* Controls and Compressed Image */}
            <div className="card">
              <h3 className="card-title">
                <Zap className="title-icon cyan" />
                Compression Settings
              </h3>
              
              <div className="quality-control">
                <div className="quality-header">
                  <span>Quality</span>
                  <span className="quality-value">{quality}%</span>
                </div>
                
                <div className="slider-container">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="quality-slider"
                  />
                </div>
                
                <div className="slider-labels">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Zap />
                    <span>Compress Image</span>
                  </>
                )}
              </button>

              {/* Compressed Result */}
              {compressedUrl && (
                <div className="compressed-result">
                  <h3 className="card-title">
                    <Sparkles className="title-icon green" />
                    Compressed Result
                  </h3>
                  
                  <div className="image-container">
                    <img 
                      src={compressedUrl} 
                      alt="Compressed" 
                      className="image-preview" 
                    />
                    {/* <div className="compression-badge">
                      -{compressionRatio}%
                    </div> */}
                  </div>

                  {/* <div className="stats-grid">
                    <div className="stat-card">
                      <p className="stat-label">New Size</p>
                      <p className="stat-value">{formatFileSize(compressedSize)}</p>
                    </div>
                    <div className="stat-card">
                      <p className="stat-label"storea>Saved</p>
                      <p className="stat-value saved">{formatFileSize(originalSize - compressedSize)}</p>
                    </div>
                  </div> */}

                  <button
                    onClick={handleDownload}
                    className="btn btn-success"
                  >
                    <Download />
                    <span>Download Compressed Image</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon purple">
              <Zap />
            </div>
            <h3>Lightning Fast</h3>
            <p>Advanced algorithms ensure quick compression without compromising quality.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon cyan">
              <Image />
            </div>
            <h3>Smart Compression</h3>
            <p>Intelligently reduces file size while maintaining visual quality.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon pink">
              <Sparkles />
            </div>
            <h3>Multiple Formats</h3>
            <p>Supports JPG, PNG, WebP and other popular image formats.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCompressor;