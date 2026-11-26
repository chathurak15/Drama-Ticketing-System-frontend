"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  Eye,
  RotateCcw,
  Maximize2,
  Minimize2,
  Check,
  ChevronLeft,
  ChevronRight,
  Building,
  Users,
} from "lucide-react";
import { createStageActorsGroup } from "./StageActors3D";
import { useTheme } from "../../context/ThemeContext";

// Tier order priority: VIP (0: closest to stage), Normal/ODC (1: middle), Balcony (2: rear elevated)
const getCategoryPriority = (category = "") => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("vip")) return 0;
  if (
    cat.includes("nomal") ||
    cat.includes("normal") ||
    cat.includes("odc") ||
    cat.includes("standard")
  )
    return 1;
  if (
    cat.includes("balcony") ||
    cat.includes("gallery") ||
    cat.includes("upper")
  )
    return 2;
  return 3;
};

export default function Auditorium3DView({
  allSeats = [],
  selectedSeats = [],
  onSeatClick,
  showTitle = "Auditorium Performance",
  location = "Main Stage",
  activeViewMode = "3d", // "3d" | "seat" | "overview"
  povSeat = null,
  povTrigger = 0,
  onExitPov,
  onSelectPovSeat,
}) {
  const containerRef = useRef(null);
  const mountRef = useRef(null);

  // Global theme context
  const { isDark = true } = useTheme();

  // Interaction and HUD states
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [currentPovSeat, setCurrentPovSeat] = useState(povSeat);
  const [cameraMode, setCameraMode] = useState(
    povSeat || activeViewMode === "seat" ? "seat" : "overview"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // 3D Actors state (Cached in localStorage for instant retrieval & zero lag)
  const [showActors, setShowActors] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nataka_3d_show_actors");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const showActorsRef = useRef(showActors);
  const stageActorsRef = useRef(null);

  useEffect(() => {
    showActorsRef.current = showActors;
    if (typeof window !== "undefined") {
      localStorage.setItem("nataka_3d_show_actors", String(showActors));
    }
    if (stageActorsRef.current?.group) {
      stageActorsRef.current.group.visible = showActors;
    }
  }, [showActors]);

  // Auto-fading 3-second first-time hint
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Three.js core references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const instancedMeshRef = useRef(null);
  const seatListRef = useRef([]);
  const seatIdToIndexRef = useRef(new Map());
  const selectedMarkersGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Lighting references
  const ambientLightRef = useRef(null);
  const hemiLightRef = useRef(null);
  const stageLightRef = useRef(null);
  const seatingLightRef = useRef(null);
  const floorMatRef = useRef(null);
  const wallMatRef = useRef(null);

  // Stage constants: Center is (0, 1.8, -9.5); Front apron lip is at Z = -5.0
  const STAGE_Z = -9.5;
  const STAGE_EDGE_Z = -5.0;
  const STAGE_CENTER = useMemo(() => new THREE.Vector3(0, 1.8, -9.5), []);
  const OVERVIEW_CAM_POS = useMemo(() => new THREE.Vector3(0, 11, 23), []);
  const OVERVIEW_LOOK_AT = useMemo(() => new THREE.Vector3(0, 2, 0), []);

  // Animation targets
  const targetCamPosRef = useRef(new THREE.Vector3(0, 11, 23));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 2, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 2, 0));

  // First-person head rotation in Seat POV
  const firstPersonRef = useRef({
    yaw: 0,
    pitch: 0,
    baseYaw: Math.PI,
    basePitch: -0.04,
  });

  // Stable references for high-frequency events & render loop to prevent WebGL context churn
  const backdropMeshRef = useRef(null);
  const backdropTexRef = useRef(null);
  const onSeatClickRef = useRef(onSeatClick);
  useEffect(() => {
    onSeatClickRef.current = onSeatClick;
  }, [onSeatClick]);

  const jumpToSeatPovRef = useRef(null);
  const cameraModeRef = useRef(cameraMode);
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  const currentPovSeatRef = useRef(currentPovSeat);
  useEffect(() => {
    currentPovSeatRef.current = currentPovSeat;
  }, [currentPovSeat]);

  const seatPositionsRef = useRef(new Map());

  // Calculate layout coordinates for all seats in 3D space:
  // VIP TIER (Rows A -> E) closest to stage (Z ≈ -0.5m, 4.5m from stage apron Z = -5.0m)
  // NORMAL TIER immediately behind Row E
  // BALCONY TIER elevated at the rear
  const seatPositions = useMemo(() => {
    const posMap = new Map();
    if (!allSeats || allSeats.length === 0) return posMap;

    const rowsMap = new Map();
    allSeats.forEach((seat) => {
      const rowKey = seat.row;
      if (!rowsMap.has(rowKey)) {
        rowsMap.set(rowKey, {
          category: seat.category,
          row: seat.row,
          seats: [],
        });
      }
      rowsMap.get(rowKey).seats.push(seat);
    });

    // Sort rows by Tier Priority (VIP first, Normal second, Balcony third), then by row letter (A -> Z)
    const sortedRows = Array.from(rowsMap.values()).sort((a, b) => {
      const pA = getCategoryPriority(a.category);
      const pB = getCategoryPriority(b.category);
      if (pA !== pB) return pA - pB;
      return a.row.localeCompare(b.row);
    });

    let orchestraRowIdx = 0;
    let balconyRowIdx = 0;

    sortedRows.forEach((rowGroup) => {
      const isBalcony = getCategoryPriority(rowGroup.category) === 2;
      const rowSeats = rowGroup.seats.sort((a, b) => a.number - b.number);
      const count = rowSeats.length;

      let baseZ;
      let baseY;

      if (isBalcony) {
        // Balcony Tier: Elevated rear mezzanine
        baseZ = 16.5 + balconyRowIdx * 1.8;
        baseY = 4.2 + balconyRowIdx * 0.55;
        balconyRowIdx++;
      } else {
        // Orchestra / VIP & Normal Tiers: Row A is at Z = -0.5 (4.5m from stage apron lip Z = -5.0)
        baseZ = -0.5 + orchestraRowIdx * 1.65;
        baseY = 0.25 + orchestraRowIdx * 0.28;
        orchestraRowIdx++;
      }

      const arcSpread = Math.min(0.92, count * 0.075);

      rowSeats.forEach((seat) => {
        // Seats 1-8 on the left wing, seats 9-15 on the right wing
        const normalizedIndex = count > 1 ? ((seat.number - 1) / (count - 1)) * 2 - 1 : 0;
        const angle = normalizedIndex * (arcSpread / 2);
        const radius = isBalcony ? 24 + balconyRowIdx * 1.5 : 19 + orchestraRowIdx * 1.4;

        let x = Math.sin(angle) * radius;
        // Center aisle separation (1.2m wide gap between seat 8 and seat 9)
        if (count > 8) {
          x += seat.number <= 8 ? -0.6 : 0.6;
        }

        const z = baseZ + (1 - Math.cos(angle)) * 3.2;
        const y = baseY;
        const rotationY = Math.atan2(x, z - STAGE_Z);

        posMap.set(seat.seatIdentifier, {
          x,
          y,
          z,
          rotationY,
          seat,
        });
      });
    });

    return posMap;
  }, [allSeats]);

  useEffect(() => {
    seatPositionsRef.current = seatPositions;
  }, [seatPositions]);

  // Set camera view preset: "overview" or "seat"
  const setCameraPreset = useCallback(
    (mode, seat = null) => {
      setCameraMode(mode);
      isTransitioningRef.current = true;

      if (mode === "seat" && (seat || currentPovSeat || selectedSeats[0] || allSeats[0])) {
        const targetSeat = seat || currentPovSeat || selectedSeats[0] || allSeats[0];
        const pos = seatPositions.get(targetSeat.seatIdentifier);
        if (pos) {
          setCurrentPovSeat(targetSeat);
          // Realistic audience seated eye level: seatY + 1.15m, slightly forward of the backrest
          const eyeX = pos.x;
          const eyeY = pos.y + 1.15;
          const eyeZ = pos.z - 0.12;

          targetCamPosRef.current.set(eyeX, eyeY, eyeZ);
          targetLookAtRef.current.copy(STAGE_CENTER);

          if (controlsRef.current) {
            controlsRef.current.target.copy(STAGE_CENTER);
            controlsRef.current.enabled = false;
          }

          const dx = 0 - eyeX;
          const dy = 1.8 - eyeY;
          const dz = STAGE_Z - eyeZ;
          firstPersonRef.current.yaw = 0;
          firstPersonRef.current.pitch = 0;
          firstPersonRef.current.baseYaw = Math.atan2(dx, dz);
          firstPersonRef.current.basePitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
          return;
        }
      }

      // Overview Mode
      targetCamPosRef.current.copy(OVERVIEW_CAM_POS);
      targetLookAtRef.current.copy(OVERVIEW_LOOK_AT);
      if (controlsRef.current) {
        controlsRef.current.target.copy(OVERVIEW_LOOK_AT);
        controlsRef.current.enabled = true;
      }
    },
    [currentPovSeat, selectedSeats, allSeats, seatPositions, OVERVIEW_CAM_POS, OVERVIEW_LOOK_AT, STAGE_CENTER]
  );

  // Jump to specific seat POV
  const jumpToSeatPov = useCallback(
    (seat) => {
      setCameraPreset("seat", seat);
      if (onSelectPovSeat) {
        onSelectPovSeat(seat);
      }
    },
    [setCameraPreset, onSelectPovSeat]
  );

  useEffect(() => {
    jumpToSeatPovRef.current = jumpToSeatPov;
  }, [jumpToSeatPov]);

  // Cycle to previous / next seat in same row
  const navigatePovSeat = useCallback(
    (direction) => {
      if (!currentPovSeat) return;
      const sameRowSeats = allSeats
        .filter((s) => s.category === currentPovSeat.category && s.row === currentPovSeat.row)
        .sort((a, b) => a.number - b.number);

      const currentIndex = sameRowSeats.findIndex((s) => s.seatIdentifier === currentPovSeat.seatIdentifier);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex + direction;
      if (nextIndex < 0) nextIndex = sameRowSeats.length - 1;
      if (nextIndex >= sameRowSeats.length) nextIndex = 0;

      const nextSeat = sameRowSeats[nextIndex];
      jumpToSeatPov(nextSeat);
    },
    [currentPovSeat, allSeats, jumpToSeatPov]
  );

  // Sync povSeat prop changes
  useEffect(() => {
    if (povSeat) {
      setCurrentPovSeat(povSeat);
      setCameraPreset("seat", povSeat);
    }
  }, [povSeat, setCameraPreset]);

  // React explicitly when povTrigger increments (e.g. user clicked Preview in 3D from 2D Plan)
  useEffect(() => {
    if (povTrigger > 0 && (povSeat || currentPovSeat)) {
      const target = povSeat || currentPovSeat;
      setCurrentPovSeat(target);
      setCameraPreset("seat", target);
    }
  }, [povTrigger, povSeat, currentPovSeat, setCameraPreset]);

  // Sync activeViewMode prop changes
  useEffect(() => {
    if (activeViewMode === "seat") {
      const target = povSeat || selectedSeats[0] || allSeats[0];
      if (target) setCameraPreset("seat", target);
    } else if (activeViewMode === "3d" || activeViewMode === "overview") {
      if (!currentPovSeat) {
        setCameraPreset("overview");
      }
    }
  }, [activeViewMode, povSeat, selectedSeats, allSeats, setCameraPreset, currentPovSeat]);

  // Dynamic Theme Updates
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer) return;

    const bgColor = isDark ? 0x0a0a12 : 0xf1f5f9;
    scene.background = new THREE.Color(bgColor);
    if (scene.fog) {
      scene.fog.color.setHex(bgColor);
    }
    renderer.setClearColor(bgColor, 1);

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(isDark ? 0x7c8ba1 : 0xffffff);
      ambientLightRef.current.intensity = isDark ? 1.6 : 2.2;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(isDark ? 0xfff8ee : 0xffffff);
      hemiLightRef.current.groundColor.setHex(isDark ? 0x181828 : 0xdde3ea);
      hemiLightRef.current.intensity = isDark ? 1.4 : 1.8;
    }
    if (floorMatRef.current) {
      floorMatRef.current.color.setHex(isDark ? 0x0e0e18 : 0xdde3ea);
    }
    if (wallMatRef.current) {
      wallMatRef.current.color.setHex(isDark ? 0x12121f : 0xe2e8f0);
    }
  }, [isDark]);

  // Lightweight Stage Textures (512x256 for fast 3G/4G loading)
  const createWoodStageTexture = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#28140a";
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 32) {
      ctx.fillStyle = y % 64 === 0 ? "#1b0d06" : "#2f170d";
      ctx.fillRect(0, y, 256, 30);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
  }, []);

  const createStageBackdropTexture = useCallback((title, venue) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#100407");
    grad.addColorStop(0.5, "#290910");
    grad.addColorStop(1, "#18060a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    const spotGrad = ctx.createRadialGradient(256, 140, 10, 256, 140, 220);
    spotGrad.addColorStop(0, "rgba(254, 216, 0, 0.45)");
    spotGrad.addColorStop(0.6, "rgba(217, 119, 6, 0.2)");
    spotGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = "rgba(254, 216, 0, 0.95)";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ eNATAKA SRI LANKA • වේදිකා නාට්‍ය ✦", 256, 42);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText((title || "AUDITORIUM PERFORMANCE").toUpperCase(), 256, 110);

    ctx.fillStyle = "#fed800";
    ctx.font = "600 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`VENUE: ${venue || "COLOMBO MAIN THEATER"}`, 256, 138);

    ctx.strokeStyle = "rgba(254, 216, 0, 0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, 484, 228);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Dynamically update backdrop texture without rebuilding the entire WebGL scene
  useEffect(() => {
    if (backdropMeshRef.current) {
      if (backdropTexRef.current) {
        backdropTexRef.current.dispose();
      }
      const newTex = createStageBackdropTexture(showTitle, location);
      backdropTexRef.current = newTex;
      backdropMeshRef.current.material.map = newTex;
      backdropMeshRef.current.material.needsUpdate = true;
    }
  }, [showTitle, location, createStageBackdropTexture]);

  // Main Three.js Scene Setup (Mounted ONCE)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    const bgColor = isDark ? 0x0a0a12 : 0xf1f5f9;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.015);
    sceneRef.current = scene;

    // 2. Camera: Position immediately at seat POV if povSeat or seat mode active on mount
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    const initialPov = povSeat || currentPovSeat;
    const initialPos = initialPov ? seatPositions.get(initialPov.seatIdentifier) : null;

    if (initialPos && (cameraMode === "seat" || povSeat)) {
      const eyeX = initialPos.x;
      const eyeY = initialPos.y + 1.15;
      const eyeZ = initialPos.z - 0.12;
      camera.position.set(eyeX, eyeY, eyeZ);
      camera.lookAt(STAGE_CENTER);
      targetCamPosRef.current.set(eyeX, eyeY, eyeZ);
      targetLookAtRef.current.copy(STAGE_CENTER);
      currentLookAtRef.current.copy(STAGE_CENTER);
      isTransitioningRef.current = false;
    } else {
      camera.position.copy(OVERVIEW_CAM_POS);
      camera.lookAt(OVERVIEW_LOOK_AT);
    }
    cameraRef.current = camera;

    // 3. Renderer with low-network adaptive DPR
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);

    // Low-network optimization: Cap DPR to 1 on mobile / 3G / saveData connections
    const isMobileOrSlow =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        navigator.connection?.saveData ||
        ["slow-2g", "2g", "3g"].includes(navigator.connection?.effectiveType));
    const targetDpr = isMobileOrSlow ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(targetDpr);

    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(bgColor, 1);
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 1.5;
    controls.maxDistance = 45;
    if (initialPos && (cameraMode === "seat" || povSeat)) {
      controls.target.copy(STAGE_CENTER);
      controls.enabled = false;
    } else {
      controls.target.copy(OVERVIEW_LOOK_AT);
    }
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // 5. Bright, Balanced Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x7c8ba1 : 0xffffff, isDark ? 1.6 : 2.2);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(
      isDark ? 0xfff8ee : 0xffffff,
      isDark ? 0x181828 : 0xdde3ea,
      isDark ? 1.4 : 1.8
    );
    hemiLight.position.set(0, 20, 10);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const stageLight = new THREE.DirectionalLight(0xfff3d6, 2.6);
    stageLight.position.set(0, 12, -2);
    stageLight.target.position.set(0, 1.2, STAGE_Z);
    stageLightRef.current = stageLight;
    scene.add(stageLight);
    scene.add(stageLight.target);

    const seatingLight = new THREE.DirectionalLight(0xfffaee, isDark ? 1.2 : 1.5);
    seatingLight.position.set(0, 16, 14);
    seatingLight.target.position.set(0, 1.0, 7);
    seatingLightRef.current = seatingLight;
    scene.add(seatingLight);
    scene.add(seatingLight.target);

    // 6. Proscenium Stage Architecture
    const stageWidth = 22;
    const stageDepth = 9;
    const stageHeight = 0.9;

    const stageGeo = new THREE.BoxGeometry(stageWidth, stageHeight, stageDepth);
    const woodTexture = createWoodStageTexture();
    const stageMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.4,
      metalness: 0.1,
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.set(0, stageHeight / 2, STAGE_Z);
    scene.add(stageMesh);

    // Stage Backdrop Billboard
    const backdropGeo = new THREE.PlaneGeometry(stageWidth * 0.8, 7.5);
    const backdropTex = createStageBackdropTexture(showTitle, location);
    backdropTexRef.current = backdropTex;
    const backdropMat = new THREE.MeshBasicMaterial({ map: backdropTex });
    const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
    backdropMesh.position.set(0, 4.6, STAGE_Z - stageDepth / 2 + 0.2);
    backdropMeshRef.current = backdropMesh;
    scene.add(backdropMesh);

    // Velvet Curtains
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0x661f19,
      roughness: 0.9,
    });

    const leftCurtain = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9, 0.4), curtainMat);
    leftCurtain.position.set(-stageWidth / 2 + 1.25, 4.8, STAGE_Z + stageDepth / 2 - 0.2);
    scene.add(leftCurtain);

    const rightCurtain = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9, 0.4), curtainMat);
    rightCurtain.position.set(stageWidth / 2 - 1.25, 4.8, STAGE_Z + stageDepth / 2 - 0.2);
    scene.add(rightCurtain);

    const pelmet = new THREE.Mesh(new THREE.BoxGeometry(stageWidth + 1, 1.6, 0.5), curtainMat);
    pelmet.position.set(0, 9.0, STAGE_Z + stageDepth / 2);
    scene.add(pelmet);

    // 6.b 3D Sri Lankan Stage Drama Actors (5 Characters with Real-time Animation)
    // Instant loading (0 KB network request), shared low-poly cached buffers, runs smoothly at 60 FPS
    const stageActors = createStageActorsGroup();
    stageActors.group.visible = showActorsRef.current;
    scene.add(stageActors.group);
    stageActorsRef.current = stageActors;

    // 7. Auditorium Floors, Walls & Central Carpet Runner
    const floorGeo = new THREE.PlaneGeometry(36, 34);
    const floorMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0e0e18 : 0xdde3ea,
      roughness: 0.9,
    });
    floorMatRef.current = floorMat;
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -0.05, 11);
    scene.add(floorMesh);

    const carpetGeo = new THREE.PlaneGeometry(1.8, 22.5);
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x661f19,
      roughness: 0.8,
    });
    const carpetMesh = new THREE.Mesh(carpetGeo, carpetMat);
    carpetMesh.rotation.x = -Math.PI / 2;
    carpetMesh.position.set(0, 0.02, 10.5);
    scene.add(carpetMesh);

    // Acoustic Walls
    const wallGeo = new THREE.BoxGeometry(0.8, 14, 34);
    const wallMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x12121f : 0xe2e8f0,
      roughness: 0.7,
    });
    wallMatRef.current = wallMat;

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-18, 6.5, 11);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(18, 6.5, 11);
    scene.add(rightWall);

    // Selected Markers Group
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    selectedMarkersGroupRef.current = markersGroup;

    // 8. Pointer & Raycasting Interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getRaycastSeat = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (!instancedMeshRef.current) return null;

      const intersects = raycaster.intersectObject(instancedMeshRef.current, false);
      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        return seatListRef.current[intersects[0].instanceId];
      }
      return null;
    };

    let pointerDownPos = { x: 0, y: 0 };
    let lastPointerPos = { x: 0, y: 0 };
    let pointerDownTime = 0;
    let isPointerDragging = false;

    const handlePointerDown = (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      lastPointerPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = performance.now();
      isPointerDragging = true;
    };

    const handlePointerMove = (e) => {
      if (isPointerDragging && cameraModeRef.current === "seat") {
        const dx = e.clientX - lastPointerPos.x;
        const dy = e.clientY - lastPointerPos.y;
        lastPointerPos = { x: e.clientX, y: e.clientY };

        firstPersonRef.current.yaw -= dx * 0.0035;
        firstPersonRef.current.pitch -= dy * 0.0035;
        firstPersonRef.current.pitch = Math.max(-0.6, Math.min(0.6, firstPersonRef.current.pitch));
        firstPersonRef.current.yaw = Math.max(-1.5, Math.min(1.5, firstPersonRef.current.yaw));
        return;
      }

      if (!isPointerDragging && cameraModeRef.current === "overview") {
        const seat = getRaycastSeat(e.clientX, e.clientY);
        if (seat) {
          setHoveredSeat(seat);
          renderer.domElement.style.cursor =
            seat.status === "BOOKED" || seat.status === "LOCKED" ? "not-allowed" : "pointer";
        } else {
          setHoveredSeat(null);
          renderer.domElement.style.cursor = "default";
        }
      }
    };

    let lastSeatClickTime = 0;
    const triggerSafeSeatClick = (seat) => {
      if (!seat) return;
      if (seat.status === "BOOKED" || seat.status === "LOCKED") return;
      const now = performance.now();
      if (now - lastSeatClickTime < 300) return;
      lastSeatClickTime = now;
      if (onSeatClickRef.current) {
        onSeatClickRef.current(seat);
      }
    };

    const handlePointerUp = (e) => {
      const dt = performance.now() - pointerDownTime;
      const dx = Math.abs(e.clientX - pointerDownPos.x);
      const dy = Math.abs(e.clientY - pointerDownPos.y);
      isPointerDragging = false;

      if (dt < 350 && dx < 8 && dy < 8) {
        const seat = getRaycastSeat(e.clientX, e.clientY);
        triggerSafeSeatClick(seat);
      }
    };

    const handleDoubleClick = (e) => {
      const seat = getRaycastSeat(e.clientX, e.clientY);
      if (seat && seat.status !== "BOOKED" && seat.status !== "LOCKED") {
        if (jumpToSeatPovRef.current) {
          jumpToSeatPovRef.current(seat);
        }
      }
    };

    // Mobile Touch Gestures
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        pointerDownPos = { x: touch.clientX, y: touch.clientY };
        lastPointerPos = { x: touch.clientX, y: touch.clientY };
        pointerDownTime = performance.now();
        isPointerDragging = true;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && isPointerDragging && cameraModeRef.current === "seat") {
        const touch = e.touches[0];
        const dx = touch.clientX - lastPointerPos.x;
        const dy = touch.clientY - lastPointerPos.y;
        lastPointerPos = { x: touch.clientX, y: touch.clientY };

        firstPersonRef.current.yaw -= dx * 0.004;
        firstPersonRef.current.pitch -= dy * 0.004;
        firstPersonRef.current.pitch = Math.max(-0.6, Math.min(0.6, firstPersonRef.current.pitch));
        firstPersonRef.current.yaw = Math.max(-1.5, Math.min(1.5, firstPersonRef.current.yaw));
      }
    };

    const handleTouchEnd = (e) => {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dt = performance.now() - pointerDownTime;
        const dx = Math.abs(touch.clientX - pointerDownPos.x);
        const dy = Math.abs(touch.clientY - pointerDownPos.y);
        isPointerDragging = false;

        if (dt < 350 && dx < 10 && dy < 10) {
          const seat = getRaycastSeat(touch.clientX, touch.clientY);
          triggerSafeSeatClick(seat);
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("dblclick", handleDoubleClick);
    renderer.domElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", handleTouchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", handleTouchEnd, { passive: true });

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 550;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    requestAnimationFrame(handleResize);
    const timer = setTimeout(handleResize, 100);

    // 10. Standard Continuous Render Loop (High precision performance.now() - Zero deprecation warnings)
    const startTime = performance.now();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Procedural Stage Actors update: 60 FPS fluid kinematic loops with minimal CPU cost
      if (stageActorsRef.current && showActorsRef.current) {
        const elapsedTime = (performance.now() - startTime) * 0.001;
        stageActorsRef.current.update(elapsedTime);
      }

      const activeCameraMode = cameraModeRef.current;
      const activePovSeat = currentPovSeatRef.current;
      const activeSeatPositions = seatPositionsRef.current;

      if (isTransitioningRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.1);
        currentLookAtRef.current.lerp(targetLookAtRef.current, 0.1);
        camera.lookAt(currentLookAtRef.current);

        if (controls) {
          controls.target.copy(currentLookAtRef.current);
        }

        if (
          camera.position.distanceTo(targetCamPosRef.current) < 0.05 &&
          currentLookAtRef.current.distanceTo(targetLookAtRef.current) < 0.05
        ) {
          camera.position.copy(targetCamPosRef.current);
          camera.lookAt(targetLookAtRef.current);
          if (controls) {
            controls.target.copy(targetLookAtRef.current);
            controls.enabled = activeCameraMode === "overview";
          }
          isTransitioningRef.current = false;
        }
      } else if (activeCameraMode === "seat" && activePovSeat) {
        controls.enabled = false;
        const pos = activeSeatPositions.get(activePovSeat.seatIdentifier);
        if (pos) {
          const eyeX = pos.x;
          const eyeY = pos.y + 1.15;
          const eyeZ = pos.z - 0.12;
          camera.position.set(eyeX, eyeY, eyeZ);

          const totalYaw = firstPersonRef.current.baseYaw + firstPersonRef.current.yaw;
          const totalPitch = firstPersonRef.current.basePitch + firstPersonRef.current.pitch;
          const lookDist = 12;
          const lookX = eyeX + Math.sin(totalYaw) * Math.cos(totalPitch) * lookDist;
          const lookY = eyeY + Math.sin(totalPitch) * lookDist;
          const lookZ = eyeZ + Math.cos(totalYaw) * Math.cos(totalPitch) * lookDist;
          camera.lookAt(lookX, lookY, lookZ);
        }
      } else {
        controls.enabled = true;
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup & Disposal on unmount
    return () => {
      clearTimeout(timer);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
      renderer.domElement.removeEventListener("touchstart", handleTouchStart);
      renderer.domElement.removeEventListener("touchmove", handleTouchMove);
      renderer.domElement.removeEventListener("touchend", handleTouchEnd);

      if (instancedMeshRef.current) {
        instancedMeshRef.current.geometry.dispose();
        if (Array.isArray(instancedMeshRef.current.material)) {
          instancedMeshRef.current.material.forEach((m) => m.dispose());
        } else {
          instancedMeshRef.current.material.dispose();
        }
        instancedMeshRef.current = null;
      }

      if (stageActorsRef.current) {
        stageActorsRef.current.dispose();
        scene.remove(stageActorsRef.current.group);
        stageActorsRef.current = null;
      }

      stageGeo.dispose();
      stageMat.dispose();
      woodTexture.dispose();
      backdropGeo.dispose();
      backdropMat.dispose();
      if (backdropTexRef.current) {
        backdropTexRef.current.dispose();
        backdropTexRef.current = null;
      } else {
        backdropTex.dispose();
      }
      backdropMeshRef.current = null;
      curtainMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      carpetGeo.dispose();
      carpetMat.dispose();
      wallGeo.dispose();
      wallMat.dispose();

      // Force WebGL context loss so browser GPU process immediately reclaims context
      renderer.dispose();
      renderer.forceContextLoss();
      const gl = renderer.getContext();
      if (gl && typeof gl.getExtension === "function") {
        const loseExt = gl.getExtension("WEBGL_lose_context");
        if (loseExt) {
          loseExt.loseContext();
        }
      }

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [
    createWoodStageTexture,
    createStageBackdropTexture,
    OVERVIEW_CAM_POS,
    OVERVIEW_LOOK_AT,
    STAGE_CENTER,
  ]);

  // InstancedMesh Seat Creation & Position Sync (Runs whenever allSeats or seatPositions changes)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (instancedMeshRef.current) {
      scene.remove(instancedMeshRef.current);
      instancedMeshRef.current.geometry.dispose();
      if (Array.isArray(instancedMeshRef.current.material)) {
        instancedMeshRef.current.material.forEach((m) => m.dispose());
      } else {
        instancedMeshRef.current.material.dispose();
      }
      instancedMeshRef.current = null;
    }

    const totalSeats = allSeats.length;
    if (totalSeats === 0) return;

    // Build unified merged seat geometry
    const cushionGeo = new THREE.BoxGeometry(0.72, 0.18, 0.65);
    cushionGeo.translate(0, 0.46, 0);

    const backrestGeo = new THREE.BoxGeometry(0.72, 0.75, 0.16);
    backrestGeo.rotateX(-0.15);
    backrestGeo.translate(0, 0.84, 0.28);

    const pedestalGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.45, 8);
    pedestalGeo.translate(0, 0.22, 0);

    const leftArmGeo = new THREE.BoxGeometry(0.12, 0.38, 0.6);
    leftArmGeo.translate(-0.41, 0.64, 0);

    const rightArmGeo = new THREE.BoxGeometry(0.12, 0.38, 0.6);
    rightArmGeo.translate(0.41, 0.64, 0);

    const mergedSeatGeo = BufferGeometryUtils.mergeGeometries([
      cushionGeo,
      backrestGeo,
      pedestalGeo,
      leftArmGeo,
      rightArmGeo,
    ]);

    cushionGeo.dispose();
    backrestGeo.dispose();
    pedestalGeo.dispose();
    leftArmGeo.dispose();
    rightArmGeo.dispose();

    const seatMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.45,
      metalness: 0.15,
    });

    const instancedMesh = new THREE.InstancedMesh(mergedSeatGeo, seatMaterial, totalSeats);
    instancedMesh.castShadow = false;
    instancedMesh.receiveShadow = false;
    instancedMesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const seatList = [];
    const idToIndex = new Map();

    let idx = 0;
    seatPositions.forEach((posData, identifier) => {
      const { x, y, z, rotationY, seat } = posData;
      dummy.position.set(x, y, z);
      dummy.rotation.y = rotationY;
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(idx, dummy.matrix);

      seatList.push(seat);
      idToIndex.set(identifier, idx);
      idx++;
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);

    instancedMeshRef.current = instancedMesh;
    seatListRef.current = seatList;
    seatIdToIndexRef.current = idToIndex;
  }, [allSeats, seatPositions]);

  // Update Instance Colors when Seat Status / Selection Changes
  useEffect(() => {
    const instancedMesh = instancedMeshRef.current;
    if (!instancedMesh || !seatListRef.current) return;

    const COLOR_SELECTED = new THREE.Color(0xf59e0b); // Gold
    const COLOR_BOOKED = new THREE.Color(isDark ? 0x2e181e : 0x7f1d1d); // Muted red
    const COLOR_LOCKED = new THREE.Color(0xc2410c); // Orange
    const COLOR_VIP = new THREE.Color(0x9333ea); // Purple
    const COLOR_BALCONY = new THREE.Color(0x059669); // Emerald
    const COLOR_NORMAL = new THREE.Color(isDark ? 0x2a364f : 0x475569); // Slate navy

    const selectedSet = new Set(selectedSeats.map((s) => s.seatIdentifier));

    seatListRef.current.forEach((seat, idx) => {
      const isSelected = selectedSet.has(seat.seatIdentifier);
      const isBooked = seat.status === "BOOKED";
      const isLocked = seat.status === "LOCKED";
      const catLower = (seat.category || "").toLowerCase();

      let color = COLOR_NORMAL;
      if (isSelected) {
        color = COLOR_SELECTED;
      } else if (isBooked) {
        color = COLOR_BOOKED;
      } else if (isLocked) {
        color = COLOR_LOCKED;
      } else if (catLower.includes("vip")) {
        color = COLOR_VIP;
      } else if (catLower.includes("balcony")) {
        color = COLOR_BALCONY;
      }

      instancedMesh.setColorAt(idx, color);
    });

    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }

    // Update Floating Selected Seat Diamond Markers (Max 8 seats)
    const markersGroup = selectedMarkersGroupRef.current;
    if (markersGroup) {
      while (markersGroup.children.length > 0) {
        const child = markersGroup.children[0];
        markersGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }

      const diamondGeo = new THREE.OctahedronGeometry(0.22, 0);
      const diamondMat = new THREE.MeshBasicMaterial({ color: 0xfed800 });

      selectedSeats.forEach((seat) => {
        const pos = seatPositions.get(seat.seatIdentifier);
        if (pos) {
          const marker = new THREE.Mesh(diamondGeo, diamondMat);
          marker.position.set(pos.x, pos.y + 1.85, pos.z);
          markersGroup.add(marker);
        }
      });
    }
  }, [allSeats, selectedSeats, isDark, seatPositions]);

  // Dynamic Section Badge & Sightline info for current seat POV:
  // Recomputed from actual 3D distance between seat position and stage front apron edge (STAGE_EDGE_Z = -5.0)
  const povInfo = useMemo(() => {
    if (!currentPovSeat) return null;
    const pos = seatPositions.get(currentPovSeat.seatIdentifier);
    if (!pos) return null;

    // Actual distance from seat to stage front edge
    const distMeters = Math.sqrt(pos.x * pos.x + Math.pow(pos.z - STAGE_EDGE_Z, 2)).toFixed(1);
    const cat = (currentPovSeat.category || "").toUpperCase();

    // Section badge dynamically read from actual seat's category/tier
    let sectionBadge = "ORCHESTRA";
    let badgeColorClass = "text-blue-700 dark:text-blue-300 border-blue-500/40 bg-blue-50 dark:bg-blue-950/60";

    if (cat.includes("BALCONY")) {
      sectionBadge = "BALCONY TIER";
      badgeColorClass = "text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/60";
    } else if (cat.includes("VIP")) {
      sectionBadge = "VIP CIRCLE";
      badgeColorClass = "text-purple-700 dark:text-purple-300 border-purple-500/40 bg-purple-50 dark:bg-purple-950/60";
    } else if (cat.includes("ODC")) {
      sectionBadge = "ODC ORCHESTRA";
      badgeColorClass = "text-indigo-700 dark:text-indigo-300 border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/60";
    } else {
      const cleanCat = cat.replace("NOMAL", "NORMAL");
      sectionBadge = `${cleanCat || "STANDARD"} TIER`;
      badgeColorClass = "text-amber-800 dark:text-amber-300 border-amber-500/40 bg-amber-50 dark:bg-amber-950/60";
    }

    const angleDeg = Math.abs((Math.atan2(pos.x, pos.z - STAGE_Z) * 180) / Math.PI);
    const sightlineRating = angleDeg < 12 ? "Direct Center Sightline" : "Wide Stage Sightline";

    return {
      sectionBadge,
      badgeColorClass,
      distance: distMeters,
      sightlineRating,
    };
  }, [currentPovSeat, seatPositions]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full flex flex-col bg-slate-100 dark:bg-[#0a0a12] overflow-hidden select-none ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none min-h-screen" : ""
      }`}
    >
      {/* Three.js Canvas Container with touch-action: none for responsive mobile interaction */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Floating Control Bar: Clean Single Row with Left Padding to Prevent Edge Clipping */}
      <div className="relative z-10 p-2.5 sm:p-4 px-3 sm:px-6 flex items-center justify-between gap-2 bg-gradient-to-b from-white/95 via-white/60 to-transparent dark:from-black/85 dark:via-black/40 dark:to-transparent pointer-events-none">
        {/* Left: Mode Title Pill with explicit left padding so it is never clipped */}
        <div className="flex items-center gap-1.5 pointer-events-auto pl-1 sm:pl-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#14141e]/90 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {cameraMode === "seat" ? "Seat POV View" : "Auditorium Overview"}
            </span>
          </div>
        </div>

        {/* Center / Right: 2 Clear Modes (Overview | Seat View) & Reset Camera Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Compact Camera Switcher */}
          <div className="flex items-center bg-white/95 dark:bg-[#14141e]/90 border border-slate-200 dark:border-white/15 rounded-xl p-1 backdrop-blur-md shadow-md">
            <button
              onClick={() => setCameraPreset("overview")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                cameraMode === "overview"
                  ? "bg-amber-400 text-slate-950 shadow-sm font-extrabold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
              }`}
              title="Auditorium Hall Overview"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                const target = currentPovSeat || selectedSeats[0] || allSeats[0];
                if (target) setCameraPreset("seat", target);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                cameraMode === "seat"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-extrabold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
              }`}
              title="First-Person View from Seat"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Seat View</span>
            </button>
          </div>

          {/* 3D Stage Actors Scale Toggle */}
          <button
            onClick={() => setShowActors((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-md ${
              showActors
                ? "bg-amber-400 border-amber-300 text-slate-950 font-extrabold shadow-amber-500/20"
                : "bg-white/95 dark:bg-[#14141e]/90 border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
            }`}
            title="Toggle 3D Stage Actors (Average Sri Lankan Body & Height ~1.68m Scale View)"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">3D Actors</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 font-mono">
              {showActors ? "5 On" : "Off"}
            </span>
          </button>

          {/* Reset Camera Icon Button */}
          <button
            onClick={() => setCameraPreset(cameraMode === "seat" ? "seat" : "overview")}
            className="p-1.5 sm:p-2 rounded-xl bg-white/95 dark:bg-[#14141e]/90 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/95 dark:bg-[#14141e]/90 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white backdrop-blur-md transition-colors cursor-pointer shadow-md hidden sm:flex"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Subtle Auto-Fading 3-Second First-Time Hint Overlay */}
      <div
        className={`absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-700 px-3 w-full max-w-sm text-center ${
          showHint ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-black/85 text-white border border-amber-500/40 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold shadow-2xl backdrop-blur-md inline-flex items-center gap-2">
          <span>Drag to look around • Tap a seat to preview • Live 3D Actors Scale</span>
        </div>
      </div>

      {/* Hovered Seat Tooltip HUD (Desktop only) */}
      {hoveredSeat && cameraMode === "overview" && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in duration-150 px-2 text-center">
          <div className="bg-white/95 dark:bg-[#101018]/95 border border-amber-500/40 rounded-xl px-4 py-2 shadow-2xl backdrop-blur-md inline-flex items-center gap-2.5 text-xs text-slate-900 dark:text-white">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
            <div className="text-left">
              <div className="font-extrabold text-amber-800 dark:text-amber-300">
                Row {hoveredSeat.row} • Seat {hoveredSeat.number}{" "}
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">({hoveredSeat.category})</span>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                LKR {hoveredSeat.price?.toLocaleString() || "1,000"} •{" "}
                <span
                  className={
                    hoveredSeat.status === "AVAILABLE"
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-red-500 font-bold"
                  }
                >
                  {hoveredSeat.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seat POV Sightline Floating Card - Ultra-compact and docked cleanly above canvas footer */}
      {cameraMode === "seat" && currentPovSeat && povInfo && (
        <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-30 px-2 sm:px-4 pointer-events-auto">
          <div className="max-w-xl mx-auto bg-white/95 dark:bg-[#13131e]/95 border border-amber-500/30 rounded-2xl p-2 sm:p-3 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col xs:flex-row items-center justify-between gap-2">
              <div className="text-center xs:text-left min-w-0">
                <div className="flex items-center justify-center xs:justify-start gap-1.5 mb-0.5 flex-wrap">
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${povInfo.badgeColorClass}`}>
                    {povInfo.sectionBadge}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    ~{povInfo.distance}m • {povInfo.sightlineRating}
                  </span>
                  {showActors && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" />
                      <span>Actors: ~1.68m Scale</span>
                    </span>
                  )}
                </div>
                <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  Row {currentPovSeat.row}, Seat {currentPovSeat.number} • LKR {currentPovSeat.price?.toLocaleString()}
                </h5>
              </div>

              {/* Prev / Next / Select Actions */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => navigatePovSeat(-1)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                  title="Previous Seat"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigatePovSeat(1)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                  title="Next Seat"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {currentPovSeat.status === "AVAILABLE" && (
                  <button
                    onClick={() => {
                      if (onSeatClick) onSeatClick(currentPovSeat);
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      selectedSeats.some((s) => s.seatIdentifier === currentPovSeat.seatIdentifier)
                        ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/30"
                        : "bg-amber-50 hover:bg-amber-100 dark:bg-white/10 dark:hover:bg-white/20 text-amber-900 dark:text-white border border-amber-300 dark:border-white/20"
                    }`}
                  >
                    {selectedSeats.some((s) => s.seatIdentifier === currentPovSeat.seatIdentifier) ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Select</span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    setCameraPreset("overview");
                    if (onExitPov) onExitPov();
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Return to Hall Overview"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Overview</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
