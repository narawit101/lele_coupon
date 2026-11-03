"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  X,
} from "lucide-react";

export interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  alt?: string;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

export default function ImageLightboxModal({
  isOpen,
  imageUrl,
  alt = "รูปภาพขนาดเต็ม",
  onClose,
}: ImageLightboxModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Reset transforms whenever opening a new image or state changes (in render phase)
  const [prevTrigger, setPrevTrigger] = useState({ isOpen, imageUrl });
  if (prevTrigger.isOpen !== isOpen || prevTrigger.imageUrl !== imageUrl) {
    setPrevTrigger({ isOpen, imageUrl });
    setScale(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }

  // Handle Escape key specifically for Lightbox (stopping propagation so underlying modals stay open)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(4, Number((prev + 0.15).toFixed(2))));
    } else {
      setScale((prev) => Math.max(0.5, Number((prev - 0.15).toFixed(2))));
    }
  };

  // Double click to toggle zoom
  const handleDoubleClick = () => {
    if (scale !== 1 || pan.x !== 0 || pan.y !== 0) {
      handleReset();
    } else {
      setScale(2);
    }
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary mouse button
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + deltaX,
        y: panStartRef.current.y + deltaY,
      });
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Download image
  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `review-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  if (!isOpen || !isMounted || !imageUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-70 bg-black/92 backdrop-blur-md flex flex-col items-center justify-between select-none overflow-hidden"
      onWheel={handleWheel}
      onClick={(e) => {
        // If clicking on the backdrop area, close
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Top Header & Toolbar Bar */}
      <div className="w-full flex items-center justify-between px-4 py-3 sm:px-6 z-20 shrink-0">
        <div className="text-white/80 text-xs font-medium truncate max-w-[200px] sm:max-w-md">
          {alt}
        </div>

        {/* Toolbar floating controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-neutral-900/90 border border-neutral-700/80 rounded-full px-2 py-1 text-white shadow-xl backdrop-blur-md">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            title="ย่อขนาด (-)"
            aria-label="ย่อขนาด"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Percentage (Click to reset) */}
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 transition cursor-pointer font-latin"
            title="รีเซ็ตขนาด 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            title="ขยายขนาด (+)"
            aria-label="ขยายขนาด"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-neutral-700 mx-0.5" />

          {/* Rotate */}
          <button
            type="button"
            onClick={handleRotate}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-emerald-400 hover:bg-neutral-800 transition cursor-pointer"
            title="หมุนภาพ 90 องศา"
            aria-label="หมุนภาพ"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            title="ดาวน์โหลดรูปภาพ"
            aria-label="ดาวน์โหลดรูปภาพ"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Open in New Tab */}
          <button
            type="button"
            onClick={() => window.open(imageUrl, "_blank")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            title="เปิดรูปในแท็บใหม่"
            aria-label="เปิดรูปในแท็บใหม่"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer ml-0.5"
            title="ปิด (Esc)"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport with Pan & Zoom */}
      <div
        className={`relative flex-1 w-full flex items-center justify-center overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="relative max-w-full max-h-full flex items-center justify-center pointer-events-none select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
        >
          <div className="relative w-[85vw] h-[75vh] max-w-5xl max-h-[85vh]">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain pointer-events-none"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom Hint Bar */}
      <div className="py-3 z-20 shrink-0">
        <div className="px-3.5 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 text-[11px] font-medium tracking-wide shadow-md backdrop-blur-xs">
          คลิกลากเพื่อเลื่อนดู • ดับเบิลคลิกเพื่อรีเซ็ต
        </div>
      </div>
    </div>,
    document.body,
  );
}
