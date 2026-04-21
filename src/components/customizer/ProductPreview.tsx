 import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useCustomizer } from "@/context/CustomizerContext";
import { ArrowUp, ArrowDown, Copy, Trash2, RotateCw } from "lucide-react";

const VIEWS = [
  { id: "front", label: "Devant" },
  { id: "back", label: "Dos" },
  { id: "left", label: "Gauche" },
  { id: "right", label: "Droite" },
];

export default function ProductPreview() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  // Configuration for Print Areas (Percentage based relative to 500x500 canvas)
  const PRINT_AREAS: Record<string, { top: string, left: string, width: string, height: string }> = {
    front: { top: '18%', left: '22%', width: '56%', height: '62%' }, // Full front
    back:  { top: '12%', left: '18%', width: '64%', height: '72%' }, // Full back
    left:  { top: '28%', left: '36%', width: '24%', height: '48%' }, // Sleeve
    right: { top: '28%', left: '40%', width: '24%', height: '48%' }, // Sleeve
    hoodie_left:  { top: '30%', left: '30%', width: '38%', height: '38%' }, // Hood side
    hoodie_right: { top: '30%', left: '30%', width: '38%', height: '38%' }, // Hood side
    composition: { top: '0%', left: '0%', width: '0%', height: '0%' }, // None
  };

  const { canvas, setCanvas, currentView, setCurrentView, selectedColor, selectedProduct, isDesignValid, setIsDesignValid, activeObject, saveCurrentViewState, markModified, duplicate, deleteSelected, moveLayer, setCurrentProductImageUrl, setViewProductImages } = useCustomizer();

  const [toolbarPosition, setToolbarPosition] = useState<{ top: number, left: number, visible: boolean }>({ top: 0, left: 0, visible: false });
  const [positionLabel, setPositionLabel] = useState<{ top: number, left: number, text: string, visible: boolean }>({ top: 0, left: 0, text: "", visible: false });
  const [hasObjects, setHasObjects] = useState(false);
  const constrainObjectRef = useRef<(obj: fabric.Object) => void>(() => {});

  // Mockup Images Dictionary
  const MOCKUP_IMAGES: Record<string, Record<string, string>> = {
    "T-Shirt": {
      "default": "/mockups/tshirt-front.png",
      "Blanc": "/mockups/tshirt-white.png",
      "Noir": "/mockups/tshirt-black.png"
    },
    "Hoodie": {
      "default": "/mockups/hoodie-front.png",
      "front": "/mockups/hoodie-front.png",
      "back": "/mockups/hoodie-back.png",
      "right": "/mockups/hoodie-right.png",
      "left": "/mockups/hoodie-left.png",
      "hoodie_right": "/mockups/hoodie-head-right.png",
      "hoodie_left": "/mockups/hoodie-head-left.webp",
      "composition": "/mockups/hoodie-composition.png",
      "Gris": "/mockups/hoodie-grey.png"
    }
  };

  // Helper to generate the product background image for a given view + color
  const getProductImage = (view: string, color: string) => {
    if (!selectedProduct) return "";

    // 1. Shopify metafields (view-specific mockup per product)
    if (selectedProduct.metafields) {
      const viewKey = view.toLowerCase();
      let imageUrl: string | null = null;
      if (viewKey === "front") imageUrl = selectedProduct.metafields.mockupFront?.reference?.image?.url;
      else if (viewKey === "back") imageUrl = selectedProduct.metafields.mockupBack?.reference?.image?.url;
      else if (viewKey === "left") imageUrl = selectedProduct.metafields.mockupLeft?.reference?.image?.url;
      else if (viewKey === "right") imageUrl = selectedProduct.metafields.mockupRight?.reference?.image?.url;
      if (imageUrl) return imageUrl;
    }

    // 2. Match by image URL filename or alt text (e.g. CHEMISE_BLANCHE_DEVANT → front + Blanc)
    // Shopify CDN URLs preserve the original filename, so we search both url and altText.
    if (selectedProduct.images?.length > 0) {
      const VIEW_KEYWORDS: Record<string, string[]> = {
        front:  ["devant", "front", "avant", "face"],
        back:   ["dos", "back", "arriere", "derriere"],
        left:   ["gauche", "left"],
        right:  ["droite", "right", "doite"],
      };
      const viewWords = VIEW_KEYWORDS[view] || [];

      const normalize = (s: string) =>
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const colorLower = normalize(color);

      const matchesView = (img: any) => {
        const haystack = normalize(img.alt || "") + " " + normalize(decodeURIComponent(img.url || ""));
        return viewWords.some(w => haystack.includes(w));
      };

      const matchesColor = (img: any) => {
        const haystack = normalize(img.alt || "") + " " + normalize(decodeURIComponent(img.url || ""));
        return haystack.includes(colorLower);
      };

      // First try: match both color and view
      const colorAndView = selectedProduct.images.find(
        (img: any) => matchesView(img) && matchesColor(img)
      );
      if (colorAndView?.url) return colorAndView.url;

      // Second try: match view only (color-neutral or single-color products)
      const viewOnly = selectedProduct.images.find((img: any) => matchesView(img));
      if (viewOnly?.url) return viewOnly.url;
    }

    // 3. Variant image matching the selected color (all views)
    if (selectedProduct.variants?.length) {
      const colorOptionName: string = selectedProduct.colorOptionName || "";
      const variant = selectedProduct.variants.find((v: any) =>
        v.selectedOptions?.some((o: any) =>
          (colorOptionName ? o.name === colorOptionName : /couleur|color/i.test(o.name)) &&
          o.value === color
        )
      );
      if (variant?.image?.url) return variant.image.url;
    }

    // 4. Base product image from Shopify (real product image takes priority over local demo mockups)
    if (selectedProduct.baseImage && !selectedProduct.baseImage.includes("placehold.co")) {
      return selectedProduct.baseImage;
    }

    // 5. Local hoodie mockups (fallback demo assets in /public/mockups when no real Shopify image)
    if (!selectedProduct.title) return "";
    const titleLower = selectedProduct.title.toLowerCase();
    // "sweat-shirt" contains "t-shirt", so check for hoodie/sweat first
    const productType = (titleLower.includes("hoodie") || titleLower.includes("sweat")) ? "Hoodie" :
                        (titleLower.includes("t-shirt") || titleLower.includes("tshirt")) ? "T-Shirt" : "Hoodie";
    if (productType === "Hoodie" && MOCKUP_IMAGES["Hoodie"][view]) {
      return MOCKUP_IMAGES["Hoodie"][view];
    }
    if (view === "front" && MOCKUP_IMAGES[productType]) {
      return MOCKUP_IMAGES[productType][color] || MOCKUP_IMAGES[productType]["default"] || "";
    }

    // 6. Colored placeholder
    const COLOR_HEX: Record<string, string> = {
      "Noir": "1a1a1a", "Blanc": "ffffff", "Gris": "808080", "Rouge": "dc2626",
      "Bleu marine": "1e3a8a", "Vert forêt": "166534", "Beige": "f5f5dc", "Rose": "fbcfe8",
      "Black": "1a1a1a", "White": "ffffff", "Navy": "1e3a8a", "Grey": "808080",
    };
    const hex = COLOR_HEX[color] || "1a1a1a";
    const textHex = ["ffffff", "f5f5dc", "fbcfe8"].includes(hex) ? "000000" : "ffffff";
    const viewLabel = view === "front" ? "Front" : view === "back" ? "Back" : view === "right" ? "Right" : "Left";
    return `https://placehold.co/600x600/${hex}/${textHex}?text=${productType}+${viewLabel}`;
  };

  // Initialize Canvas
  useEffect(() => {
    // Check local ref to prevent double init in Strict Mode
    if (canvasEl.current && !fabricRef.current) {
      const canvasInstance = new fabric.Canvas(canvasEl.current, {
        height: 500,
        width: 500,
        backgroundColor: 'transparent',
        selection: true,
      });

      fabricRef.current = canvasInstance;
      setCanvas(canvasInstance);

      // Cleanup
      return () => {
        canvasInstance.dispose();
        fabricRef.current = null;
        setCanvas(null);
      };
    }
  }, []); // Run once on mount

  // Handle constraints and clipping when view or canvas changes
  useEffect(() => {
    if (!canvas) return;

    const area = PRINT_AREAS[currentView] || PRINT_AREAS['front'];
    
    // Parse percentages to pixels (Canvas is 500x500)
    const top = (parseFloat(area.top) / 100) * 500;
    const left = (parseFloat(area.left) / 100) * 500;
    const width = (parseFloat(area.width) / 100) * 500;
    const height = (parseFloat(area.height) / 100) * 500;

    // 1. Update Clip Path (Disabled for now to fix visibility issues, relying on Clamping and Visual Guide)
    /* 
    const clipRect = new fabric.Rect({
        left: left,
        top: top,
        width: width,
        height: height,
        absolutePositioned: true,
        fill: 'transparent', 
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
    });
    canvas.clipPath = clipRect; 
    */
    canvas.clipPath = undefined; // Clear clip path
    canvas.requestRenderAll();

    // 2. Constraint Logic (Hard Clamping)
    const constrainObject = (obj: fabric.Object) => {
        if (!obj) return;

        // --- Rotated objects: compute bounding box from current angle + size ---
        if (obj.angle !== 0) {
            // Force Fabric.js to recompute corner coords from the current left/top
            obj.setCoords();
            const aCoords = (obj as any).aCoords as { tl: {x:number,y:number}, tr: {x:number,y:number}, bl: {x:number,y:number}, br: {x:number,y:number} } | undefined;
            if (!aCoords) return;

            const xs = [aCoords.tl.x, aCoords.tr.x, aCoords.bl.x, aCoords.br.x];
            const ys = [aCoords.tl.y, aCoords.tr.y, aCoords.bl.y, aCoords.br.y];
            const bbLeft   = Math.min(...xs);
            const bbRight  = Math.max(...xs);
            const bbTop    = Math.min(...ys);
            const bbBottom = Math.max(...ys);

            let dx = 0;
            let dy = 0;

            if (bbLeft < left)                dx = left - bbLeft;
            else if (bbRight > left + width)  dx = (left + width) - bbRight;

            if (bbTop < top)                  dy = top - bbTop;
            else if (bbBottom > top + height) dy = (top + height) - bbBottom;

            if (dx !== 0) obj.left = (obj.left ?? 0) + dx;
            if (dy !== 0) obj.top  = (obj.top  ?? 0) + dy;
            // Sync coords after correction so canvas renders at clamped position
            if (dx !== 0 || dy !== 0) obj.setCoords();
            return;
        }

        // --- Non-rotated objects: original axis-aligned clamping ---
        let objWidth  = obj.getScaledWidth();
        let objHeight = obj.getScaledHeight();

        // Prevent scaling larger than the print area
        if (objWidth > width || objHeight > height) {
            const scale = Math.min(width / obj.width!, height / obj.height!);
            obj.scale(scale);
            objWidth  = obj.getScaledWidth();
            objHeight = obj.getScaledHeight();
        }

        const minX = obj.originX === 'center' ? left + objWidth / 2  : left;
        const maxX = obj.originX === 'center' ? left + width - objWidth / 2  : left + width  - objWidth;
        const minY = obj.originY === 'center' ? top  + objHeight / 2 : top;
        const maxY = obj.originY === 'center' ? top  + height - objHeight / 2 : top  + height - objHeight;

        if (obj.left! < minX) obj.left = minX;
        if (obj.left! > maxX) obj.left = maxX;
        if (obj.top!  < minY) obj.top  = minY;
        if (obj.top!  > maxY) obj.top  = maxY;
    };
    constrainObjectRef.current = constrainObject;

    // 3. Check Bounds Logic (Validation for all cases including rotation)
    const checkBounds = () => {
        let isValid = true;
        const objects = canvas.getObjects();
        
        objects.forEach(obj => {
            if (!obj) return;

            constrainObject(obj);
            // Always sync corner handles after any correction
            obj.setCoords();

            // Then check validity (especially useful for rotation or if clamping missed something)
            const aCoords = obj.aCoords;
            if (!aCoords) return;

            // Check if all corners are within the print area
            const corners = [aCoords.tl, aCoords.tr, aCoords.bl, aCoords.br];
            // Allow a tiny margin of error (e.g. 1px) for floating point issues
            const isInside = corners.every(corner => {
                return corner.x >= left - 1 && corner.x <= left + width + 1 &&
                       corner.y >= top - 1 && corner.y <= top + height + 1;
            });

            if (!isInside) {
                isValid = false;
            }
        });

        setIsDesignValid(isValid);
    };

    // 3. Update Overlays (Toolbar & Label)
    const showToolbar = () => {
        const active = canvas.getActiveObject();
        if (!active) {
            setToolbarPosition(prev => ({ ...prev, visible: false }));
            return;
        }
        const boundingRect = active.getBoundingRect();
        setToolbarPosition({
            top: boundingRect.top - 60,
            left: boundingRect.left + (boundingRect.width / 2),
            visible: true
        });
        setPositionLabel(prev => ({ ...prev, visible: false }));
    };

    const showPositionLabel = () => {
        const active = canvas.getActiveObject();
        if (!active) return;
        
        const boundingRect = active.getBoundingRect();
        const centerX = 250;
        const centerY = 250;
        // Invert Y to match standard Cartesian (Up is +)
        const mmX = Math.round((active.left! - centerX) * 0.6);
        const mmY = Math.round((centerY - active.top!) * 0.6); 

        setPositionLabel({
            top: boundingRect.top - 40,
            left: boundingRect.left + (boundingRect.width / 2),
            text: `X: ${mmX}mm, Y: ${mmY}mm`,
            visible: true
        });
        setToolbarPosition(prev => ({ ...prev, visible: false }));
    };

    const showSizeLabel = () => {
        const active = canvas.getActiveObject();
        if (!active) return;
        
        const boundingRect = active.getBoundingRect();
        // Using the same 0.6 factor as position for consistency
        const widthMm = Math.round(active.getScaledWidth() * 0.6);
        const heightMm = Math.round(active.getScaledHeight() * 0.6);

        setPositionLabel({
            top: boundingRect.top - 40,
            left: boundingRect.left + (boundingRect.width / 2),
            text: `${widthMm}mm x ${heightMm}mm`,
            visible: true
        });
        setToolbarPosition(prev => ({ ...prev, visible: false }));
    };

    const hideOverlays = () => {
        setToolbarPosition(prev => ({ ...prev, visible: false }));
        setPositionLabel(prev => ({ ...prev, visible: false }));
    };

    // 4. Save State on Changes (Preview generation)
    const handleModification = () => {
        saveCurrentViewState();
        markModified();
        if (canvas) {
            setHasObjects(canvas.getObjects().length > 0);
        }
    };

    // Define handlers references so we can remove ONLY these specific listeners
    const onMoving = () => { checkBounds(); showPositionLabel(); };
    const onScaling = () => { checkBounds(); showSizeLabel(); };
    const onRotating = () => { showPositionLabel(); }; // let Fabric.js handle rotation freely; clamp on release
    let isConstraining = false;
    const onModified = () => {
        if (isConstraining) return;
        isConstraining = true;
        // Constrain all objects and sync their coords
        const objects = canvas.getObjects();
        objects.forEach(obj => { constrainObject(obj); obj.setCoords(); });
        // Re-select the active object so Fabric.js redraws its control handles
        const active = canvas.getActiveObject();
        if (active) {
            canvas.discardActiveObject();
            canvas.setActiveObject(active);
        }
        canvas.renderAll();
        isConstraining = false;
        checkBounds();
        showToolbar();
        handleModification();
    };
    const onAddedRemoved = () => { checkBounds(); handleModification(); };
    const onSelectionCreatedUpdated = () => { showToolbar(); }; // Named function for selection
    const onSelectionCleared = () => { hideOverlays(); };

    // Remove SPECIFIC listeners to avoid breaking Context listeners
    canvas.off('object:moving', onMoving);
    canvas.off('object:scaling', onScaling);
    canvas.off('object:rotating', onRotating);
    canvas.off('object:modified', onModified);
    canvas.off('object:added', onAddedRemoved);
    canvas.off('object:removed', onAddedRemoved);
    canvas.off('selection:created', onSelectionCreatedUpdated);
    canvas.off('selection:updated', onSelectionCreatedUpdated);
    canvas.off('selection:cleared', onSelectionCleared);

    // Attach new listeners
    canvas.on('object:moving', onMoving);
    canvas.on('object:scaling', onScaling);
    canvas.on('object:rotating', onRotating);
    canvas.on('object:modified', onModified);
    canvas.on('object:added', onAddedRemoved);
    canvas.on('object:removed', onAddedRemoved);
    
    // Selection Events
    canvas.on('selection:created', onSelectionCreatedUpdated);
    canvas.on('selection:updated', onSelectionCreatedUpdated);
    canvas.on('selection:cleared', onSelectionCleared);
    
    // Initial check
    checkBounds();
    showToolbar();
    if (canvas) {
        setHasObjects(canvas.getObjects().length > 0);
    }

    canvas.requestRenderAll();

    // Cleanup function to remove listeners when component unmounts or deps change
    return () => {
        if (canvas) {
            canvas.off('object:moving', onMoving);
            canvas.off('object:scaling', onScaling);
            canvas.off('object:rotating', onRotating);
            canvas.off('object:modified', onModified);
            canvas.off('object:added', onAddedRemoved);
            canvas.off('object:removed', onAddedRemoved);
            canvas.off('selection:created', onSelectionCreatedUpdated);
            canvas.off('selection:updated', onSelectionCreatedUpdated);
            canvas.off('selection:cleared', onSelectionCleared);
        }
    };

  }, [currentView, canvas]);

  const currentImage = getProductImage(currentView, selectedColor);

  // Keep context in sync with colour-aware product images for all views
  useEffect(() => {
    const images: Record<string, string> = {};
    ["front", "back", "left", "right"].forEach(v => { images[v] = getProductImage(v, selectedColor); });
    setViewProductImages(images);
    setCurrentProductImageUrl(images["front"] || "");
  }, [selectedProduct, selectedColor]);
  const currentArea = PRINT_AREAS[currentView] || PRINT_AREAS['front'];

  // Show print area ONLY when an object is selected (Edit Mode)
  const hasDesign = !!activeObject;

  return (
    <div className="flex-1 bg-gray-100 relative flex flex-col">
      {/* Warning Banner */}
      {!isDesignValid && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-600 text-white px-6 py-2 rounded shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Le design n'est pas dans la zone d'impression.
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div className="relative w-[500px] h-[500px] bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Background Image (The Product) */}
          <img 
            src={currentImage}
            alt={`${currentView} view`} 
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0 mix-blend-multiply"
          />
          
          {/* Fabric Canvas (The Design Layer) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
             <canvas ref={canvasEl} />
          </div>

          {/* Print Area Guide (Visual Aid with Dimming Effect) - Only visible if hasDesign */}
          {hasDesign && (
            <div 
                className="absolute border-2 border-dashed border-teal-500 rounded pointer-events-none z-[100]"
                style={{
                    top: currentArea.top,
                    left: currentArea.left,
                    width: currentArea.width,
                    height: currentArea.height,
                    backgroundColor: 'rgba(20, 184, 166, 0.05)' // Teal tint
                }}
            >
                <div className="absolute top-0 -mt-7 left-1/2 -translate-x-1/2 text-xs text-teal-700 font-bold px-2 py-0.5 whitespace-nowrap bg-white border border-teal-500 rounded shadow-sm z-[101]">
                    Zone d'impression
                </div>
            </div>
          )}

          {/* Floating Toolbar */}
          {toolbarPosition.visible && !positionLabel.visible && (
              <div 
                className="absolute z-[110] bg-white rounded-lg shadow-xl border border-gray-200 flex items-center p-1 gap-1 -translate-x-1/2 -translate-y-full"
                style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
              >
                  <button onClick={() => duplicate()} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Dupliquer">
                      <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onMouseDown={(e) => { e.preventDefault(); deleteSelected(); }}
                    className="p-2 hover:bg-red-50 rounded text-red-600" title="Supprimer"
                  >
                      <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button onClick={() => moveLayer('down')} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Reculer">
                      <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveLayer('up')} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Avancer">
                      <ArrowUp className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button
                    onClick={() => {
                        if(activeObject && canvas) {
                            activeObject.rotate((activeObject.angle || 0) + 90);
                            constrainObjectRef.current(activeObject);
                            activeObject.setCoords();
                            canvas.discardActiveObject();
                            canvas.setActiveObject(activeObject);
                            canvas.renderAll();
                            saveCurrentViewState();
                        }
                    }}
                    className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Pivoter 90°"
                  >
                      <RotateCw className="w-4 h-4" />
                  </button>
              </div>
          )}

          {/* Position Label (Only when moving) */}
          {positionLabel.visible && (
              <div 
                className="absolute z-50 bg-white px-3 py-1.5 rounded shadow-lg border border-gray-200 text-xs font-mono font-medium -translate-x-1/2 -translate-y-full pointer-events-none"
                style={{ top: positionLabel.top, left: positionLabel.left }}
              >
                  {positionLabel.text}
              </div>
          )}
        </div>
      </div>

      {/* View Selector */}
      <div className="border-t bg-gray-100 py-2 flex justify-center">
        <div className="bg-white border border-gray-200 rounded px-3 py-1.5 flex gap-3 items-end">
          {VIEWS.map((view) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`flex flex-col items-center gap-1 group ${
                currentView === view.id ? "text-teal-600" : "text-gray-500"
              }`}
            >
              <div className={`w-16 h-16 rounded border-2 overflow-hidden bg-gray-100 relative ${
                currentView === view.id ? "border-teal-600" : "border-gray-200 group-hover:border-gray-300"
              }`}>
                <img
                  src={getProductImage(view.id, selectedColor)}
                  alt={view.label}
                  className="absolute inset-0 w-full h-full object-contain mix-blend-multiply z-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/100x100/e5e5e5/a0a0a0?text=${view.label}`;
                  }}
                />
              </div>
              <span className="text-[10px] font-medium">{view.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
