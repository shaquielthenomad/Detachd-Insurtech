import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTransition, a, config as springConfig } from '@react-spring/web';

import './Masonry.css';

export interface MasonryDataItem {
  id: string | number;
  height: number; // Height of the content for masonry calculation
  renderContent: () => React.ReactNode; // Function to render the actual content (e.g., a PixelCard)
}

interface MasonryProps {
  data: MasonryDataItem[];
  columnsConfig?: {
    default: number;
    sm?: number; // e.g., 640px
    md?: number; // e.g., 768px
    lg?: number; // e.g., 1024px
    xl?: number; // e.g., 1280px
    '2xl'?: number; // e.g., 1536px
  };
  columnGap?: number; // Gap between columns in pixels
}

const Masonry: React.FC<MasonryProps> = ({ 
  data, 
  columnsConfig = { default: 1, sm: 2, lg: 3, xl: 4 },
  columnGap = 24 // Default gap (tailwind p-3 on each side means 1.5rem = 24px total between items)
}) => {
  const [currentColumnCount, setCurrentColumnCount] = useState(columnsConfig.default);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const getColumnCount = () => {
      if (typeof window === 'undefined') return columnsConfig.default;
      // Match Tailwind breakpoints (approximate)
      if (columnsConfig['2xl'] && window.matchMedia('(min-width: 1536px)').matches) return columnsConfig['2xl'];
      if (columnsConfig.xl && window.matchMedia('(min-width: 1280px)').matches) return columnsConfig.xl;
      if (columnsConfig.lg && window.matchMedia('(min-width: 1024px)').matches) return columnsConfig.lg;
      if (columnsConfig.md && window.matchMedia('(min-width: 768px)').matches) return columnsConfig.md;
      if (columnsConfig.sm && window.matchMedia('(min-width: 640px)').matches) return columnsConfig.sm;
      return columnsConfig.default;
    };

    const updateColumns = () => {
      setCurrentColumnCount(getColumnCount());
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columnsConfig]);

  const [heights, gridItems] = useMemo(() => {
    if (containerWidth === 0 || currentColumnCount === 0) return [[0], []];

    let colHeights = new Array(currentColumnCount).fill(0);
    const itemWidth = (containerWidth - (columnGap * (currentColumnCount -1))) / currentColumnCount;

    const items = data.map((child) => {
      const column = colHeights.indexOf(Math.min(...colHeights));
      const x = column * (itemWidth + columnGap);
      const y = (colHeights[column] += child.height) - child.height; // Add height directly
      colHeights[column] += columnGap; // Add gap for next item in this column
      return { ...child, x, y, width: itemWidth, height: child.height };
    });
    return [colHeights, items];
  }, [currentColumnCount, data, containerWidth, columnGap]);

  const transitions = useTransition(gridItems, {
    key: (item: MasonryDataItem) => item.id,
    from: ({ x, y, width, height }) => ({ x, y, width, height, opacity: 0 }),
    enter: ({ x, y, width, height }) => ({ x, y, width, height, opacity: 1 }),
    update: ({ x, y, width, height }) => ({ x, y, width, height }),
    leave: { opacity: 0 },
    config: { ...springConfig.gentle, trail: 100 / data.length },
  });

  return (
    <div ref={containerRef} className='masonry' style={{ height: Math.max(0,...heights) }}>
      {transitions((style, item) => (
        <a.div style={style}>
          {/* This inner div is styled by Masonry.css to handle padding and hover effects */}
          <div> 
            {item.renderContent()}
          </div>
        </a.div>
      ))}
    </div>
  );
}

export default Masonry;