import { useRef, useState } from "react";
export function useBoardImages() {
  const imageStore = useRef(new Map<string, Blob>());
  const storeImage = (blob: Blob): string => {
    const id = `img:${crypto.randomUUID()}`;
    imageStore.current.set(id, blob);
    return id;
  };

  const objectUrlCache = useRef(new Map<string, string>());
  const [, setTick] = useState(0);

  const inflight = useRef(new Map<string, Promise<string>>());
  const urlToKey = useRef(new Map<string, string>());

  const cacheRemoteImage = async (url: string): Promise<string> => {
    if (!url || url.startsWith("img:") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    const existing = urlToKey.current.get(url);
    if (existing && imageStore.current.has(existing)) return existing;

    const pending = inflight.current.get(url);
    if (pending) return pending;

    const p = (async () => {
      const proxied = `${process.env.NEXT_PUBLIC_PROXY_URL}/api/proxy?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxied);
      if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);
      const blob = await res.blob();
      const key = storeImage(blob);
      urlToKey.current.set(url, key);
      return key;
    })();

    inflight.current.set(url, p);
    try {
      return await p;
    } finally {
      inflight.current.delete(url);
    }
  };

  const resolveImage = (imageKey: string): string | null => {
    if (!imageKey?.startsWith("img:")) return imageKey;

    const blob = imageStore.current.get(imageKey);
    if (!blob) return null;

    if (objectUrlCache.current.has(imageKey)) {
      return objectUrlCache.current.get(imageKey)!;
    }

    const url = URL.createObjectURL(blob);
    objectUrlCache.current.set(imageKey, url);

    setTimeout(() => setTick((t) => t + 1), 0);

    return url;
  };
  const setImage = (key: string, blob: Blob) => {
    imageStore.current.set(key, blob);
    setTick((t) => t + 1);
  };
  const clearImages = () => {
    imageStore.current.clear();
    objectUrlCache.current.clear();
  };
  const getImageEntries = () => Array.from(imageStore.current.entries());
  return {
    storeImage,
    resolveImage,
    setImage,
    clearImages,
    getImageEntries,
    cacheRemoteImage,
  };
}
