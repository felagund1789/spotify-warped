import React, { useState } from 'react';
import { shareContent, generateShareContent, getSocialMediaUrls, ShareListData } from '../utils/shareUtils';
import './ShareButton.css';

interface ShareButtonProps {
  data: ShareListData;
  className?: string;
}

export default function ShareButton({ data, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 200); // 200ms delay before hiding
    setHoverTimeout(timeout);
  };

  const handleShare = async () => {
    const shareData = generateShareContent(data);
    const success = await shareContent(shareData);
    
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
    setIsOpen(false);
  };

  const handleSocialShare = (platform: string) => {
    const shareData = generateShareContent(data);
    const urls = getSocialMediaUrls(shareData);
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(urls.copy).then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        });
        break;
      default:
        window.open(urls[platform as keyof typeof urls] as string, '_blank', 'width=600,height=400');
        break;
    }
    
    setIsOpen(false);
  };

  return (
    <div className={`share-button-container ${className}`}>
      <button 
        className="share-button"
        onClick={handleShare}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Share this list"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="share-dropdown"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button onClick={() => handleSocialShare('twitter')} className="share-option twitter">
            <span className="share-icon">🐦</span>
            Twitter
          </button>
          <button onClick={() => handleSocialShare('facebook')} className="share-option facebook">
            <span className="share-icon">📘</span>
            Facebook
          </button>
          <button onClick={() => handleSocialShare('linkedin')} className="share-option linkedin">
            <span className="share-icon">💼</span>
            LinkedIn
          </button>
          <button onClick={() => handleSocialShare('whatsapp')} className="share-option whatsapp">
            <span className="share-icon">💬</span>
            WhatsApp
          </button>
          <button onClick={() => handleSocialShare('copy')} className="share-option copy">
            <span className="share-icon">📋</span>
            Copy Link
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="share-success">
          ✓ Copied!
        </div>
      )}
    </div>
  );
}