/**
 * Dynamic Pagination Logic
 * Measures text overflow in a real DOM element to split text into pages that fit perfectly.
 */

export interface PaginationOptions {
  containerWidth: number;
  containerHeight: number;
  fontSize: string;
  lineHeight: string;
  fontFamily: string;
  padding: string;
}

export async function paginateTextDynamic(
  text: string,
  options: PaginationOptions
): Promise<string[]> {
  // Ensure fonts are loaded before measuring
  await document.fonts.ready;

  // Create a hidden measurement container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.width = `${options.containerWidth}px`;
  container.style.height = `${options.containerHeight}px`;
  container.style.fontSize = options.fontSize;
  container.style.lineHeight = options.lineHeight;
  container.style.fontFamily = options.fontFamily;
  container.style.padding = options.padding;
  container.style.boxSizing = 'border-box';
  container.style.whiteSpace = 'pre-wrap';
  container.style.wordBreak = 'break-word';
  container.style.overflow = 'hidden';
  
  document.body.appendChild(container);

  const words = text.split(/(\s+)/).filter(w => w.length > 0); 
  const pages: string[] = [];
  let currentStartIndex = 0;
  let safetyCounter = 0;

  while (currentStartIndex < words.length && safetyCounter < 10000) {
    safetyCounter++;
    let low = currentStartIndex;
    let high = words.length;
    let bestEndIndex = currentStartIndex;

    // Binary search for the maximum amount of words that fit on one page
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const chunk = words.slice(currentStartIndex, mid).join('');
      container.textContent = chunk;

      // Use a small buffer to prevent tight fits from overflowing
      if (container.scrollHeight <= options.containerHeight) {
        bestEndIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // If we didn't progress at all (single word too big), force take one word
    if (bestEndIndex <= currentStartIndex) {
      bestEndIndex = currentStartIndex + 1;
    }

    const pageContent = words.slice(currentStartIndex, bestEndIndex).join('').trim();
    if (pageContent) {
      pages.push(pageContent);
    }
    
    currentStartIndex = bestEndIndex;
  }

  if (safetyCounter >= 10000) {
    console.error("Pagination reached safety limit. Content might be truncated.");
  }

  document.body.removeChild(container);
  return pages.length > 0 ? pages : ["No content available."];
}
