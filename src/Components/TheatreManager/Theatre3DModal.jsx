"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  X,
  Maximize2,
  Compass,
  Building,
  Info,
  DoorOpen,
  Coffee,
  Armchair,
  Layers,
} from "lucide-react";

export default function Theatre3DModal({ theatre, isOpen, onClose }) {
  const mountRef = useRef(null);
  const [lightingMode, setLightingMode] = useState("showtime"); // "showtime" | "bright" | "lounge"
  const [cameraView, setCameraView] = useState("overview");
  const [hoveredObject, setHoveredObject] = useState(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !theatre || !mountRef.current) return;

    // Load rich layout from localStorage if available
    let layout = null;
    try {
      const saved =
        localStorage.getItem(`nataka_theatre_layout_${theatre.id}`) ||
        localStorage.getItem(`nataka_theatre_layout_${theatre.name}`);
      if (saved) layout = JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load stored layout", e);
    }

    const stage = layout?.stage || {
      label: "MAIN STAGE",
      width: 14,
      depth: 5,
      elevation: 1.1,
      curtainColor: "#661F19",
    };

    const doors = layout?.doors || [
      { id: "d-1", label: "MAIN DOUBLE ENTRANCE", type: "main", wall: "south", position: 50, width: 3.5 },
      { id: "d-2", label: "WEST FIRE EXIT", type: "emergency", wall: "west", position: 20, width: 2.0 },
      { id: "d-3", label: "EAST FIRE EXIT", type: "emergency", wall: "east", position: 20, width: 2.0 },
    ];

    const tables = layout?.tables || [];
    const seatTypes = theatre.seatTypes || layout?.seatTypes || [
      { typeName: "VIP", totalSeats: 30, seatsPerRow: 15, rows: 2, price: 3500 },
      { typeName: "Standard", totalSeats: 60, seatsPerRow: 20, rows: 3, price: 1500 },
    ];

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090e);
    scene.fog = new THREE.FogExp2(0x09090e, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 16, 26);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 3;
    controls.maxDistance = 70;
    controlsRef.current = controls;

    // 5. Lights
    const ambient = new THREE.AmbientLight(
      0xffffff,
      lightingMode === "bright" ? 1.2 : lightingMode === "lounge" ? 0.4 : 0.3
    );
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfffaed, lightingMode === "bright" ? 1.0 : 0.4);
    dirLight.position.set(10, 25, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Stage Spotlights
    const s1 = new THREE.SpotLight(0xffe6a3, lightingMode === "showtime" ? 2.8 : 1.2, 45, Math.PI / 4, 0.4);
    s1.position.set(-5, 12, 3);
    s1.target.position.set(-2, 1, 9);
    s1.castShadow = true;
    scene.add(s1);
    scene.add(s1.target);

    const s2 = new THREE.SpotLight(0xffb7b7, lightingMode === "showtime" ? 2.8 : 1.2, 45, Math.PI / 4, 0.4);
    s2.position.set(5, 12, 3);
    s2.target.position.set(2, 1, 9);
    s2.castShadow = true;
    scene.add(s2);
    scene.add(s2.target);

    // 6. Auditorium Shell
    const hallWidth = 26;
    const hallLength = 34;
    const hallHeight = 10;

    // Floor
    const floorGeo = new THREE.BoxGeometry(hallWidth, 0.5, hallLength);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x14141c, roughness: 0.8 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.25, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Aisle Runner
    const aisleGeo = new THREE.PlaneGeometry(2.4, hallLength - 8);
    const aisleMat = new THREE.MeshStandardMaterial({ color: 0x541612, roughness: 0.9 });
    const aisleMesh = new THREE.Mesh(aisleGeo, aisleMat);
    aisleMesh.rotation.x = -Math.PI / 2;
    aisleMesh.position.set(0, 0.01, 2);
    scene.add(aisleMesh);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1b1b24, roughness: 0.7 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(hallWidth, hallHeight, 0.6), wallMat);
    backWall.position.set(0, hallHeight / 2, hallLength / 2);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(hallWidth, hallHeight, 0.6), wallMat);
    frontWall.position.set(0, hallHeight / 2, -hallLength / 2);
    scene.add(frontWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, hallHeight, hallLength), wallMat);
    westWall.position.set(-hallWidth / 2, hallHeight / 2, 0);
    scene.add(westWall);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, hallHeight, hallLength), wallMat);
    eastWall.position.set(hallWidth / 2, hallHeight / 2, 0);
    scene.add(eastWall);

    // 7. Stage
    const stageWidth = stage.width || 14;
    const stageDepth = stage.depth || 5;
    const stageElevation = stage.elevation || 1.1;
    const stageZ = -hallLength / 2 + stageDepth / 2 + 1;

    const stageMesh = new THREE.Mesh(
      new THREE.BoxGeometry(stageWidth, stageElevation, stageDepth),
      new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.45 })
    );
    stageMesh.position.set(0, stageElevation / 2, stageZ);
    stageMesh.castShadow = true;
    stageMesh.receiveShadow = true;
    scene.add(stageMesh);

    // Curtains
    const curtainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(stage.curtainColor || "#661F19"),
      roughness: 0.85,
    });
    const curtainMesh = new THREE.Mesh(new THREE.BoxGeometry(stageWidth + 1, 6, 0.4), curtainMat);
    curtainMesh.position.set(0, stageElevation + 3, stageZ - stageDepth / 2 + 0.3);
    scene.add(curtainMesh);

    // 8. Doors & Exit Signs
    doors.forEach((door) => {
      const dg = new THREE.Group();
      let x = 0;
      let y = 1.3;
      let z = 0;
      let rotY = 0;
      const normPos = ((door.position || 50) - 50) / 100;

      if (door.wall === "south") {
        x = normPos * (hallWidth - 4);
        z = hallLength / 2 - 0.35;
        rotY = Math.PI;
      } else if (door.wall === "north") {
        x = normPos * (hallWidth - 4);
        z = -hallLength / 2 + 0.35;
        rotY = 0;
      } else if (door.wall === "west") {
        x = -hallWidth / 2 + 0.35;
        z = normPos * (hallLength - 6);
        rotY = Math.PI / 2;
      } else if (door.wall === "east") {
        x = hallWidth / 2 - 0.35;
        z = normPos * (hallLength - 6);
        rotY = -Math.PI / 2;
      }

      dg.position.set(x, y, z);
      dg.rotation.y = rotY;

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(door.width || 2, 2.6, 0.2),
        new THREE.MeshStandardMaterial({
          color: door.type === "emergency" ? 0x15803d : 0x3d2314,
        })
      );
      dg.add(frame);

      if (door.type === "emergency") {
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.45, 0.25),
          new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x16a34a,
            emissiveIntensity: 1.8,
          })
        );
        sign.position.set(0, 1.6, 0.1);
        dg.add(sign);

        const ptLight = new THREE.PointLight(0x22c55e, 0.8, 6);
        ptLight.position.set(0, 1.6, 0.4);
        dg.add(ptLight);
      }

      dg.userData = {
        title: door.label,
        details: `Type: ${door.type.toUpperCase()} | Wall: ${door.wall.toUpperCase()}`,
      };
      scene.add(dg);
    });

    // 9. Tables & Dining Chairs
    tables.forEach((tbl) => {
      const tg = new THREE.Group();
      tg.position.set(tbl.x, 0, tbl.y);
      const rad = tbl.type === "round" ? 1.0 : 1.2;

      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(rad, rad, 0.08, 20),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
      );
      top.position.y = 0.85;
      tg.add(top);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.8, 12),
        new THREE.MeshStandardMaterial({ color: 0x1f2937 })
      );
      leg.position.y = 0.4;
      tg.add(leg);

      // Radial Chairs
      const cCount = tbl.seats || 6;
      for (let i = 0; i < cCount; i++) {
        const ang = (i * 2 * Math.PI) / cCount;
        const cg = new THREE.Group();
        cg.position.set(Math.cos(ang) * (rad + 0.45), 0, Math.sin(ang) * (rad + 0.45));
        cg.rotation.y = -ang - Math.PI / 2;

        const cSeat = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.06, 0.4),
          new THREE.MeshStandardMaterial({ color: 0x85261f })
        );
        cSeat.position.y = 0.45;
        cg.add(cSeat);

        const cBack = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.42, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x85261f })
        );
        cBack.position.set(0, 0.68, -0.18);
        cg.add(cBack);

        tg.add(cg);
      }

      tg.userData = {
        title: `Table: ${tbl.tableNumber}`,
        details: `${tbl.tier} | ${tbl.seats} Seats | LKR ${(tbl.price || 5000).toLocaleString()}`,
      };
      scene.add(tg);
    });

    // 10. Tiered Seats
    const TIER_COLORS = {
      VIP: 0xfed800,
      Premium: 0xe11d48,
      Standard: 0x3b82f6,
      Balcony: 0x10b981,
    };

    let currentRowZ = 4.5;
    let currentRiserElev = 0.2;

    seatTypes.forEach((tier) => {
      const rows = tier.rows || Math.ceil((tier.totalSeats || 20) / (tier.seatsPerRow || 15));
      const seatsInRow = tier.seatsPerRow || 15;
      const tColor = TIER_COLORS[tier.typeName] || 0x3b82f6;

      for (let r = 0; r < rows; r++) {
        const rElev = currentRiserElev + r * 0.35;
        const rZ = currentRowZ + r * 1.35;

        // Riser
        const rm = new THREE.Mesh(
          new THREE.BoxGeometry(hallWidth - 3, 0.32, 1.3),
          new THREE.MeshStandardMaterial({ color: 0x1f1f28, roughness: 0.8 })
        );
        rm.position.set(0, rElev - 0.16, rZ);
        scene.add(rm);

        // Seats
        const seatSpacing = 0.65;
        const rowWidth = seatsInRow * seatSpacing;
        for (let s = 0; s < seatsInRow; s++) {
          let sx = -rowWidth / 2 + s * seatSpacing;
          if (sx >= -0.9 && sx <= 0.9) continue; // center aisle

          const sg = new THREE.Group();
          sg.position.set(sx, rElev, rZ);

          const seatMat = new THREE.MeshStandardMaterial({ color: tColor, roughness: 0.6 });
          const sc = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.45), seatMat);
          sc.position.y = 0.35;
          sg.add(sc);

          const sb = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.1), seatMat);
          sb.position.set(0, 0.6, -0.18);
          sg.add(sb);

          sg.userData = {
            title: `${tier.typeName} - Row ${String.fromCharCode(65 + r)} #${s + 1}`,
            details: `Capacity Tier: ${tier.typeName}`,
          };
          scene.add(sg);
        }
      }
      currentRowZ += rows * 1.35 + 0.8;
      currentRiserElev += rows * 0.35;
    });

    // 11. Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (evt) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      if (hits.length > 0) {
        let cur = hits[0].object;
        while (cur && !cur.userData?.title && cur.parent) cur = cur.parent;
        if (cur?.userData?.title) {
          setHoveredObject(cur.userData);
          return;
        }
      }
      setHoveredObject(null);
    };
    renderer.domElement.addEventListener("mousemove", onPointerMove);

    // 12. Animation
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("mousemove", onPointerMove);
      }
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      renderer.forceContextLoss();
      const gl = renderer.getContext();
      if (gl && typeof gl.getExtension === "function") {
        const loseExt = gl.getExtension("WEBGL_lose_context");
        if (loseExt) loseExt.loseContext();
      }
    };
  }, [isOpen, theatre, lightingMode]);

  const setCameraPreset = (preset) => {
    setCameraView(preset);
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (preset === "overview") {
      cam.position.set(0, 16, 26);
      ctrl.target.set(0, 2, 0);
    } else if (preset === "stage") {
      cam.position.set(0, 3, -12);
      ctrl.target.set(0, 2, 10);
    } else if (preset === "center") {
      cam.position.set(0, 3.5, 6);
      ctrl.target.set(0, 2, -12);
    } else if (preset === "entrance") {
      cam.position.set(0, 3, 16);
      ctrl.target.set(0, 2, -12);
    } else if (preset === "top") {
      cam.position.set(0, 36, 0);
      ctrl.target.set(0, 0, 0);
    }
    ctrl.update();
  };

  if (!isOpen || !theatre) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#101018] border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#181824] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FED800]/20 border border-[#FED800]/40 flex items-center justify-center text-[#FED800]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{theatre.name}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {theatre.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Capacity: {theatre.totalCapacity || "Standard"} Seats & Tables • 3D Hall Visualizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Camera Presets */}
            <div className="hidden sm:flex items-center bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setCameraPreset("overview")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  cameraView === "overview" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setCameraPreset("stage")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  cameraView === "stage" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300"
                }`}
              >
                Stage POV
              </button>
              <button
                onClick={() => setCameraPreset("center")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  cameraView === "center" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300"
                }`}
              >
                Audience POV
              </button>
              <button
                onClick={() => setCameraPreset("top")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  cameraView === "top" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300"
                }`}
              >
                Top-Down
              </button>
            </div>

            {/* Lighting Modes */}
            <div className="hidden sm:flex items-center bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setLightingMode("showtime")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  lightingMode === "showtime" ? "bg-[#661F19] text-white" : "text-slate-400"
                }`}
              >
                🎭 Showtime
              </button>
              <button
                onClick={() => setLightingMode("bright")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  lightingMode === "bright" ? "bg-[#661F19] text-white" : "text-slate-400"
                }`}
              >
                💡 Bright
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Canvas Body */}
        <div className="flex-1 relative w-full h-full">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Hover HUD */}
          {hoveredObject && (
            <div className="absolute bottom-6 left-6 bg-black/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#FED800]/50 shadow-2xl z-20 pointer-events-none">
              <div className="text-xs font-bold text-[#FED800] uppercase tracking-wide">
                {hoveredObject.title}
              </div>
              <div className="text-[11px] text-slate-300">{hoveredObject.details}</div>
            </div>
          )}

          {/* Controls helper */}
          <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-slate-300">
            Rotate: Left-Click Drag • Zoom: Scroll • Pan: Right-Click Drag
          </div>
        </div>
      </div>
    </div>
  );
}
