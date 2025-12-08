import React from 'react';

interface PageMarker {
  position: number;
  pageNumber: number;
}

interface PageBreakMarkersProps {
  markers: PageMarker[];
}

export const PageBreakMarkers: React.FC<PageBreakMarkersProps> = ({ markers }) => {
  return (
    <>
      {markers.map((marker, index) => (
        <React.Fragment key={index}>
          
          {/* The actual page break line (2px) */}
          <div
            className="page-break-marker print:hidden"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${marker.position - 340}px`,
              height: '2px',
              background: 'repeating-linear-gradient(to right, #ff6b35 0, #ff6b35 10px, transparent 10px, transparent 20px)',
              pointerEvents: 'none',
              zIndex: 1002, // Even higher
            }}
          >
            {/* Page number label */}
            <div
              style={{
                position: 'absolute',
                right: '10px',
                top: '-20px',
                fontSize: '11px',
                color: '#ff6b35',
                background: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 500,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
              }}
            >
              Page {marker.pageNumber}
            </div>
          </div>
          
        </React.Fragment>
      ))}
    </>
  );
};

export default PageBreakMarkers;