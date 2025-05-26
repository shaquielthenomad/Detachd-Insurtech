import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  SpringOptions,
} from "framer-motion";

import "./Dock.css";

interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  springConfig?: SpringOptions;
  magnification?: number;
  distance?: number;
  baseItemSize?: number;
  id?: string; // For ARIA
}

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  springConfig = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 50, // Default magnification, can be prop
  distance = 150,     // Default distance, can be prop
  baseItemSize = 40,  // Default base size, can be prop
  id,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - rect.width / 2; // Use rect.width for accuracy
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, baseItemSize + magnification, baseItemSize]
  );
  const size = useSpring(targetSize, springConfig);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocusCapture={() => isHovered.set(1)} // Using onFocusCapture
      onBlurCapture={() => isHovered.set(0)}   // Using onBlurCapture
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup={Children.toArray(children).some(
        // @ts-ignore
        (child) => isValidElement(child) && child.type === DockLabel
      ) ? "true" : undefined}
      aria-labelledby={id ? `${id}-label` : undefined}
    >
      {Children.map(children, (child) =>
        isValidElement(child) ? cloneElement(child as React.ReactElement<any>, { isHovered, id }) : child
      )}
    </motion.div>
  );
}

interface DockLabelProps {
  children: React.ReactNode;
  className?: string;
  isHovered?: ReturnType<typeof useMotionValue<number>>; // Made optional as it's injected
  id?: string;
}

function DockLabel({ children, className = "", isHovered, id }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isHovered) {
      const unsubscribe = isHovered.on("change", (latest) => {
        setIsVisible(latest === 1);
      });
      return () => unsubscribe();
    }
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id={id ? `${id}-label` : undefined}
          initial={{ opacity: 0, y: 5 }} // Start slightly lower
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: "-50%" }} // Keep centering
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DockIconProps {
  children: React.ReactNode;
  className?: string;
  isHovered?: ReturnType<typeof useMotionValue<number>>; // To satisfy cloneElement, though not directly used in styling here
}

function DockIcon({ children, className = "" }: DockIconProps) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

export interface DockAppItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

interface DockProps {
  items: DockAppItem[];
  className?: string;
  springConfig?: SpringOptions;
  magnification?: number;
  distance?: number;
  panelVerticalPadding?: number; // New prop for panel's vertical padding
  baseItemSize?: number;
}

export default function Dock({
  items,
  className = "",
  springConfig = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 30, // Adjusted default magnification
  distance = 80,      // Adjusted default distance
  panelVerticalPadding = 8, // Default vertical padding for panel (0.5rem => 8px)
  baseItemSize = 44,  // Adjusted base item size
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  // Removed isHovered and height transformations as panel height is now fixed

  return (
    <div
      className="dock-outer" // This div is for centering the panel
      // style will be managed by CSS
    >
      <motion.div
        onMouseMove={({ nativeEvent }) => { // Use nativeEvent for pageX
          mouseX.set(nativeEvent.pageX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={`dock-panel ${className}`}
        style={{
          paddingTop: `${panelVerticalPadding}px`,
          paddingBottom: `${panelVerticalPadding}px`,
        }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item) => (
          <DockItem
            key={item.id}
            id={item.id}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            springConfig={springConfig}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </div>
  );
}