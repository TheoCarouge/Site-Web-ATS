import { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from "react";
import * as fabric from "fabric";
import { fetchProduct, createCheckout, addItemToCheckout } from "@/lib/shopify";
import { useDesigns, SavedDesign } from "@/hooks/useDesigns";

interface CustomizerContextType {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  activeObject: fabric.Object | null;
  addText: () => void;
  addImage: (file: File) => void;
  deleteSelected: (target?: fabric.Object) => void;
  duplicate: () => void;
  moveLayer: (direction: 'up' | 'down' | 'front' | 'back') => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  productImages: Record<string, Record<string, string>>;
  activeModal: 'products' | null;
  setActiveModal: (modal: 'products' | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
  isDesignValid: boolean;
  setIsDesignValid: (isValid: boolean) => void;
  setCurrentProductImageUrl: (url: string) => void;
  viewProductImages: Record<string, string>;
  setViewProductImages: (images: Record<string, string>) => void;
  getCanvasStates: () => Record<string, string>;
  saveCurrentViewState: () => void;
  loadShopifyProduct: (handle: string) => Promise<void>;
  // ── Save system ──
  showSaveModal: boolean;
  setShowSaveModal: (v: boolean) => void;
  showMyDesigns: boolean;
  setShowMyDesigns: (v: boolean) => void;
  saveDesign: (name: string, forceNew?: boolean) => Promise<void>;
  loadSavedDesign: (design: SavedDesign) => Promise<void>;
  newDesign: () => void;
  savedDesigns: SavedDesign[];
  deleteSavedDesign: (id: string) => void;
  renameDesign: (id: string, name: string) => void;
  markModified: () => void;
  currentDesignId: string | null;
  isDirty: boolean;
}

const CustomizerContext = createContext<CustomizerContextType | undefined>(undefined);

const MAX_HISTORY = 50;

function captureDataURL(c: fabric.Canvas): string {
  return (c as any).toDataURL({ format: 'png', multiplier: 0.5 });
}

function serializeCanvas(c: fabric.Canvas): string {
  return JSON.stringify((c as any).toJSON(['centeredScaling', 'lockScalingFlip']));
}

async function generateThumbnailFromJSON(json: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.objects || parsed.objects.length === 0) { resolve(''); return; }
      const el = document.createElement('canvas');
      el.width = 500; el.height = 500;
      const temp = new (fabric as any).StaticCanvas(el, { width: 500, height: 500 });
      (temp as any).loadFromJSON(json, () => {
        temp.requestRenderAll();
        const dataURL = (temp as any).toDataURL({ format: 'png', multiplier: 0.4 });
        temp.dispose();
        resolve(dataURL);
      });
    } catch { resolve(''); }
  });
}


