import React, { useState } from 'react';
import { shareContent, generateShareContentWithScreenshot, getSocialMediaUrls, ShareListData } from '../utils/shareUtils';
import './ShareButton.css';

interface ShareButtonProps {
  data: ShareListData;
  className?: string;
  cardElement?: React.RefObject<HTMLElement>;
}

export default function ShareButton({ data, className = '', cardElement }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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
    setIsCapturing(true);
    try {
      const shareData = await generateShareContentWithScreenshot(data, cardElement?.current);
      const success = await shareContent(shareData);
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsCapturing(false);
    }
    setIsOpen(false);
  };

  const handleSocialShare = async (platform: string) => {
    if (platform === 'copy') {
      // For copy, try screenshot + text to clipboard first
      setIsCapturing(true);
      try {
        const shareData = await generateShareContentWithScreenshot(data, cardElement?.current);
        const success = await shareContent(shareData);
        
        if (success) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      } catch (error) {
        console.error('Copy with screenshot failed:', error);
      } finally {
        setIsCapturing(false);
      }
    } else {
      // For social platforms, open URL (screenshot sharing happens via main share button)
      const shareData = await generateShareContentWithScreenshot(data, cardElement?.current);
      const urls = getSocialMediaUrls(shareData);
      window.open(urls[platform as keyof typeof urls] as string, '_blank', 'width=600,height=400');
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
        disabled={isCapturing}
      >
        {isCapturing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="spinning">
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
          </svg>
        )}
      </button>

      {isOpen && (
        <div 
          className="share-dropdown"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button onClick={() => handleSocialShare('twitter')} className="share-option twitter" disabled={isCapturing}>
            <span className="share-icon">🐦</span>
            Twitter
          </button>
          <button onClick={() => handleSocialShare('facebook')} className="share-option facebook" disabled={isCapturing}>
            <span className="share-icon">📘</span>
            Facebook
          </button>
          <button onClick={() => handleSocialShare('linkedin')} className="share-option linkedin" disabled={isCapturing}>
            <span className="share-icon">💼</span>
            LinkedIn
          </button>
          <button onClick={() => handleSocialShare('whatsapp')} className="share-option whatsapp" disabled={isCapturing}>
            <span className="share-icon">💬</span>
            WhatsApp
          </button>
          <button onClick={() => handleSocialShare('copy')} className="share-option copy" disabled={isCapturing}>
            <span className="share-icon">{isCapturing ? '⏳' : '📋'}</span>
            {isCapturing ? 'Copying...' : 'Copy'}
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