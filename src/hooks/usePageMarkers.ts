import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

// A4 dimensions at 96 DPI
export const A4_WIDTH_PX = 794;   // 210mm
export const A4_HEIGHT_PX = 1123; // 297mm
export const PAGE_BREAK_GAP = 4;  // 2px above + 2px below = 4px total gap

interface PageMarker {
  position: number;
  pageNumber: number;
}

export const usePageMarkers = (
  contentRef: RefObject<HTMLDivElement>,
  dependencies: any[] = []
) => {
  const [markers, setMarkers] = useState<PageMarker[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const calculateMarkers = () => {
      if (!contentRef.current) return;

      const contentHeight = contentRef.current.scrollHeight;
      
      // Calculate pages accounting for gaps
      // Each page break adds 4px (2px above + 2px below)
      const effectivePageHeight = A4_HEIGHT_PX;
      const pageCount = Math.ceil(contentHeight / effectivePageHeight);
      
      const newMarkers: PageMarker[] = [];
      for (let i = 1; i < pageCount; i++) {
        // Position markers at A4 intervals, accounting for cumulative gaps
        const basePosition = i * A4_HEIGHT_PX;
        const gapOffset = (i - 1) * PAGE_BREAK_GAP; // Cumulative gap from previous breaks
        
        newMarkers.push({
          position: basePosition + gapOffset,
          pageNumber: i + 1
        });
      }
      
      setMarkers(newMarkers);
      setTotalPages(pageCount);
    };

    // Initial calculation
    calculateMarkers();
    
    // Recalculate when content changes using ResizeObserver
    const observer = new ResizeObserver(() => {
      // Debounce the calculation
      setTimeout(calculateMarkers, 100);
    });
    
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => observer.disconnect();
  }, [contentRef, ...dependencies]);

  return { markers, totalPages };
};

export const usePageNavigation = (
  containerRef: RefObject<HTMLDivElement>,
  totalPages: number
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const scrollToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    // Account for gaps when scrolling
    const gapOffset = (pageNumber - 1) * PAGE_BREAK_GAP;
    const scrollTop = (pageNumber - 1) * A4_HEIGHT_PX + gapOffset;
    
    containerRef.current?.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
    
    setCurrentPage(pageNumber);
  };

  const nextPage = () => scrollToPage(currentPage + 1);
  const prevPage = () => scrollToPage(currentPage - 1);

  return {
    currentPage,
    nextPage,
    prevPage,
    scrollToPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};