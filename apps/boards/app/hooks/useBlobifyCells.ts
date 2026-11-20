import { useEffect, useRef } from "react";
import type { useBoardCells } from "@/hooks/useBoardCells";
import type { useBoardImages } from "@/hooks/useBoardImages";

const isRemote = (u: string) => /^https?:\/\//i.test(u);

export function useBlobifyCells(
  cellsState: ReturnType<typeof useBoardCells>,
  images: ReturnType<typeof useBoardImages>,
) {
  const { cells, setCells } = cellsState;
  const { cacheRemoteImage } = images;
  const failed = useRef(new Set<string>());

  useEffect(() => {
    const urls = new Set<string>();
    for (const c of cells) {
      for (const u of c?.images ?? []) {
        if (isRemote(u) && !failed.current.has(u)) urls.add(u);
      }
    }
    if (urls.size === 0) return;

    const t = setTimeout(() => {
      for (const url of urls) {
        cacheRemoteImage(url)
          .then((key) => {
            setCells((prev) => {
              let changed = false;
              const next = prev.map((c) => {
                if (!c?.images?.includes(url)) return c;
                changed = true;
                return { ...c, images: c.images.map((u) => (u === url ? key : u)) };
              });
              return changed ? next : prev;
            });
          })
          .catch((e) => {
            failed.current.add(url);
            console.warn("Failed to cache image", url, e);
          });
      }
    }, 400);

    return () => clearTimeout(t);
  }, [cells, setCells]);
}