export function CustomizerProvider({ children }: { children: ReactNode }) {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [selectedColor, setSelectedColor] = useState("Noir");
  const [currentView, setCurrentView] = useState("front");
  const [activeModal, setActiveModal] = useState<'products' | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDesignValid, setIsDesignValid] = useState(true);
  const currentProductImageUrlRef = useRef("");
  const [viewProductImages, setViewProductImages] = useState<Record<string, string>>({});
  const getCanvasStates = () => ({ ...canvasStates.current });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  // Save system
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showMyDesigns, setShowMyDesigns] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const designs = useDesigns();

  // Canvas state per view (persisted across view switches)
  const canvasStates = useRef<Record<string, string>>({});
  // Prevent saving during internal canvas operations
  const isInternalUpdate = useRef(false);

  // Undo / Redo stacks per view
  const undoStacks = useRef<Record<string, string[]>>({});
  const redoStacks = useRef<Record<string, string[]>>({});

  const [selectedProduct, setSelectedProduct] = useState<any>({
    id: 1,
    title: "Sweat-shirt à capuche unisexe",
    price: "30,99 €",
    baseImage: "https://placehold.co/600x600/1a1a1a/ffffff?text=Hoodie"
  });

  const getProductImage = (view: string, color: string) => {
    if (!selectedProduct) return "";
    if (selectedProduct.metafields) {
      const viewKey = view.toLowerCase();
      let imageUrl: string | null = null;
      if (viewKey === "front") imageUrl = selectedProduct.metafields.mockupFront?.reference?.image?.url;
      else if (viewKey === "back") imageUrl = selectedProduct.metafields.mockupBack?.reference?.image?.url;
      else if (viewKey === "left") imageUrl = selectedProduct.metafields.mockupLeft?.reference?.image?.url;
      else if (viewKey === "right") imageUrl = selectedProduct.metafields.mockupRight?.reference?.image?.url;
      if (imageUrl) return imageUrl;
    }
    if (selectedProduct.baseImage && !selectedProduct.baseImage.includes("placehold.co")) {
      return selectedProduct.baseImage;
    }
    const productType = selectedProduct.title?.includes("T-shirt") ? "T-Shirt" : "Hoodie";
    const hexColor = color === "Noir" ? "1a1a1a" :
                     color === "Blanc" ? "ffffff" :
                     color === "Rouge" ? "dc2626" : "1e3a8a";
    const textColor = color === "Blanc" ? "000000" : "ffffff";
    return `https://placehold.co/600x600/${hexColor}/${textColor}?text=${productType}+${view}`;
  };

  const productImages = {
    front: { "Noir": getProductImage("Front", "Noir"), "Blanc": getProductImage("Front", "Blanc"), "Rouge": getProductImage("Front", "Rouge"), "Bleu marine": getProductImage("Front", "Bleu marine") },
    back: { "Noir": getProductImage("Back", "Noir"), "Blanc": getProductImage("Back", "Blanc"), "Rouge": getProductImage("Back", "Rouge"), "Bleu marine": getProductImage("Back", "Bleu marine") },
    right: { "Noir": getProductImage("Right", "Noir"), "Blanc": getProductImage("Right", "Blanc"), "Rouge": getProductImage("Right", "Rouge"), "Bleu marine": getProductImage("Right", "Bleu marine") },
    left: { "Noir": getProductImage("Left", "Noir"), "Blanc": getProductImage("Left", "Blanc"), "Rouge": getProductImage("Left", "Rouge"), "Bleu marine": getProductImage("Left", "Bleu marine") },
  };

  const currentViewRef = useRef(currentView);
  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);

  // Load saved designs on mount
  useEffect(() => {
    setSavedDesigns(designs.getAll());
  }, []);

  // ─── History ───────────────────────────────────────────────────────────────

  const pushToHistory = () => {
    if (!canvas || isInternalUpdate.current) return;
    const view = currentViewRef.current;
    const json = serializeCanvas(canvas);
    if (!undoStacks.current[view]) undoStacks.current[view] = [];
    undoStacks.current[view].push(json);
    if (undoStacks.current[view].length > MAX_HISTORY) undoStacks.current[view].shift();
    redoStacks.current[view] = [];
    setCanUndo(true);
    setCanRedo(false);
  };

  const applyCanvasState = async (c: fabric.Canvas, json: string, view: string) => {
    isInternalUpdate.current = true;
    c.discardActiveObject();
    setActiveObject(null);
    await (c as any).loadFromJSON(json);
    c.forEachObject((obj) => {
      obj.set({ selectable: true, evented: true, centeredScaling: true, lockScalingFlip: true });
      obj.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
    });
    c.requestRenderAll();
    canvasStates.current[view] = json;
    isInternalUpdate.current = false;
  };

  const undo = () => {
    if (!canvas) return;
    const view = currentViewRef.current;
    const stack = undoStacks.current[view];
    if (!stack || stack.length === 0) return;

    const currentState = serializeCanvas(canvas);
    if (!redoStacks.current[view]) redoStacks.current[view] = [];
    redoStacks.current[view].push(currentState);

    const prevState = stack.pop()!;
    applyCanvasState(canvas, prevState, view);

    setCanUndo(stack.length > 0);
    setCanRedo(true);
  };

  const redo = () => {
    if (!canvas) return;
    const view = currentViewRef.current;
    const stack = redoStacks.current[view];
    if (!stack || stack.length === 0) return;

    const currentState = serializeCanvas(canvas);
    if (!undoStacks.current[view]) undoStacks.current[view] = [];
    undoStacks.current[view].push(currentState);

    const nextState = stack.pop()!;
    applyCanvasState(canvas, nextState, view);

    setCanRedo(stack.length > 0);
    setCanUndo(true);
  };

  // ─── View state persistence ────────────────────────────────────────────────

  // Serializes the current canvas into canvasStates ref. Called before every view switch.
  const saveCurrentViewState = () => {
    if (isInternalUpdate.current || !canvas) return;
    const view = currentViewRef.current;
    canvasStates.current[view] = serializeCanvas(canvas);
  };

  // Loads the saved state for `view` into the canvas.
  const loadViewState = async (view: string) => {
    if (!canvas) return;
    isInternalUpdate.current = true;
    canvas.discardActiveObject();
    setActiveObject(null);
    canvas.clear();
    const savedState = canvasStates.current[view];
    if (savedState) {
      await (canvas as any).loadFromJSON(savedState);
      canvas.forEachObject((obj) => {
        obj.set({ selectable: true, evented: true, centeredScaling: true, lockScalingFlip: true });
        obj.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
      });
      canvas.requestRenderAll();
      canvas.calcOffset();
    } else {
      canvas.requestRenderAll();
    }
    isInternalUpdate.current = false;
  };

  const handleSetCurrentView = (view: string) => {
    if (view === currentView) return;
    saveCurrentViewState();   // persist current canvas state before leaving
    setCurrentView(view);     // update UI (active button highlight)
    loadViewState(view);      // load the new view immediately — no useEffect delay
  };

  // Load the front view once the canvas is ready on mount.
  useEffect(() => {
    if (canvas) loadViewState(currentView);
  }, [canvas]); // intentionally omits currentView: view switches are handled directly above

  // ─── Canvas event listeners ────────────────────────────────────────────────

  useEffect(() => {
    if (!canvas) return;
    const handleSelection = () => setActiveObject(canvas.getActiveObject());
    const handleDeselection = (e: any) => {
      setActiveObject(null);
      const deselected: fabric.Object[] = e.deselected || [];
      let modified = false;
      deselected.forEach((obj) => {
        if (obj instanceof fabric.IText && (!obj.text || obj.text.trim() === "")) {
          canvas.remove(obj);
          modified = true;
        }
      });
      if (modified) { canvas.requestRenderAll(); saveCurrentViewState(); }
    };
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleDeselection);
    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleDeselection);
    };
  }, [canvas]);

  // ─── Shopify ───────────────────────────────────────────────────────────────

  const loadShopifyProduct = async (handle: string) => {
    const product = await fetchProduct(handle);
    if (!product) return;

    const variants = (product.variants?.edges || []).map((e: any) => e.node);
    const firstVariant = variants[0];
    const rawPrice = parseFloat(firstVariant?.price?.amount || "0");

    const colorOptionName = product.options?.find((o: any) =>
      /couleur|color/i.test(o.name)
    )?.name || null;
    const sizeOptionName = product.options?.find((o: any) =>
      /taille|size/i.test(o.name)
    )?.name || null;

    const allImages = (product.images?.edges || []).map((e: any) => ({
      url: e.node.url,
      alt: e.node.altText || '',
    }));

    setSelectedProduct({
      id: product.id,
      title: product.title,
      price: `${rawPrice.toFixed(2).replace('.', ',')} €`,
      baseImage: allImages[0]?.url || "https://placehold.co/600x600/1a1a1a/ffffff?text=No+Image",
      images: allImages,
      variantId: firstVariant?.id,
      variants,
      options: product.options || [],
      colorOptionName,
      sizeOptionName,
      metafields: {
        mockupFront: product.mockupFront,
        mockupBack: product.mockupBack,
        mockupLeft: product.mockupLeft,
        mockupRight: product.mockupRight,
      },
      handle: product.handle,
    });
  };

  // ─── Design actions ────────────────────────────────────────────────────────

  const markModified = () => { if (!isInternalUpdate.current) setIsDirty(true); };

  const addText = () => {
    if (!canvas) return;
    pushToHistory();
    const text = new fabric.IText("Votre Texte", {
      left: 250,
      top: 250,
      originX: 'center',
      originY: 'center',
      fontFamily: "Arial",
      fill: "#ffffff",
      fontSize: 40,
      centeredScaling: true,
      lockScalingFlip: true
    });
    text.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveCurrentViewState();
    setIsDirty(true);
  };

  const addImage = (file: File) => {
    if (!canvas) return;
    pushToHistory();
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      const imgObj = new Image();
      imgObj.src = data;
      imgObj.onload = () => {
        const imgInstance = new fabric.Image(imgObj);
        imgInstance.scaleToWidth(150);
        imgInstance.set({
          left: 250,
          top: 250,
          originX: 'center',
          originY: 'center',
          centeredScaling: true,
          lockScalingFlip: true
        });
        imgInstance.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
        canvas.add(imgInstance);
        canvas.setActiveObject(imgInstance);
        canvas.renderAll();
        saveCurrentViewState();
        setIsDirty(true);
      };
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = (target?: fabric.Object) => {
    if (!canvas) return;
    const canvasActive = canvas.getActiveObjects();
    let activeObjects: fabric.Object[] = [];
    if (canvasActive.length > 0) {
      activeObjects = canvasActive;
    } else if (target) {
      if (target.type === 'activeSelection' && (target as any).getObjects) {
        activeObjects = (target as any).getObjects();
      } else {
        activeObjects = [target];
      }
    }
    if (activeObjects.length > 0) {
      pushToHistory();
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.renderAll();
      setActiveObject(null);
      saveCurrentViewState();
      setIsDirty(true);
    }
  };

  const duplicate = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    pushToHistory();
    active.clone().then((cloned: fabric.Object) => {
      canvas.discardActiveObject();
      cloned.set({
        left: active.left! + 10,
        top: active.top! + 10,
        evented: true,
        centeredScaling: true,
        lockScalingFlip: true
      });
      if (cloned.type === 'activeSelection') {
        (cloned as any).canvas = canvas;
        (cloned as any).forEachObject((obj: fabric.Object) => canvas.add(obj));
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      saveCurrentViewState();
      setIsDirty(true);
    });
  };

  const moveLayer = (direction: 'up' | 'down' | 'front' | 'back') => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    pushToHistory();
    const c = canvas as any;
    switch (direction) {
      case 'up':    c.bringObjectForward(active); break;
      case 'down':  c.sendObjectBackwards(active); break;
      case 'front': c.bringObjectToFront(active); break;
      case 'back':  c.sendObjectToBack(active); break;
    }
    canvas.requestRenderAll();
    saveCurrentViewState();
    setIsDirty(true);
  };

  // ─── Save system ──────────────────────────────────────────────────────────

  const saveDesign = useCallback(async (name: string, forceNew = false) => {
    if (!canvas || !selectedProduct) return;
    saveCurrentViewState();

    // Generate per-view thumbnails
    const viewThumbnails: Record<string, string> = {};
    for (const [view, json] of Object.entries(canvasStates.current)) {
      if (json) viewThumbnails[view] = await generateThumbnailFromJSON(json);
    }

    const mainThumbnail =
      viewThumbnails['front'] ||
      Object.values(viewThumbnails).find(t => t) ||
      (canvas.getObjects().length > 0 ? captureDataURL(canvas) : '');

    const existingId = !forceNew && currentDesignId ? currentDesignId : null;
    const existing = existingId ? designs.getAll().find(d => d.id === existingId) : null;
    const design: SavedDesign = {
      id: existing ? existing.id : crypto.randomUUID(),
      name,
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now(),
      productHandle: selectedProduct.handle || "",
      productTitle: selectedProduct.title || "",
      color: selectedColor,
      thumbnail: mainThumbnail,
      productImageUrl: currentProductImageUrlRef.current,
      viewThumbnails,
      canvasStates: { ...canvasStates.current },
    };
    designs.save(design);
    setSavedDesigns(designs.getAll());
    setCurrentDesignId(design.id);
    setIsDirty(false);
    setShowSaveModal(false);
  }, [canvas, selectedProduct, selectedColor, currentDesignId]);

  const loadSavedDesign = useCallback(async (design: SavedDesign) => {
    if (!canvas) return;
    if (design.productHandle && design.productHandle !== selectedProduct?.handle) {
      await loadShopifyProduct(design.productHandle);
    }
    setSelectedColor(design.color);
    canvasStates.current = { ...design.canvasStates };
    undoStacks.current = {};
    redoStacks.current = {};
    setCanUndo(false);
    setCanRedo(false);
    // Switch to front and immediately load its canvas state
    setCurrentView("front");
    loadViewState("front");
    setCurrentDesignId(design.id);
    setIsDirty(false);
    setShowMyDesigns(false);
  }, [canvas, selectedProduct]);

  const deleteSavedDesign = (id: string) => {
    designs.remove(id);
    if (currentDesignId === id) {
      setCurrentDesignId(null);
      setIsDirty(false);
    }
    setSavedDesigns(designs.getAll());
  };

  const renameDesign = (id: string, name: string) => {
    const all = designs.getAll();
    const target = all.find(d => d.id === id);
    if (!target) return;
    designs.save({ ...target, name, updatedAt: Date.now() });
    setSavedDesigns(designs.getAll());
  };

  const newDesign = useCallback(() => {
    if (!canvas) return;
    if (currentDesignId && selectedProduct) {
      saveCurrentViewState();
      const existing = designs.getAll().find(d => d.id === currentDesignId);
      if (existing) {
        designs.save({
          ...existing,
          updatedAt: Date.now(),
          color: selectedColor,
          thumbnail: canvas.getObjects().length > 0 ? captureDataURL(canvas) : existing.thumbnail,
          canvasStates: { ...canvasStates.current },
        });
        setSavedDesigns(designs.getAll());
      }
    }
    canvas.discardActiveObject();
    canvas.clear();
    canvas.requestRenderAll();
    canvasStates.current = {};
    undoStacks.current = {};
    redoStacks.current = {};
    setCanUndo(false);
    setCanRedo(false);
    setActiveObject(null);
    setCurrentDesignId(null);
    setIsDirty(false);
    setShowMyDesigns(false);
  }, [canvas, currentDesignId, selectedProduct, selectedColor]);

  return (
    <CustomizerContext.Provider
      value={{
        canvas, setCanvas,
        activeObject,
        addText, addImage, deleteSelected, duplicate, moveLayer,
        undo, redo, canUndo, canRedo,
        selectedColor, setSelectedColor,
        currentView, setCurrentView: handleSetCurrentView,
        productImages,
        activeModal, setActiveModal,
        selectedProduct, setSelectedProduct,
        isCartOpen, setIsCartOpen,
        isDesignValid, setIsDesignValid,
        setCurrentProductImageUrl: (url: string) => { currentProductImageUrlRef.current = url; },
        viewProductImages, setViewProductImages,
        getCanvasStates,
        saveCurrentViewState,
        loadShopifyProduct,
        showSaveModal, setShowSaveModal,
        showMyDesigns, setShowMyDesigns,
        markModified,
        saveDesign, loadSavedDesign, newDesign,
        savedDesigns, deleteSavedDesign, renameDesign,
        currentDesignId, isDirty,
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
}

export function useCustomizer() {
  const context = useContext(CustomizerContext);
  if (!context) throw new Error("useCustomizer must be used within a CustomizerProvider");
  return context;
}
