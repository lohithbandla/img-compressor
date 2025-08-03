import React from 'react';
import { Image, FileText, ArrowRight, Zap, Shield, Download, Scissors } from 'lucide-react';

import './HomePage.css';

function HomePage({ onNavigate }) {
  return (
    <div className="home-container">
      {/* Animated background elements */}
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
                <Image className="icon-image animate-pulse" />
                <FileText className="icon-pdf animate-bounce" />
              </div>
              <div className="icon-sparkle animate-pulse">✨</div>
              <div className="icon-zap animate-bounce">⚡</div>
            </div>
          </div>
          <h1 className="title">File Processor Pro</h1>
          <p className="subtitle">
            Your all-in-one solution for image compression and PDF management. 
            Fast, secure, and easy to use - all processing happens in your browser.
          </p>
        </div>

        {/* Main Options */}
        <div className="options-grid">
          {/* Image Compressor Option */}
          <div 
            className="option-card image-card"
            onClick={() => window.location.href = '/compress'}
          >
            <div className="option-header">
              <div className="option-icon image-icon">
                <Image size={32} />
              </div>
              <div className="option-badge">Popular</div>
            </div>
            
            <div className="option-content">
              <h3>Image Compressor</h3>
              <p>Reduce image file sizes while maintaining quality. Perfect for web optimization and storage saving.</p>
              
              <div className="option-features">
                <div className="feature-item">
                  <Zap size={16} />
                  <span>Lightning Fast</span>
                </div>
                <div className="feature-item">
                  <Shield size={16} />
                  <span>Quality Preserved</span>
                </div>
                <div className="feature-item">
                  <Download size={16} />
                  <span>Instant Download</span>
                </div>
              </div>
            </div>

            <div className="option-footer">
              <span>Start Compressing</span>
              <ArrowRight size={20} />
            </div>

            <div className="option-stats">
              <div className="stat-item">
                <span className="stat-number">90%</span>
                <span className="stat-label">Size Reduction</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">JPG/PNG</span>
                <span className="stat-label">Supported</span>
              </div>
            </div>
          </div>

          {/* PDF Merger Option */}
          <div 
            className="option-card pdf-card"
            onClick={() => window.location.href = '/merge'}
          >
            <div className="option-header">
              <div className="option-icon pdf-icon">
                <FileText size={32} />
              </div>
              <div className="option-badge new">New</div>
            </div>
            
            <div className="option-content">
              <h3>PDF Merger</h3>
              <p>Combine multiple PDF files into a single document. Easy reordering and instant processing.</p>
              
              <div className="option-features">
                <div className="feature-item">
                  <FileText size={16} />
                  <span>Multiple PDFs</span>
                </div>
                <div className="feature-item">
                  <ArrowRight size={16} />
                  <span>Custom Order</span>
                </div>
                <div className="feature-item">
                  <Zap size={16} />
                  <span>Quick Merge</span>
                </div>
              </div>
            </div>

            <div className="option-footer">
              <span>Start Merging</span>
              <ArrowRight size={20} />
            </div>

            <div className="option-stats">
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Files Supported</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">PDF</span>
                <span className="stat-label">Format</span>
              </div>
            </div>
          </div>
        </div>



        {/* pdf spliter*/}
                <div 
          className="option-card split-card"
          onClick={() => window.location.href = '/split'}
        >
          <div className="option-header">
            <div className="option-icon split-icon">
              <Scissors size={32} />
            </div>
            <div className="option-badge new">New</div>
          </div>
          
          <div className="option-content">
            <h3>Split PDF</h3>
            <p>Split your PDF files by selecting page ranges. Quick and easy PDF splitting in your browser.</p>
            
            <div className="option-features">
              <div className="feature-item">
                <Scissors size={16} />
                <span>Custom Page Ranges</span>
              </div>
              <div className="feature-item">
                <Zap size={16} />
                <span>Fast Processing</span>
              </div>
              <div className="feature-item">
                <Download size={16} />
                <span>Instant Download</span>
              </div>
            </div>
          </div>

          <div className="option-footer">
            <span>Start Splitting</span>
            <ArrowRight size={20} />
          </div>

          <div className="option-stats">
            <div className="stat-item">
              <span className="stat-number">PDF</span>
              <span className="stat-label">Format</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Split</span>
              <span className="stat-label">Page Ranges</span>
            </div>
          </div>
        </div>


        {/* Features Section */}
        <div className="features-section">
          <h2 className="features-title">Why Choose File Processor Pro?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon purple">
                <Shield size={24} />
              </div>
              <h3>100% Secure</h3>
              <p>All processing happens locally in your browser. Your files never leave your device.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon cyan">
                <Zap size={24} />
              </div>
              <h3>Lightning Fast</h3>
              <p>Optimized algorithms ensure quick processing without compromising on quality.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon pink">
                <Download size={24} />
              </div>
              <h3>No Registration</h3>
              <p>Start using immediately. No accounts, no emails, no hidden fees.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-container">
            <div className="stat-block">
              <div className="stat-number-large">99.9%</div>
              <div className="stat-label-large">Uptime</div>
            </div>
            <div className="stat-block">
              <div className="stat-number-large">24/7</div>
              <div className="stat-label-large">Available</div>
              
            </div>
            <div className="stat-block">
              <div className="stat-number-large">1</div>
              <div className="stat-label-large">Developer</div>
            </div>
            <div className="stat-block">
              <div className="stat-number-large">∞</div>
              <div className="stat-label-large">Passion</div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;