"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useReorderFlip(orderKey: string) {
  const nodes = useRef(new Map<number | string, HTMLElement>());
  const callbacks = useRef(new Map<number | string, (el: HTMLElement | null) => void>());
  const tops = useRef(new Map<number | string, number>());

  const register = useCallback((key: number | string) => {
    let cb = callbacks.current.get(key);
    if (!cb) {
      cb = (el: HTMLElement | null) => {
        if (el) nodes.current.set(key, el);
        else nodes.current.delete(key);
      };
      callbacks.current.set(key, cb);
    }
    return cb;
  }, []);

  useIsoLayoutEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const next = new Map<number | string, number>();

    nodes.current.forEach((el, key) => {
      const top = el.offsetTop;
      next.set(key, top);
      if (reduce) return;
      const prev = tops.current.get(key);
      if (prev === undefined || prev === top) return;
      el.animate([{ transform: `translateY(${prev - top}px)` }, { transform: "translateY(0)" }], {
        duration: 300,
        easing: EASE,
      });
    });

    tops.current = next;
  }, [orderKey]);

  return register;
}
