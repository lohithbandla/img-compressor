import React, { useState } from 'react';
import { Menu, X, Image, FileText, Info, Heart, Home, Zap } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700" style={{ backgroundColor: '#242424' }}>
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #646cff, #61dafb)',
                filter: 'drop-shadow(0 0 1em #646cffaa)',
                animation: 'logoSpin 20s linear infinite'
              }}
            >
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ToolKit</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <a 
              href="#home" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 font-medium text-lg hover:drop-shadow-lg"
              style={{ filter: 'transition: filter 300ms' }}
              onMouseEnter={(e) => e.target.style.filter = 'drop-shadow(0 0 1em #646cffaa)'}
              onMouseLeave={(e) => e.target.style.filter = 'none'}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </a>
            
            <div className="relative group">
              <button 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 font-medium text-lg"
                style={{ filter: 'transition: filter 300ms' }}
                onMouseEnter={(e) => e.target.style.filter = 'drop-shadow(0 0 1em #61dafbaa)'}
                onMouseLeave={(e) => e.target.style.filter = 'none'}
              >
                <span>Tools</span>
                <svg className="w-5 h-5 ml-1 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-3 w-56 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10" 
                   style={{ 
                     backgroundColor: '#1f1f1f', 
                     border: '1px solid #444',
                     boxShadow: '0 10px 25px rgba(0,0,0,0.3)' 
                   }}>
                <div className="py-3">
                  <a href="#compress" 
                     className="flex items-center space-x-3 px-5 py-3 text-gray-300 hover:text-white transition-all duration-300"
                     style={{ transition: 'all 300ms' }}
                     onMouseEnter={(e) => {
                       e.target.style.backgroundColor = '#333';
                       e.target.style.filter = 'drop-shadow(0 0 0.5em #646cffaa)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.backgroundColor = 'transparent';
                       e.target.style.filter = 'none';
                     }}>
                    <Image className="w-5 h-5" />
                    <span>Image Compressor</span>
                  </a>
                  <a href="#merge" 
                     className="flex items-center space-x-3 px-5 py-3 text-gray-300 hover:text-white transition-all duration-300"
                     style={{ transition: 'all 300ms' }}
                     onMouseEnter={(e) => {
                       e.target.style.backgroundColor = '#333';
                       e.target.style.filter = 'drop-shadow(0 0 0.5em #61dafbaa)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.backgroundColor = 'transparent';
                       e.target.style.filter = 'none';
                     }}>
                    <FileText className="w-5 h-5" />
                    <span>PDF Merger</span>
                  </a>
                </div>
              </div>
            </div>
            
            <a 
              href="#about" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 font-medium text-lg"
              style={{ filter: 'transition: filter 300ms' }}
              onMouseEnter={(e) => e.target.style.filter = 'drop-shadow(0 0 1em #646cffaa)'}
              onMouseLeave={(e) => e.target.style.filter = 'none'}
            >
              <Info className="w-5 h-5" />
              <span>About Us</span>
            </a>
            
            <a 
              href="#donate" 
              className="flex items-center space-x-2 text-white px-6 py-3 rounded-xl font-medium text-lg transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                filter: 'drop-shadow(0 4px 15px rgba(255, 107, 107, 0.3))',
                willChange: 'filter'
              }}
              onMouseEnter={(e) => e.target.style.filter = 'drop-shadow(0 0 2em #ff6b6baa)'}
              onMouseLeave={(e) => e.target.style.filter = 'drop-shadow(0 4px 15px rgba(255, 107, 107, 0.3))'}
            >
              <Heart className="w-5 h-5" />
              <span>Donate</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-lg mt-2">
              <a
                href="#home"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
              
              <div className="px-3 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</p>
              </div>
              
              <a
                href="#compress"
                className="flex items-center space-x-2 px-3 py-2 ml-4 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Image className="w-4 h-4" />
                <span>Image Compressor</span>
              </a>
              
              <a
                href="#merge"
                className="flex items-center space-x-2 px-3 py-2 ml-4 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="w-4 h-4" />
                <span>PDF Merger</span>
              </a>
              
              <a
                href="#about"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="w-4 h-4" />
                <span>About Us</span>
              </a>
              
              <a
                href="#donate"
                className="flex items-center justify-center space-x-2 mx-3 my-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-4 h-4" />
                <span>Donate</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;