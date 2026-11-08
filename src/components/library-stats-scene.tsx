"use client";

import { useEffect, useRef, useState } from "react";

export type LibraryStatPoint = { key: string; label: string; value: number };

export function LibraryStatsScene({ points }: { points: LibraryStatPoint[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    let disposed = false;
    let animationFrame = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let removeCanvasListeners: (() => void) | null = null;

    void import("three").then((THREE) => {
      const host = hostRef.current;
      if (!host || disposed) return;
      if (window.matchMedia("(max-width: 720px)").matches) {
        setWebglUnavailable(true);
        return;
      }

      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch {
        setWebglUnavailable(true);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      const activeScene = new THREE.Scene();
      scene = activeScene;
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
      camera.position.set(0, 6.8, 10.5);
      camera.lookAt(0, 1, 0);

      const chart = new THREE.Group();
      activeScene.add(chart);
      activeScene.add(new THREE.HemisphereLight(0xfff5e8, 0x342420, 2.2));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(-3, 8, 5);
      activeScene.add(keyLight);

      const baseColor = getComputedStyle(document.documentElement).getPropertyValue("--maviri-raised").trim() || "#342420";
      const groundMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(baseColor), roughness: 0.86, metalness: 0.08 });
      const ground = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.1, 0.14, 56), groundMaterial);
      ground.position.y = -0.09;
      chart.add(ground);

      const theme = getComputedStyle(document.documentElement);
      const tokens = ["--maviri-accent", "--maviri-butter", "--maviri-matcha", "--maviri-lilac", "--maviri-accent"];
      const colors = tokens.map((token) => theme.getPropertyValue(token).trim() || "#d69b54");
      const peak = Math.max(1, ...points.map((point) => point.value));
      const count = points.length;
      const spacing = count > 1 ? 6.4 / (count - 1) : 0;

      points.forEach((point, index) => {
        if (point.value <= 0) return;
        const height = 0.35 + (point.value / peak) * 3.15;
        const geometry = new THREE.BoxGeometry(0.62, height, 0.62);
        const material = new THREE.MeshStandardMaterial({ color: colors[index % colors.length], roughness: 0.43, metalness: 0.12 });
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set((index - (count - 1) / 2) * spacing, height / 2, 0);
        bar.userData.label = point.label;
        bar.userData.value = point.value;
        chart.add(bar);
      });

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let pointerDown = false;
      let previousX = 0;
      let rotationVelocity = 0;

      const draw = () => renderer?.render(activeScene, camera);
      const resize = () => {
        if (!renderer || !hostRef.current) return;
        const { width, height } = hostRef.current.getBoundingClientRect();
        renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
        camera.aspect = Math.max(width, 1) / Math.max(height, 1);
        camera.updateProjectionMatrix();
        draw();
      };
      const pointerStart = (event: PointerEvent) => {
        pointerDown = true;
        previousX = event.clientX;
        rotationVelocity = 0;
        renderer?.domElement.setPointerCapture(event.pointerId);
      };
      const pointerMove = (event: PointerEvent) => {
        if (!pointerDown) return;
        const delta = event.clientX - previousX;
        previousX = event.clientX;
        chart.rotation.y += delta * 0.008;
        rotationVelocity = reducedMotion.matches ? 0 : delta * 0.00012;
        draw();
      };
      const pointerEnd = () => { pointerDown = false; };

      renderer.domElement.addEventListener("pointerdown", pointerStart);
      renderer.domElement.addEventListener("pointermove", pointerMove);
      renderer.domElement.addEventListener("pointerup", pointerEnd);
      renderer.domElement.addEventListener("pointercancel", pointerEnd);
      removeCanvasListeners = () => {
        renderer?.domElement.removeEventListener("pointerdown", pointerStart);
        renderer?.domElement.removeEventListener("pointermove", pointerMove);
        renderer?.domElement.removeEventListener("pointerup", pointerEnd);
        renderer?.domElement.removeEventListener("pointercancel", pointerEnd);
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      const animate = () => {
        if (disposed || !renderer) return;
        if (!pointerDown && Math.abs(rotationVelocity) > 0.00001) {
          chart.rotation.y += rotationVelocity;
          rotationVelocity *= 0.94;
        }
        draw();
        if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);
      };
      if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);

    }).catch(() => {
      if (!disposed) setWebglUnavailable(true);
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      removeCanvasListeners?.();
      scene?.traverse((object) => {
        const mesh = object as import("three").Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose();
      });
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [points]);

  return (
    <div className="maviri-stats-scene">
      <div className="maviri-stats-scene__canvas" ref={hostRef} aria-hidden="true" />
      <div className="maviri-stats-scene__caption">
        <span>{webglUnavailable ? "ACCESSIBLE STAT VIEW" : "YOUR COLLECTION / ORBITAL VIEW"}</span>
        <p>{webglUnavailable ? "The chart remains available below in an accessible, lightweight view." : "Drag the scene to turn your personal collection."}</p>
      </div>
    </div>
  );
}
