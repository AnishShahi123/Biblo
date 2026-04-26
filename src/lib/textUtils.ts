export function paginateText(text: string, wordsPerPage: number = 180): string[] {
  // Strip some common Project Gutenberg header/footer text if possible
  let processedText = text;
  
  // Very basic Gutenberg cleanup
  const startMarker = "*** START OF THE PROJECT GUTENBERG EBOOK";
  const endMarker = "*** END OF THE PROJECT GUTENBERG EBOOK";
  
  const startIndex = processedText.indexOf(startMarker);
  if (startIndex !== -1) {
    const endOfStartLine = processedText.indexOf('\n', startIndex);
    processedText = processedText.substring(endOfStartLine + 1);
  }
  
  const endIndex = processedText.indexOf(endMarker);
  if (endIndex !== -1) {
    processedText = processedText.substring(0, endIndex);
  }

  // Split into paragraphs to maintain structure
  const paragraphs = processedText.split(/\n\s*\n/);
  const pages: string[] = [];
  
  let currentPage = '';
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) continue;

    if (currentWordCount + words.length > wordsPerPage && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = paragraph + '\n\n';
      currentWordCount = words.length;
    } else {
      currentPage += paragraph + '\n\n';
      currentWordCount += words.length;
    }
  }

  if (currentPage.trim().length > 0) {
    pages.push(currentPage.trim());
  }

  return pages.length > 0 ? pages : ["No content available."];
}
