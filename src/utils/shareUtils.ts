import html2canvas from 'html2canvas';

export interface ShareData {
  title: string;
  text: string;
  url: string;
  image?: Blob;
}

export interface ShareListData {
  type: 'artists' | 'albums' | 'tracks' | 'genres';
  items: Array<{ name: string; [key: string]: any }>;
  userName?: string;
}

/**
 * Capture an element as a screenshot using html2canvas
 */
export async function captureElementAsImage(element: HTMLElement): Promise<Blob | null> {
  try {
    element.children[0].children[1].classList.add('screenshot-mode');
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      allowTaint: false,
      logging: false,
      height: element.offsetHeight,
      width: element.offsetWidth,
      scrollX: 0,
      scrollY: 0
    });
    element.children[0].children[1].classList.remove('screenshot-mode');
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 0.9);
    });
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}

/**
 * Generate share content with screenshot for a card element
 */
export async function generateShareContentWithScreenshot(
  data: ShareListData, 
  cardElement?: HTMLElement | null
): Promise<ShareData> {
  const shareData = generateShareContent(data);
  
  if (cardElement) {
    try {
      const imageBlob = await captureElementAsImage(cardElement);
      if (imageBlob) {
        shareData.image = imageBlob;
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }
  
  return shareData;
}

/**
 * Copy image and text to clipboard using ClipboardItem
 */
export async function copyImageAndTextToClipboard(text: string, imageBlob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const clipboardItems = [
        new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          'image/png': imageBlob
        })
      ];
      
      await navigator.clipboard.write(clipboardItems);
      return true;
    }
  } catch (error) {
    console.error('Failed to copy image and text to clipboard:', error);
  }
  return false;
}

/**
 * Generate share content based on list type and items
 */
export function generateShareContent(data: ShareListData): ShareData {
  const { type, items, userName } = data;
  const appUrl = window.location.origin;
  const userPrefix = userName ? `${userName}'s` : 'My';
  
  // Get top 3 items for sharing (to keep text concise)
  const topItems = items.slice(0, 3).map(item => item.name);
  const itemsText = topItems.join(', ');
  const moreText = items.length > 3 ? ` and ${items.length - 3} more` : '';

  const shareContent = {
    artists: {
      title: `${userPrefix} Top Artists on Spotify Warped`,
      text: `🎤 ${userPrefix} Top Artists: ${itemsText}${moreText} - Discover your music taste on Spotify Warped! ${appUrl}`,
      emoji: '🎤'
    },
    albums: {
      title: `${userPrefix} Top Albums on Spotify Warped`,
      text: `💿 ${userPrefix} Top Albums: ${itemsText}${moreText} - See what's in your heavy rotation! ${appUrl}`,
      emoji: '💿'
    },
    tracks: {
      title: `${userPrefix} Top Tracks on Spotify Warped`,
      text: `🎵 ${userPrefix} Top Tracks: ${itemsText}${moreText} - These are my current obsessions! ${appUrl}`,
      emoji: '🎵'
    },
    genres: {
      title: `${userPrefix} Top Genres on Spotify Warped`,
      text: `🎶 ${userPrefix} Top Genres: ${itemsText}${moreText} - This is my musical DNA! ${appUrl}`,
      emoji: '🎶'
    }
  };

  const content = shareContent[type];
  
  return {
    title: content.title,
    text: content.text,
    url: appUrl
  };
}

/**
 * Share using Web Share API with social media fallbacks
 */
export async function shareContent(shareData: ShareData): Promise<boolean> {
  // Try Web Share API first if image is included
  if (navigator.share && shareData.image) {
    try {
      const file = new File([shareData.image], 'spotify-card.png', { type: 'image/png' });
      
      // Check if file sharing is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          files: [file]
        });
        return true;
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Web Share API with file failed:', error);
      }
    }
  }
  
  // Try Web Share API without file
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Web Share API failed:', error);
      }
    }
  }

  // Try clipboard with image and text if image is available
  if (shareData.image) {
    const clipboardSuccess = await copyImageAndTextToClipboard(shareData.text, shareData.image);
    if (clipboardSuccess) {
      return true;
    }
  }

  // Fallback: Copy text only to clipboard
  try {
    await navigator.clipboard.writeText(shareData.text);
    return true;
  } catch (error) {
    console.error('Clipboard API failed:', error);
    
    // Final fallback: Create temporary text area
    const textArea = document.createElement('textarea');
    textArea.value = shareData.text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
}

/**
 * Generate social media share URLs
 */
export function getSocialMediaUrls(shareData: ShareData) {
  const encodedText = encodeURIComponent(shareData.text);
  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedTitle = encodeURIComponent(shareData.title);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}`,
    copy: shareData.text
  };
}