export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface ShareListData {
  type: 'artists' | 'albums' | 'tracks' | 'genres';
  items: Array<{ name: string; [key: string]: any }>;
  userName?: string;
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
  // Try Web Share API first (mobile and some desktop browsers)
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Web Share API failed:', error);
      }
    }
  }

  // Fallback: Copy to clipboard
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