import React, { useEffect, useRef, useCallback } from "react";
import './PixelCard.css';

class Pixel {
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;
  public x: number;
  public y: number;
  private color: string;
  private speed: number;
  private size: number;
  private sizeStep: number;
  private minSize: number;
  private maxSizeInteger: number;
  private maxSize: number;
  private delay: number;
  private counter: number;
  private counterStep: number;
  public isIdle: boolean;
  private isReverse: boolean;
  private isShimmer: boolean;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, x: number, y: number, color: string, speed: number, delay: number) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  private getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value: string | number, reducedMotion: boolean): number {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;

  if (parsed <= min || reducedMotion) {
    return min;
  } else if (parsed >= max) {
    return max * throttle;
  } else {
    return parsed * throttle;
  }
}

const VARIANTS = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: "#a1a1aa,#d4d4d8,#e4e4e7", // Tailwind zinc colors (light grays)
    noFocus: false
  },
  blue: { // Aligned with app's primary blue accent
    activeColor: "#bfdbfe", // Tailwind blue-200
    gap: 8, // Increased gap slightly for better spread
    speed: 30,
    colors: "#93c5fd,#60a5fa,#3b82f6", // Tailwind blue-300, blue-400, blue-500
    noFocus: false
  },
  yellow: { // For warnings and pending items
    activeColor: "#fef3c7", // Tailwind yellow-100
    gap: 6,
    speed: 40,
    colors: "#fbbf24,#f59e0b,#d97706", // Tailwind yellow-400, yellow-500, yellow-600
    noFocus: false
  },
  green: { // For success states
    activeColor: "#d1fae5", // Tailwind green-100
    gap: 6,
    speed: 35,
    colors: "#34d399,#10b981,#059669", // Tailwind green-400, green-500, green-600
    noFocus: false
  },
  red: { // For errors and critical states
    activeColor: "#fee2e2", // Tailwind red-100
    gap: 6,
    speed: 45,
    colors: "#f87171,#ef4444,#dc2626", // Tailwind red-400, red-500, red-600
    noFocus: false
  },
  pink: { // Kept from example, can be removed if not needed
    activeColor: "#fecdd3",
    gap: 6,
    speed: 80,
    colors: "#fecdd3,#fda4af,#e11d48",
    noFocus: true
  }
};

interface PixelCardProps {
  variant?: keyof typeof VARIANTS;
  gap?: number;
  speed?: number;
  colors?: string; // Comma-separated string of hex colors
  noFocus?: boolean;
  className?: string;
  children: React.ReactNode;
  title?: string; // Optional title for the card
  actions?: React.ReactNode; // Optional actions for the card header
  icon?: React.ReactNode; // Optional icon for the card header
  contentClassName?: string; // Class for the inner content div
  onClick?: () => void; // Optional click handler for the entire card
}

const PixelCard: React.FC<PixelCardProps> = ({
  variant = "blue", // Default to blue variant
  gap,
  speed,
  colors,
  noFocus,
  className = "",
  children,
  title,
  actions,
  icon,
  contentClassName = "",
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const timePreviousRef = useRef<number>(performance.now());
  const reducedMotion = useRef<boolean>(
    typeof window !== 'undefined' ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  ).current;

  const variantCfg = VARIANTS[variant] || VARIANTS.default;
  const finalGap = gap ?? variantCfg.gap;
  const finalSpeed = speed ?? variantCfg.speed;
  const finalColors = colors ?? variantCfg.colors;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;

  const initPixels = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    // CSS handles display size, canvas width/height for drawing resolution

    const colorsArray = finalColors.split(",");
    const pxs: Pixel[] = [];
    for (let x = 0; x < width; x += finalGap) {
      for (let y = 0; y < height; y += finalGap) {
        const color =
          colorsArray[Math.floor(Math.random() * colorsArray.length)];

        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = reducedMotion ? 0 : distance;

        pxs.push(
          new Pixel(
            canvasRef.current,
            ctx,
            x,
            y,
            color,
            getEffectiveSpeed(finalSpeed, reducedMotion),
            delay
          )
        );
      }
    }
    pixelsRef.current = pxs;
  }, [finalColors, finalGap, finalSpeed, reducedMotion]);

  const doAnimate = useCallback((fnName: "appear" | "disappear") => {
    animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;
    const timeInterval = 1000 / 60; // ~60 FPS

    if (timePassed < timeInterval) return;
    timePreviousRef.current = timeNow - (timePassed % timeInterval);

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let allIdle = true;
    for (let i = 0; i < pixelsRef.current.length; i++) {
      const pixel = pixelsRef.current[i];
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle && fnName === "disappear") { // Only cancel if disappearing and all idle
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Optionally clear canvas one last time if needed after disappearing
      // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const handleAnimation = useCallback((name: "appear" | "disappear") => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(() => doAnimate(name));
  }, [doAnimate]);

  const onMouseEnter = () => handleAnimation("appear");
  const onMouseLeave = () => handleAnimation("disappear");
  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    handleAnimation("appear");
  };
  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    handleAnimation("disappear");
  };

  useEffect(() => {
    initPixels(); // Initial setup
    const currentContainer = containerRef.current; // Capture for cleanup
    const observer = new ResizeObserver(() => {
      initPixels();
      // After resizing, if the mouse is still over, restart appear animation
      if (currentContainer && currentContainer.matches(':hover')) {
        handleAnimation("appear");
      }
    });
    if (currentContainer) {
      observer.observe(currentContainer);
    }
    return () => {
      if (currentContainer) observer.unobserve(currentContainer);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [initPixels, handleAnimation]);

  return (
    <div
      ref={containerRef}
      className={`pixel-card ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={finalNoFocus ? undefined : onFocus}
      onBlur={finalNoFocus ? undefined : onBlur}
      tabIndex={finalNoFocus ? -1 : 0}
      onClick={onClick}
    >
      <canvas
        className="pixel-canvas"
        ref={canvasRef}
      />
      <div className={`pixel-card-content ${contentClassName}`}>
        {(title || actions || icon) && (
          <div className="px-0 py-0 mb-3 flex justify-between items-center border-b border-slate-700 pb-3"> {/* Adjusted padding for header */}
            <div className="flex items-center">
              {icon && <span className="mr-3 flex-shrink-0 text-blue-400">{icon}</span>}
              {title && <h3 className="text-lg leading-6 font-medium text-text-on-dark-primary">{title}</h3>}
            </div>
            {actions && <div className="ml-4">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default PixelCard;