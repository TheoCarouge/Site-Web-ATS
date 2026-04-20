export interface SavedDesign {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  productHandle: string;
  productTitle: string;
  color: string;
  thumbnail: string; // base64 dataURL (main thumbnail shown in Mes Designs)
  productImageUrl?: string; // front mockup URL for display in drawer
  viewThumbnails?: Record<string, string>; // view → base64 dataURL per view
  canvasStates: Record<string, string>; // view → canvas JSON
}

const STORAGE_KEY = "ats_designs";

function readAll(): SavedDesign[] {
  try {
    const raw: any[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return raw
      .filter(d => d.id !== "draft" && !d.isDraft)
      .map(({ isDraft: _d, ...rest }) => rest as SavedDesign);
  } catch {
    return [];
  }
}

function writeAll(designs: SavedDesign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

export function useDesigns() {
  const getAll = (): SavedDesign[] => readAll();

  const save = (design: SavedDesign) => {
    const all = readAll().filter(d => d.id !== design.id);
    writeAll([design, ...all]);
  };

  const remove = (id: string) => {
    writeAll(readAll().filter(d => d.id !== id));
  };

  return { getAll, save, remove };
}
