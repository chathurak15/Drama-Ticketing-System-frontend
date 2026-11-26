"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Layers,
  Box,
  Eye,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  DoorOpen,
  Coffee,
  Armchair,
  Maximize2,
  Compass,
  Sliders,
  DollarSign,
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Download,
  Upload,
} from "lucide-react";
import { addTheatre, updateTheatre } from "../../services/TheatreService";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-toastify";

// Default Presets
const PRESET_TEMPLATES = {
  proscenium: {
    name: "Royal Proscenium Theatre",
    areaType: "THEATRE",
    status: "PERMANENT",
    stage: {
      label: "PROSCENIUM MAIN STAGE",
      width: 16,
      depth: 5,
      elevation: 1.1,
      curtainColor: "#661F19",
    },
    doors: [
      { id: "d-1", label: "MAIN DOUBLE ENTRANCE", type: "main", wall: "south", position: 50, width: 3.5 },
      { id: "d-2", label: "NORTH-WEST EMERGENCY EXIT", type: "emergency", wall: "west", position: 20, width: 2.0 },
      { id: "d-3", label: "NORTH-EAST EMERGENCY EXIT", type: "emergency", wall: "east", position: 20, width: 2.0 },
      { id: "d-4", label: "STAGE LEFT CREW DOOR", type: "backstage", wall: "west", position: 88, width: 1.6 },
      { id: "d-5", label: "STAGE RIGHT CREW DOOR", type: "backstage", wall: "east", position: 88, width: 1.6 },
    ],
    tables: [
      { id: "t-1", tableNumber: "VIP 01", type: "round", seats: 6, x: -5.5, y: -2.5, tier: "VIP Dining", price: 6500 },
      { id: "t-2", tableNumber: "VIP 02", type: "round", seats: 6, x: 0, y: -2.5, tier: "VIP Dining", price: 6500 },
      { id: "t-3", tableNumber: "VIP 03", type: "round", seats: 6, x: 5.5, y: -2.5, tier: "VIP Dining", price: 6500 },
    ],
    seatTypes: [
      { typeName: "VIP", totalSeats: 40, seatsPerRow: 20, price: 4000, rows: 2 },
      { typeName: "Premium", totalSeats: 60, seatsPerRow: 20, price: 3000, rows: 3 },
      { typeName: "Standard", totalSeats: 120, seatsPerRow: 24, price: 1800, rows: 5 },
      { typeName: "Balcony", totalSeats: 50, seatsPerRow: 25, price: 1200, rows: 2 },
    ],
  },
  cabaret: {
    name: "Cabaret Dinner & Drama Club",
    areaType: "INDOOR_HALL",
    status: "PERMANENT",
    stage: {
      label: "CABARET CENTER STAGE",
      width: 12,
      depth: 4.5,
      elevation: 0.8,
      curtainColor: "#D97706",
    },
    doors: [
      { id: "d-1", label: "MAIN FOYER ENTRANCE", type: "main", wall: "south", position: 50, width: 3.2 },
      { id: "d-2", label: "SIDE EMERGENCY EXIT", type: "emergency", wall: "west", position: 30, width: 1.8 },
      { id: "d-3", label: "KITCHEN & BAR ENTRY", type: "backstage", wall: "east", position: 75, width: 1.8 },
    ],
    tables: [
      { id: "t-1", tableNumber: "T-01", type: "round", seats: 6, x: -6, y: -2, tier: "VIP Dinner Table", price: 8000 },
      { id: "t-2", tableNumber: "T-02", type: "round", seats: 6, x: -2, y: -2, tier: "VIP Dinner Table", price: 8000 },
      { id: "t-3", tableNumber: "T-03", type: "round", seats: 6, x: 2, y: -2, tier: "VIP Dinner Table", price: 8000 },
      { id: "t-4", tableNumber: "T-04", type: "round", seats: 6, x: 6, y: -2, tier: "VIP Dinner Table", price: 8000 },
      { id: "t-5", tableNumber: "T-05", type: "round", seats: 4, x: -6, y: -6, tier: "Cocktail Table", price: 5000 },
      { id: "t-6", tableNumber: "T-06", type: "round", seats: 4, x: -2, y: -6, tier: "Cocktail Table", price: 5000 },
      { id: "t-7", tableNumber: "T-07", type: "round", seats: 4, x: 2, y: -6, tier: "Cocktail Table", price: 5000 },
      { id: "t-8", tableNumber: "T-08", type: "round", seats: 4, x: 6, y: -6, tier: "Cocktail Table", price: 5000 },
      { id: "t-9", tableNumber: "T-09", type: "rect", seats: 8, x: -4.5, y: -10, tier: "Banquet Long Table", price: 9500 },
      { id: "t-10", tableNumber: "T-10", type: "rect", seats: 8, x: 4.5, y: -10, tier: "Banquet Long Table", price: 9500 },
    ],
    seatTypes: [
      { typeName: "Elevated Booths", totalSeats: 32, seatsPerRow: 16, price: 3500, rows: 2 },
      { typeName: "Rear Bar Seating", totalSeats: 24, seatsPerRow: 24, price: 2000, rows: 1 },
    ],
  },
  amphitheatre: {
    name: "Modern Tiered Amphitheatre",
    areaType: "THEATRE",
    status: "PERMANENT",
    stage: {
      label: "THRUST ARENA STAGE",
      width: 14,
      depth: 6,
      elevation: 0.9,
      curtainColor: "#3B82F6",
    },
    doors: [
      { id: "d-1", label: "MAIN DOUBLE DOORS", type: "main", wall: "south", position: 50, width: 3.6 },
      { id: "d-2", label: "WEST FIRE EXIT", type: "emergency", wall: "west", position: 15, width: 2.2 },
      { id: "d-3", label: "EAST FIRE EXIT", type: "emergency", wall: "east", position: 15, width: 2.2 },
    ],
    tables: [
      { id: "t-1", tableNumber: "Lounge A", type: "round", seats: 8, x: -7, y: -3, tier: "Executive Lounge", price: 10000 },
      { id: "t-2", tableNumber: "Lounge B", type: "round", seats: 8, x: 7, y: -3, tier: "Executive Lounge", price: 10000 },
    ],
    seatTypes: [
      { typeName: "VIP Front Row", totalSeats: 36, seatsPerRow: 18, price: 4500, rows: 2 },
      { typeName: "Tier 1 Orchestra", totalSeats: 80, seatsPerRow: 20, price: 3200, rows: 4 },
      { typeName: "Tier 2 Mezzanine", totalSeats: 90, seatsPerRow: 30, price: 2200, rows: 3 },
      { typeName: "Tier 3 Upper", totalSeats: 60, seatsPerRow: 30, price: 1500, rows: 2 },
    ],
  },
};

const SEAT_TYPE_COLORS = {
  VIP: "#FED800",
  "VIP Front Row": "#FED800",
  "VIP Dining": "#FED800",
  "VIP Dinner Table": "#FED800",
  Premium: "#E11D48",
  "Tier 1 Orchestra": "#E11D48",
  Standard: "#3B82F6",
  "Tier 2 Mezzanine": "#3B82F6",
  Balcony: "#10B981",
  "Tier 3 Upper": "#10B981",
  "Elevated Booths": "#A855F7",
  "Cocktail Table": "#F59E0B",
  "Banquet Long Table": "#8B5CF6",
  "Rear Bar Seating": "#64748B",
  Default: "#6B7280",
};

export default function TheatreCustomizerStudio({ theatreToEdit = null, onSuccess = () => {}, onCancel = null }) {
  const user = useAuth();

  // Mode: "2d" | "3d" | "summary"
  const [activeTab, setActiveTab] = useState("2d");

  // Basic Information
  const [theatreName, setTheatreName] = useState(theatreToEdit?.name || "Grand National Theatre");
  const [areaType, setAreaType] = useState(theatreToEdit?.areaType || "THEATRE");
  const [status, setStatus] = useState(theatreToEdit?.status || "PERMANENT");
  const [openAreaPrice, setOpenAreaPrice] = useState(theatreToEdit?.openAreaPrice || 0);

  // Stage Configuration
  const [stage, setStage] = useState(
    theatreToEdit?.stage || PRESET_TEMPLATES.proscenium.stage
  );

  // Doors Configuration
  const [doors, setDoors] = useState(
    theatreToEdit?.doors || PRESET_TEMPLATES.proscenium.doors
  );

  // Tables Configuration
  const [tables, setTables] = useState(
    theatreToEdit?.tables || PRESET_TEMPLATES.proscenium.tables
  );

  // Seat Types Configuration
  const [seatTypes, setSeatTypes] = useState(
    theatreToEdit?.seatTypes?.length > 0
      ? theatreToEdit.seatTypes
      : PRESET_TEMPLATES.proscenium.seatTypes
  );

  // Selected element for property editing in 2D
  const [selectedElement, setSelectedElement] = useState({ type: "stage", id: "stage" });

  // Sync state whenever theatreToEdit changes
  useEffect(() => {
    if (theatreToEdit) {
      let persisted = null;
      try {
        const raw =
          localStorage.getItem(`nataka_theatre_layout_${theatreToEdit.id}`) ||
          localStorage.getItem(`nataka_theatre_layout_${theatreToEdit.name}`);
        if (raw) persisted = JSON.parse(raw);
      } catch {
        // Ignore parse error
      }

      setTheatreName(theatreToEdit.name || "Grand National Theatre");
      setAreaType(theatreToEdit.areaType || "THEATRE");
      setStatus(theatreToEdit.status || "PERMANENT");
      setOpenAreaPrice(theatreToEdit.openAreaPrice || 0);
      setStage(theatreToEdit.stage || persisted?.stage || PRESET_TEMPLATES.proscenium.stage);
      setDoors(theatreToEdit.doors || persisted?.doors || PRESET_TEMPLATES.proscenium.doors);
      setTables(theatreToEdit.tables || persisted?.tables || PRESET_TEMPLATES.proscenium.tables);
      setSeatTypes(
        theatreToEdit.seatTypes?.length > 0
          ? theatreToEdit.seatTypes
          : (persisted?.seatTypes || PRESET_TEMPLATES.proscenium.seatTypes)
      );
    }
  }, [theatreToEdit]);

  // 3D Canvas Settings
  const [lightingMode, setLightingMode] = useState("showtime"); // "showtime" | "bright" | "lounge"
  const [cameraView, setCameraView] = useState("overview"); // "overview" | "stage" | "table" | "center" | "entrance" | "top"
  const [hovered3dObject, setHovered3dObject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 3D Engine references
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const interactiveMeshesRef = useRef([]);

  // Load from local storage or theatreToEdit
  useEffect(() => {
    if (theatreToEdit?.id) {
      const savedLayout = localStorage.getItem(`nataka_theatre_layout_${theatreToEdit.id}`);
      if (savedLayout) {
        try {
          const parsed = JSON.parse(savedLayout);
          if (parsed.doors) setDoors(parsed.doors);
          if (parsed.tables) setTables(parsed.tables);
          if (parsed.stage) setStage(parsed.stage);
        } catch (e) {
          console.error("Failed to parse saved layout", e);
        }
      }
    }
  }, [theatreToEdit]);

  // Total Seats calculation (Auditorium seats + table seats)
  const totalAuditoriumSeats = useMemo(() => {
    return seatTypes.reduce((acc, s) => acc + (parseInt(s.totalSeats) || 0), 0);
  }, [seatTypes]);

  const totalTableSeats = useMemo(() => {
    return tables.reduce((acc, t) => acc + (parseInt(t.seats) || 0), 0);
  }, [tables]);

  const totalCalculatedCapacity = totalAuditoriumSeats + totalTableSeats;

  // Handle Preset Load
  const applyPreset = (presetKey) => {
    const preset = PRESET_TEMPLATES[presetKey];
    if (!preset) return;
    if (window.confirm(`Load "${preset.name}" preset? This will overwrite your current configuration.`)) {
      setTheatreName(preset.name);
      setAreaType(preset.areaType);
      setStatus(preset.status);
      setStage({ ...preset.stage });
      setDoors([...preset.doors]);
      setTables([...preset.tables]);
      setSeatTypes([...preset.seatTypes]);
      setSelectedElement({ type: "stage", id: "stage" });
      toast.info(`Preset "${preset.name}" applied successfully.`);
    }
  };

  // Add / Remove / Edit Doors
  const addDoor = () => {
    const newDoor = {
      id: `d-${Date.now()}`,
      label: `EMERGENCY EXIT ${doors.length + 1}`,
      type: "emergency",
      wall: "east",
      position: 50,
      width: 1.8,
    };
    setDoors((prev) => [...prev, newDoor]);
    setSelectedElement({ type: "door", id: newDoor.id });
  };

  const removeDoor = (id) => {
    setDoors((prev) => prev.filter((d) => d.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement({ type: "stage", id: "stage" });
    }
  };

  const updateDoor = (id, field, value) => {
    setDoors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // Add / Remove / Edit Tables
  const addTable = (shape = "round") => {
    const newTable = {
      id: `t-${Date.now()}`,
      tableNumber: `T-${tables.length + 1}`,
      type: shape,
      seats: shape === "round" ? 6 : 8,
      x: (Math.random() - 0.5) * 8,
      y: -(Math.random() * 6 + 2),
      tier: "VIP Dining",
      price: 6000,
    };
    setTables((prev) => [...prev, newTable]);
    setSelectedElement({ type: "table", id: newTable.id });
  };

  const removeTable = (id) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement({ type: "stage", id: "stage" });
    }
  };

  const updateTable = (id, field, value) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Add / Remove / Edit Seat Types
  const addSeatType = () => {
    const newType = {
      typeName: "Standard",
      totalSeats: 30,
      seatsPerRow: 15,
      price: 1500,
      rows: 2,
    };
    setSeatTypes((prev) => [...prev, newType]);
  };

  const removeSeatType = (index) => {
    setSeatTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSeatType = (index, field, value) => {
    setSeatTypes((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "typeName" ? value : parseInt(value) || 0,
      };
      // auto calculate total seats if rows or seatsPerRow changed
      if (field === "rows" || field === "seatsPerRow") {
        const rows = field === "rows" ? parseInt(value) || 1 : updated[index].rows || 1;
        const spr = field === "seatsPerRow" ? parseInt(value) || 1 : updated[index].seatsPerRow || 1;
        updated[index].totalSeats = rows * spr;
      }
      return updated;
    });
  };

  // Save Theatre Configuration
  const handleSave = async () => {
    if (!theatreName.trim()) {
      toast.error("Please enter a valid Theatre Name.");
      return;
    }

    setIsSaving(true);
    try {
      // Map tables into a special seatType if any tables exist, so the backend database reflects them
      let consolidatedSeatTypes = [...seatTypes];
      if (tables.length > 0) {
        consolidatedSeatTypes.push({
          typeName: "Tables & Dining",
          totalSeats: totalTableSeats,
          seatsPerRow: 6,
        });
      }

      const payload = {
        name: theatreName,
        areaType: areaType,
        status: status,
        totalCapacity: totalCalculatedCapacity,
        openAreaPrice: openAreaPrice || 0,
        seatTypes: consolidatedSeatTypes,
      };

      let response;
      if (theatreToEdit?.id) {
        payload.id = theatreToEdit.id;
        response = await updateTheatre(payload);
      } else {
        response = await addTheatre(payload, user.user?.id);
      }

      // Persist rich 3D layout data in localStorage for persistence
      const fullLayoutData = {
        name: theatreName,
        stage,
        doors,
        tables,
        seatTypes,
        totalCapacity: totalCalculatedCapacity,
        updatedAt: new Date().toISOString(),
      };

      const storageId = theatreToEdit?.id || `draft_${Date.now()}`;
      localStorage.setItem(`nataka_theatre_layout_${storageId}`, JSON.stringify(fullLayoutData));
      localStorage.setItem(`nataka_theatre_layout_${theatreName}`, JSON.stringify(fullLayoutData));

      toast.success(response?.data || "Theatre Layout & 3D Environment Saved Successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Save error", err);
      toast.error(err.response?.data?.message || "Failed to save theatre. Please verify credentials.");
    } finally {
      setIsSaving(false);
    }
  };

  // Export Layout JSON
  const handleExportJSON = () => {
    const data = {
      theatreName,
      areaType,
      status,
      stage,
      doors,
      tables,
      seatTypes,
      totalCalculatedCapacity,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${theatreName.replace(/\s+/g, "_")}_layout.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Theatre layout exported to JSON!");
  };

  // Import Layout JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed.theatreName) setTheatreName(parsed.theatreName);
        if (parsed.areaType) setAreaType(parsed.areaType);
        if (parsed.stage) setStage(parsed.stage);
        if (parsed.doors) setDoors(parsed.doors);
        if (parsed.tables) setTables(parsed.tables);
        if (parsed.seatTypes) setSeatTypes(parsed.seatTypes);
        toast.success("Layout imported successfully!");
      } catch {
        toast.error("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  // ==========================================
  // THREE.JS 3D ENGINE IMPLEMENTATION
  // ==========================================
  useEffect(() => {
    if (activeTab !== "3d" || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 16, 26);
    cameraRef.current = camera;

    // 3. Renderer setup
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

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // prevent going below floor
    controls.minDistance = 3;
    controls.maxDistance = 75;
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      lightingMode === "bright" ? 1.2 : lightingMode === "lounge" ? 0.35 : 0.25
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, lightingMode === "bright" ? 1.0 : 0.4);
    dirLight.position.set(10, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Stage Spotlights
    const stageSpot1 = new THREE.SpotLight(0xffe6a3, lightingMode === "showtime" ? 2.8 : 1.2, 45, Math.PI / 4, 0.4);
    stageSpot1.position.set(-6, 12, 4);
    stageSpot1.target.position.set(-2, 1, 9);
    stageSpot1.castShadow = true;
    scene.add(stageSpot1);
    scene.add(stageSpot1.target);

    const stageSpot2 = new THREE.SpotLight(0xffb7b7, lightingMode === "showtime" ? 2.8 : 1.2, 45, Math.PI / 4, 0.4);
    stageSpot2.position.set(6, 12, 4);
    stageSpot2.target.position.set(2, 1, 9);
    stageSpot2.castShadow = true;
    scene.add(stageSpot2);
    scene.add(stageSpot2.target);

    // 6. Auditorium Shell (Floor & Walls)
    const hallWidth = 26;
    const hallLength = 34;
    const hallHeight = 10;

    // Floor
    const floorGeo = new THREE.BoxGeometry(hallWidth, 0.5, hallLength);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x14141c,
      roughness: 0.8,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.25, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Carpet runner down center aisle
    const aisleGeo = new THREE.PlaneGeometry(2.4, hallLength - 8);
    const aisleMat = new THREE.MeshStandardMaterial({
      color: 0x541612,
      roughness: 0.9,
    });
    const aisleMesh = new THREE.Mesh(aisleGeo, aisleMat);
    aisleMesh.rotation.x = -Math.PI / 2;
    aisleMesh.position.set(0, 0.01, 2);
    scene.add(aisleMesh);

    // Acoustic Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c24,
      roughness: 0.7,
      metalness: 0.15,
    });

    // Back wall (South)
    const backWallGeo = new THREE.BoxGeometry(hallWidth, hallHeight, 0.6);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, hallHeight / 2, hallLength / 2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Front wall (North / Stage rear)
    const frontWall = new THREE.Mesh(backWallGeo, wallMat);
    frontWall.position.set(0, hallHeight / 2, -hallLength / 2);
    scene.add(frontWall);

    // Left wall (West)
    const sideWallGeo = new THREE.BoxGeometry(0.6, hallHeight, hallLength);
    const westWall = new THREE.Mesh(sideWallGeo, wallMat);
    westWall.position.set(-hallWidth / 2, hallHeight / 2, 0);
    westWall.receiveShadow = true;
    scene.add(westWall);

    // Right wall (East)
    const eastWall = new THREE.Mesh(sideWallGeo, wallMat);
    eastWall.position.set(hallWidth / 2, hallHeight / 2, 0);
    eastWall.receiveShadow = true;
    scene.add(eastWall);

    // 7. STAGE BUILDER
    const stageWidth = stage.width || 14;
    const stageDepth = stage.depth || 5;
    const stageElevation = stage.elevation || 1.1;
    const stageZ = -hallLength / 2 + stageDepth / 2 + 1;

    // Stage Platform
    const stageGeo = new THREE.BoxGeometry(stageWidth, stageElevation, stageDepth);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e18, // Rich dark polished wood
      roughness: 0.45,
      metalness: 0.2,
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.set(0, stageElevation / 2, stageZ);
    stageMesh.castShadow = true;
    stageMesh.receiveShadow = true;
    scene.add(stageMesh);

    // Stage Back Curtain / Header
    const curtainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(stage.curtainColor || "#661F19"),
      roughness: 0.85,
    });
    const curtainGeo = new THREE.BoxGeometry(stageWidth + 1, 6, 0.4);
    const curtainMesh = new THREE.Mesh(curtainGeo, curtainMat);
    curtainMesh.position.set(0, stageElevation + 3, stageZ - stageDepth / 2 + 0.3);
    scene.add(curtainMesh);

    // Stage Front Velvet Valance Arch
    const archGeo = new THREE.BoxGeometry(stageWidth + 0.8, 1.2, 0.3);
    const archMesh = new THREE.Mesh(archGeo, curtainMat);
    archMesh.position.set(0, stageElevation + 5.5, stageZ + stageDepth / 2 - 0.2);
    scene.add(archMesh);

    // Backdrop Screen
    const screenGeo = new THREE.PlaneGeometry(stageWidth - 2, 4);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x11111a,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, stageElevation + 2.6, stageZ - stageDepth / 2 + 0.55);
    scene.add(screenMesh);

    // 8. DOORS BUILDER (3D Doors & Glowing Exit Signs)
    interactiveMeshesRef.current = [];

    doors.forEach((door) => {
      const doorGroup = new THREE.Group();
      let x = 0;
      let y = 1.3;
      let z = 0;
      let rotY = 0;

      const normPos = (door.position - 50) / 100; // -0.5 to 0.5

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

      doorGroup.position.set(x, y, z);
      doorGroup.rotation.y = rotY;

      // Door Frame
      const frameGeo = new THREE.BoxGeometry(door.width, 2.6, 0.2);
      const frameMat = new THREE.MeshStandardMaterial({
        color: door.type === "emergency" ? 0x15803d : 0x3d2314,
        roughness: 0.6,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      doorGroup.add(frameMesh);

      // Glowing "EXIT" sign on emergency doors
      if (door.type === "emergency") {
        const signGeo = new THREE.BoxGeometry(1.2, 0.45, 0.25);
        const signMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x16a34a,
          emissiveIntensity: 1.8,
          roughness: 0.2,
        });
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(0, 1.6, 0.1);
        doorGroup.add(signMesh);

        // Small green point light over exit door
        const exitLight = new THREE.PointLight(0x22c55e, 0.8, 6);
        exitLight.position.set(0, 1.6, 0.4);
        doorGroup.add(exitLight);
      } else {
        // Brass handles for main doors
        const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
        const handle1 = new THREE.Mesh(handleGeo, handleMat);
        handle1.position.set(-0.25, 0, 0.15);
        doorGroup.add(handle1);
        const handle2 = new THREE.Mesh(handleGeo, handleMat);
        handle2.position.set(0.25, 0, 0.15);
        doorGroup.add(handle2);
      }

      doorGroup.userData = {
        type: "door",
        title: door.label,
        details: `Wall: ${door.wall.toUpperCase()} | Type: ${door.type.toUpperCase()} | Width: ${door.width}m`,
      };

      scene.add(doorGroup);
      interactiveMeshesRef.current.push(frameMesh);
      frameMesh.parentGroup = doorGroup;
    });

    // 9. TABLES BUILDER (3D Tables & Surrounding Chairs)
    tables.forEach((tbl) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(tbl.x, 0, tbl.y);

      const tableRadius = tbl.type === "round" ? (tbl.seats > 6 ? 1.3 : 0.95) : 1.2;

      // Tabletop
      if (tbl.type === "round") {
        const topGeo = new THREE.CylinderGeometry(tableRadius, tableRadius, 0.08, 24);
        const topMat = new THREE.MeshStandardMaterial({
          color: 0xf1f5f9, // Crisp white tablecloth
          roughness: 0.6,
        });
        const topMesh = new THREE.Mesh(topGeo, topMat);
        topMesh.position.y = 0.85;
        topMesh.castShadow = true;
        tableGroup.add(topMesh);

        // Pedestal Leg
        const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 12);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.5 });
        const legMesh = new THREE.Mesh(legGeo, legMat);
        legMesh.position.y = 0.4;
        tableGroup.add(legMesh);

        // Centerpiece candle / subtle light
        const candleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8);
        const candleMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 1.2,
        });
        const candleMesh = new THREE.Mesh(candleGeo, candleMat);
        candleMesh.position.y = 0.95;
        tableGroup.add(candleMesh);

        if (lightingMode === "lounge" || lightingMode === "showtime") {
          const tableLight = new THREE.PointLight(0xffb703, 0.45, 4);
          tableLight.position.y = 1.1;
          tableGroup.add(tableLight);
        }

        // Surrounding Chairs positioned radially
        const chairCount = tbl.seats || 6;
        for (let i = 0; i < chairCount; i++) {
          const angle = (i * 2 * Math.PI) / chairCount;
          const chairDist = tableRadius + 0.45;
          const cx = Math.cos(angle) * chairDist;
          const cz = Math.sin(angle) * chairDist;

          const chairGroup = new THREE.Group();
          chairGroup.position.set(cx, 0, cz);
          chairGroup.rotation.y = -angle - Math.PI / 2; // Facing table

          // Chair seat
          const seatGeo = new THREE.BoxGeometry(0.42, 0.06, 0.42);
          const chairMat = new THREE.MeshStandardMaterial({ color: 0x85261f, roughness: 0.6 });
          const seatM = new THREE.Mesh(seatGeo, chairMat);
          seatM.position.y = 0.45;
          chairGroup.add(seatM);

          // Chair Back
          const backGeo = new THREE.BoxGeometry(0.42, 0.45, 0.05);
          const backM = new THREE.Mesh(backGeo, chairMat);
          backM.position.set(0, 0.7, -0.19);
          chairGroup.add(backM);

          // Legs
          const chLegGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.42);
          const chLegMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
          const leg1 = new THREE.Mesh(chLegGeo, chLegMat);
          leg1.position.set(0.18, 0.21, 0.18);
          chairGroup.add(leg1);
          const leg2 = new THREE.Mesh(chLegGeo, chLegMat);
          leg2.position.set(-0.18, 0.21, 0.18);
          chairGroup.add(leg2);
          const leg3 = new THREE.Mesh(chLegGeo, chLegMat);
          leg3.position.set(0.18, 0.21, -0.18);
          chairGroup.add(leg3);
          const leg4 = new THREE.Mesh(chLegGeo, chLegMat);
          leg4.position.set(-0.18, 0.21, -0.18);
          chairGroup.add(leg4);

          tableGroup.add(chairGroup);
        }
      } else {
        // Rectangular Table
        const rectGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
        const rectMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
        const topMesh = new THREE.Mesh(rectGeo, rectMat);
        topMesh.position.y = 0.85;
        topMesh.castShadow = true;
        tableGroup.add(topMesh);

        // 4 Legs
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        [[-1.0, -0.45], [1.0, -0.45], [-1.0, 0.45], [1.0, 0.45]].forEach(([lx, lz]) => {
          const l = new THREE.Mesh(legGeo, legMat);
          l.position.set(lx, 0.4, lz);
          tableGroup.add(l);
        });
      }

      tableGroup.userData = {
        type: "table",
        title: `Table: ${tbl.tableNumber}`,
        details: `${tbl.tier} | ${tbl.seats} Seats | LKR ${tbl.price?.toLocaleString()}`,
      };

      scene.add(tableGroup);
      interactiveMeshesRef.current.push(tableGroup);
    });

    // 10. AUDITORIUM TIERS & SEATS BUILDER
    let currentRowZ = 4.5;
    let currentRiserElevation = 0.2;

    seatTypes.forEach((tier) => {
      const rows = tier.rows || Math.ceil((tier.totalSeats || 20) / (tier.seatsPerRow || 15));
      const seatsInRow = tier.seatsPerRow || 15;
      const tierColor = new THREE.Color(SEAT_TYPE_COLORS[tier.typeName] || SEAT_TYPE_COLORS.Default);

      for (let r = 0; r < rows; r++) {
        const rowElevation = currentRiserElevation + r * 0.35;
        const rowZ = currentRowZ + r * 1.35;

        // Stepped Riser platform
        const riserGeo = new THREE.BoxGeometry(hallWidth - 3, 0.32, 1.3);
        const riserMat = new THREE.MeshStandardMaterial({ color: 0x1f1f28, roughness: 0.8 });
        const riserMesh = new THREE.Mesh(riserGeo, riserMat);
        riserMesh.position.set(0, rowElevation - 0.16, rowZ);
        riserMesh.receiveShadow = true;
        scene.add(riserMesh);

        // Individual Seats in this row (split by center aisle)
        const seatSpacing = 0.65;
        const rowWidth = seatsInRow * seatSpacing;
        const halfWidth = rowWidth / 2;

        for (let s = 0; s < seatsInRow; s++) {
          let seatX = -halfWidth + s * seatSpacing;
          // create a 1.8m center aisle
          if (seatX >= -0.9 && seatX <= 0.9) {
            continue; // skip seats inside center walkway
          }

          const seatGroup = new THREE.Group();
          seatGroup.position.set(seatX, rowElevation, rowZ);

          // Seat cushion
          const cushionGeo = new THREE.BoxGeometry(0.48, 0.12, 0.45);
          const seatMat = new THREE.MeshStandardMaterial({
            color: tierColor,
            roughness: 0.55,
          });
          const cushionMesh = new THREE.Mesh(cushionGeo, seatMat);
          cushionMesh.position.y = 0.35;
          seatGroup.add(cushionMesh);

          // Backrest
          const backGeo = new THREE.BoxGeometry(0.48, 0.48, 0.1);
          const backMesh = new THREE.Mesh(backGeo, seatMat);
          backMesh.position.set(0, 0.6, -0.18);
          seatGroup.add(backMesh);

          // Armrests
          const armGeo = new THREE.BoxGeometry(0.08, 0.25, 0.4);
          const armMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.3 });
          const armL = new THREE.Mesh(armGeo, armMat);
          armL.position.set(-0.26, 0.45, 0);
          seatGroup.add(armL);
          const armR = new THREE.Mesh(armGeo, armMat);
          armR.position.set(0.26, 0.45, 0);
          seatGroup.add(armR);

          seatGroup.userData = {
            type: "seat",
            title: `${tier.typeName} - Row ${String.fromCharCode(65 + r)} #${s + 1}`,
            details: `Price: LKR ${(tier.price || 1500).toLocaleString()}`,
          };

          scene.add(seatGroup);
        }
      }

      currentRowZ += rows * 1.35 + 0.8;
      currentRiserElevation += rows * 0.35;
    });

    // 11. Raycaster for Interactive Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let current = intersects[0].object;
        while (current && !current.userData?.title && current.parent) {
          current = current.parent;
        }
        if (current?.userData?.title) {
          setHovered3dObject(current.userData);
          return;
        }
      }
      setHovered3dObject(null);
    };

    renderer.domElement.addEventListener("mousemove", handlePointerMove);

    // 12. Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 550;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      renderer.forceContextLoss();
      const gl = renderer.getContext();
      if (gl && typeof gl.getExtension === "function") {
        const loseExt = gl.getExtension("WEBGL_lose_context");
        if (loseExt) loseExt.loseContext();
      }
    };
  }, [activeTab, lightingMode, stage, doors, tables, seatTypes]);

  // Handle Camera Presets
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
    } else if (preset === "table") {
      if (tables.length > 0) {
        const first = tables[0];
        cam.position.set(first.x, 1.8, first.y - 1.2);
        ctrl.target.set(0, 2, -12); // looking at stage
      } else {
        cam.position.set(0, 4, 0);
        ctrl.target.set(0, 2, -12);
      }
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

  return (
    <div className="bg-[#0f0f17] text-slate-100 rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[850px] flex flex-col font-sans">
      {/* Top Studio Navigation Bar */}
      <div className="bg-[#181824] px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
              title="Return to Theatres List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/40 uppercase tracking-wider">
                3D Layout Studio
              </span>
              <span className="text-xs text-slate-400">Nataka Venue Architect</span>
            </div>
            <input
              type="text"
              value={theatreName}
              onChange={(e) => setTheatreName(e.target.value)}
              placeholder="Enter Theatre Hall Name..."
              className="text-xl font-bold bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#FED800] focus:outline-none transition-colors text-white py-0.5 mt-1"
            />
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-black/40 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("2d")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "2d"
                ? "bg-[#661F19] text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            2D Customizer
          </button>
          <button
            onClick={() => setActiveTab("3d")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "3d"
                ? "bg-[#FED800] text-black shadow-lg font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Box className="w-4 h-4" />
            Interactive 3D View
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "summary"
                ? "bg-white/20 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Specifications
          </button>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Preset Selector */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) applyPreset(e.target.value);
              }}
              defaultValue=""
              className="bg-white/5 border border-white/10 text-xs text-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#FED800]"
            >
              <option value="" disabled className="bg-[#181824]">
                Templates & Presets
              </option>
              <option value="proscenium" className="bg-[#181824]">
                🏛️ Proscenium Theatre
              </option>
              <option value="cabaret" className="bg-[#181824]">
                🍽️ Cabaret & Dinner Club
              </option>
              <option value="amphitheatre" className="bg-[#181824]">
                🎭 Modern Amphitheatre
              </option>
            </select>
          </div>

          <button
            onClick={handleExportJSON}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
            title="Export JSON Configuration"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors cursor-pointer"
            title="Import JSON Configuration"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#661F19] to-[#992d24] hover:from-[#80251e] hover:to-[#b33529] text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-[#661F19]/40 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-spin mr-1">⌛</span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {theatreToEdit ? "Update Hall" : "Deploy Hall"}
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* ======================================================== */}
        {/* TAB 1: 2D VISUAL CUSTOMIZER                             */}
        {/* ======================================================== */}
        {activeTab === "2d" && (
          <div className="flex-1 flex flex-col lg:flex-row h-full">
            {/* Left Configuration Inspector */}
            <div className="w-full lg:w-96 bg-[#14141e] border-r border-white/10 p-5 overflow-y-auto space-y-6 max-h-[780px]">
              {/* General Properties */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FED800]" /> Hall Attributes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Area Type</label>
                    <select
                      value={areaType}
                      onChange={(e) => setAreaType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2 text-white"
                    >
                      <option value="THEATRE" className="bg-[#181824]">
                        THEATRE
                      </option>
                      <option value="INDOOR_HALL" className="bg-[#181824]">
                        INDOOR HALL
                      </option>
                      <option value="OPEN_AREA" className="bg-[#181824]">
                        OPEN AREA
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2 text-white"
                    >
                      <option value="PERMANENT" className="bg-[#181824]">
                        PERMANENT
                      </option>
                      <option value="TEMPORARY" className="bg-[#181824]">
                        TEMPORARY
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stage Settings */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FED800]" /> Stage & Screen
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">NORTH WALL</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Stage Label</label>
                  <input
                    type="text"
                    value={stage.label}
                    onChange={(e) => setStage({ ...stage, label: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-xs rounded-lg p-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Width: {stage.width}m</label>
                    <input
                      type="range"
                      min="8"
                      max="22"
                      value={stage.width}
                      onChange={(e) => setStage({ ...stage, width: parseInt(e.target.value) })}
                      className="w-full accent-[#FED800]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Depth: {stage.depth}m</label>
                    <input
                      type="range"
                      min="3"
                      max="8"
                      value={stage.depth}
                      onChange={(e) => setStage({ ...stage, depth: parseInt(e.target.value) })}
                      className="w-full accent-[#FED800]"
                    />
                  </div>
                </div>
              </div>

              {/* DOORS & EXITS CUSTOMIZER */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-emerald-400" /> Doors & Exits ({doors.length})
                  </h4>
                  <button
                    onClick={addDoor}
                    className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-1 rounded-md border border-emerald-500/30 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Door
                  </button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {doors.map((door) => (
                    <div
                      key={door.id}
                      onClick={() => setSelectedElement({ type: "door", id: door.id })}
                      className={`p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                        selectedElement?.id === door.id
                          ? "bg-emerald-950/40 border-emerald-500/50 shadow"
                          : "bg-black/30 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-200">{door.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDoor(door.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Wall</label>
                          <select
                            value={door.wall}
                            onChange={(e) => updateDoor(door.id, "wall", e.target.value)}
                            className="w-full bg-[#1e1e2d] border border-white/10 rounded p-1 text-xs text-white"
                          >
                            <option value="south">South (Main Rear)</option>
                            <option value="north">North (Stage Rear)</option>
                            <option value="west">West (Left Side)</option>
                            <option value="east">East (Right Side)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Type</label>
                          <select
                            value={door.type}
                            onChange={(e) => updateDoor(door.id, "type", e.target.value)}
                            className="w-full bg-[#1e1e2d] border border-white/10 rounded p-1 text-xs text-white"
                          >
                            <option value="emergency">Emergency Exit (Green)</option>
                            <option value="main">Main Entrance (Double)</option>
                            <option value="backstage">Backstage / Crew</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Position on Wall</span>
                          <span>{door.position}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="95"
                          value={door.position}
                          onChange={(e) => updateDoor(door.id, "position", parseInt(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABLES CUSTOMIZER */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-400" /> Dining & Cabaret Tables ({tables.length})
                  </h4>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => addTable("round")}
                      className="flex items-center gap-1 text-[11px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-1 rounded border border-amber-500/30"
                    >
                      + Round
                    </button>
                    <button
                      onClick={() => addTable("rect")}
                      className="flex items-center gap-1 text-[11px] bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 px-2 py-1 rounded border border-purple-500/30"
                    >
                      + Rect
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {tables.map((tbl) => (
                    <div
                      key={tbl.id}
                      onClick={() => setSelectedElement({ type: "table", id: tbl.id })}
                      className={`p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                        selectedElement?.id === tbl.id
                          ? "bg-amber-950/40 border-amber-500/50 shadow"
                          : "bg-black/30 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-amber-200">
                          {tbl.tableNumber} ({tbl.seats} Seats)
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTable(tbl.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Table #</label>
                          <input
                            type="text"
                            value={tbl.tableNumber}
                            onChange={(e) => updateTable(tbl.id, "tableNumber", e.target.value)}
                            className="w-full bg-[#1e1e2d] border border-white/10 rounded p-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Seat Count</label>
                          <input
                            type="number"
                            min="2"
                            max="12"
                            value={tbl.seats}
                            onChange={(e) => updateTable(tbl.id, "seats", parseInt(e.target.value))}
                            className="w-full bg-[#1e1e2d] border border-white/10 rounded p-1 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Price (LKR)</label>
                          <input
                            type="number"
                            value={tbl.price}
                            onChange={(e) => updateTable(tbl.id, "price", parseInt(e.target.value))}
                            className="w-full bg-[#1e1e2d] border border-white/10 rounded p-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Tier Category</label>
                          <input
                            type="text"
                            value={tbl.tier}
                            onChange={(e) => updateTable(tbl.id, "tier", e.target.value)}
                            className="w-full bg-[#1e1e2d] border border-white/10 rounded p-1 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AUDITORIUM SEATS CUSTOMIZER */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-blue-400" /> Tiered Seat Blocks ({seatTypes.length})
                  </h4>
                  <button
                    onClick={addSeatType}
                    className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-2.5 py-1 rounded border border-blue-500/30"
                  >
                    <Plus className="w-3 h-3" /> Add Tier
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {seatTypes.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-white/5 bg-black/30 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: SEAT_TYPE_COLORS[tier.typeName] || SEAT_TYPE_COLORS.Default,
                            }}
                          />
                          <input
                            type="text"
                            value={tier.typeName}
                            onChange={(e) => updateSeatType(idx, "typeName", e.target.value)}
                            className="bg-transparent font-semibold text-white focus:outline-none border-b border-transparent hover:border-white/20"
                          />
                        </div>
                        {seatTypes.length > 1 && (
                          <button
                            onClick={() => removeSeatType(idx)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Rows</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={tier.rows || 2}
                            onChange={(e) => updateSeatType(idx, "rows", e.target.value)}
                            className="w-full bg-[#1e1e2d] border border-white/10 rounded p-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Seats/Row</label>
                          <input
                            type="number"
                            min="5"
                            max="40"
                            value={tier.seatsPerRow || 20}
                            onChange={(e) => updateSeatType(idx, "seatsPerRow", e.target.value)}
                            className="w-full bg-[#1e1e2d] border border-white/10 rounded p-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Total</label>
                          <div className="font-semibold text-white pt-1">
                            {tier.totalSeats || (tier.rows || 2) * (tier.seatsPerRow || 20)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Interactive 2D Floor Plan Canvas */}
            <div className="flex-1 bg-[#0a0a10] p-6 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Floor Plan Legend */}
              <div className="absolute top-4 left-6 flex flex-wrap items-center gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 z-10 text-xs">
                <span className="text-slate-400 font-medium">Floor Plan Elements:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FED800]" />
                  <span>VIP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#E11D48]" />
                  <span>Premium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                  <span>Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Emergency Doors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span>Dining Tables</span>
                </div>
              </div>

              {/* 2D Representation Box */}
              <div className="w-full max-w-4xl h-[680px] bg-[#12121a] rounded-2xl border-2 border-slate-700 relative p-6 flex flex-col justify-between shadow-2xl shadow-black/80 overflow-hidden">
                {/* North Wall: Doors & Stage */}
                <div className="w-full relative flex flex-col items-center">
                  {/* North Wall Doors */}
                  <div className="absolute -top-3 w-full flex justify-between px-8">
                    {doors
                      .filter((d) => d.wall === "north")
                      .map((d) => (
                        <div
                          key={d.id}
                          className="bg-emerald-600 px-3 py-0.5 rounded text-[10px] font-bold text-white shadow uppercase border border-emerald-300"
                        >
                          🚪 {d.label}
                        </div>
                      ))}
                  </div>

                  {/* STAGE */}
                  <div
                    style={{ width: `${Math.min(stage.width * 4.5, 95)}%` }}
                    className="h-20 bg-gradient-to-b from-[#661F19] to-[#3d120f] border-2 border-[#FED800]/60 rounded-b-2xl shadow-lg flex flex-col items-center justify-center text-center relative cursor-pointer group"
                    onClick={() => setSelectedElement({ type: "stage", id: "stage" })}
                  >
                    <div className="text-xs tracking-widest font-black text-[#FED800] uppercase">
                      {stage.label}
                    </div>
                    <span className="text-[10px] text-slate-300">
                      Dimensions: {stage.width}m × {stage.depth}m | Elevated: {stage.elevation || 1.1}m
                    </span>
                    <div className="absolute -bottom-2 px-3 py-0.5 bg-black/80 rounded-full text-[9px] text-amber-300 font-mono">
                      PERFORMANCE AREA
                    </div>
                  </div>
                </div>

                {/* Left (West) Wall Doors */}
                <div className="absolute left-1 top-24 bottom-24 flex flex-col justify-around">
                  {doors
                    .filter((d) => d.wall === "west")
                    .map((d) => (
                      <div
                        key={d.id}
                        className={`text-[9px] font-bold px-2 py-1 rounded shadow -rotate-90 uppercase tracking-tighter ${
                          d.type === "emergency"
                            ? "bg-emerald-700 text-white border border-emerald-400"
                            : "bg-amber-800 text-white"
                        }`}
                      >
                        🚪 {d.label}
                      </div>
                    ))}
                </div>

                {/* Right (East) Wall Doors */}
                <div className="absolute right-1 top-24 bottom-24 flex flex-col justify-around">
                  {doors
                    .filter((d) => d.wall === "east")
                    .map((d) => (
                      <div
                        key={d.id}
                        className={`text-[9px] font-bold px-2 py-1 rounded shadow rotate-90 uppercase tracking-tighter ${
                          d.type === "emergency"
                            ? "bg-emerald-700 text-white border border-emerald-400"
                            : "bg-amber-800 text-white"
                        }`}
                      >
                        🚪 {d.label}
                      </div>
                    ))}
                </div>

                {/* Center Auditorium Content: Tables & Tiered Seats */}
                <div className="flex-1 my-4 flex flex-col justify-center items-center space-y-4 overflow-y-auto px-8">
                  {/* TABLES SECTION (If any) */}
                  {tables.length > 0 && (
                    <div className="w-full bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2 text-center">
                        Dining & Cabaret Tables Zone
                      </div>
                      <div className="flex flex-wrap justify-center gap-6">
                        {tables.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedElement({ type: "table", id: t.id })}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                              selectedElement?.id === t.id
                                ? "bg-amber-500/20 border-amber-400 scale-105 shadow-lg shadow-amber-500/20"
                                : "bg-black/50 border-white/10 hover:border-amber-400/50"
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-950/60 flex items-center justify-center text-xs font-bold text-amber-300 relative shadow`}
                            >
                              {t.tableNumber}
                              {/* Radial chair indicators */}
                              <span className="absolute -top-1 w-2 h-2 rounded-full bg-amber-400" />
                              <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-amber-400" />
                              <span className="absolute -left-1 w-2 h-2 rounded-full bg-amber-400" />
                              <span className="absolute -right-1 w-2 h-2 rounded-full bg-amber-400" />
                            </div>
                            <span className="text-[9px] text-slate-300 mt-1 font-medium">
                              {t.seats} Chairs
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AUDITORIUM TIERS */}
                  <div className="w-full space-y-2">
                    {seatTypes.map((tier, tIdx) => {
                      const rows = tier.rows || 2;
                      const seatsPerRow = Math.min(tier.seatsPerRow || 20, 26);
                      const color = SEAT_TYPE_COLORS[tier.typeName] || SEAT_TYPE_COLORS.Default;

                      return (
                        <div key={tIdx} className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 px-2">
                            <span className="font-semibold text-slate-200">
                              {tier.typeName} Zone ({tier.totalSeats} seats)
                            </span>
                            <span>LKR {(tier.price || 1500).toLocaleString()}</span>
                          </div>

                          {Array.from({ length: rows }).map((_, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-center justify-center gap-1 bg-black/30 py-1 px-2 rounded"
                            >
                              <span className="text-[9px] text-slate-500 w-4 font-mono">
                                {String.fromCharCode(65 + rIdx)}
                              </span>
                              {/* Left block */}
                              <div className="flex gap-1">
                                {Array.from({ length: Math.floor(seatsPerRow / 2) }).map((_, sIdx) => (
                                  <div
                                    key={sIdx}
                                    style={{ backgroundColor: color }}
                                    className="w-3.5 h-3.5 rounded-sm opacity-85 hover:opacity-100 hover:scale-125 transition-transform"
                                    title={`${tier.typeName} Seat`}
                                  />
                                ))}
                              </div>

                              {/* Center Aisle */}
                              <div className="w-8 flex items-center justify-center">
                                <span className="text-[8px] text-slate-600 font-mono">AISLE</span>
                              </div>

                              {/* Right block */}
                              <div className="flex gap-1">
                                {Array.from({ length: Math.ceil(seatsPerRow / 2) }).map((_, sIdx) => (
                                  <div
                                    key={sIdx}
                                    style={{ backgroundColor: color }}
                                    className="w-3.5 h-3.5 rounded-sm opacity-85 hover:opacity-100 hover:scale-125 transition-transform"
                                    title={`${tier.typeName} Seat`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* South Wall: Main Double Entrance */}
                <div className="w-full relative flex flex-col items-center">
                  <div className="w-48 h-8 bg-amber-900/80 border-t-2 border-amber-500 rounded-t-lg flex items-center justify-center text-xs font-bold text-amber-100 uppercase tracking-wider shadow">
                    🚪 MAIN ENTRANCE FOYER
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: INTERACTIVE 3D WEBGL AUDITORIUM                   */}
        {/* ======================================================== */}
        {activeTab === "3d" && (
          <div className="flex-1 flex flex-col relative w-full h-[780px]">
            {/* 3D Canvas Mounting Node */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Floating Top 3D Control Bar */}
            <div className="absolute top-4 left-6 flex flex-wrap items-center gap-3 bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/10 z-20">
              <span className="text-xs font-semibold text-slate-300 px-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#FED800]" /> Camera POV:
              </span>
              <button
                onClick={() => setCameraPreset("overview")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  cameraView === "overview" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                Auditorium Overview
              </button>
              <button
                onClick={() => setCameraPreset("stage")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  cameraView === "stage" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                🎬 Stage POV
              </button>
              <button
                onClick={() => setCameraPreset("table")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  cameraView === "table" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                🍸 VIP Table View
              </button>
              <button
                onClick={() => setCameraPreset("center")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  cameraView === "center" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                💺 Center Seat POV
              </button>
              <button
                onClick={() => setCameraPreset("entrance")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  cameraView === "entrance" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                🚪 Main Entrance
              </button>
              <button
                onClick={() => setCameraPreset("top")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  cameraView === "top" ? "bg-[#FED800] text-black font-semibold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                🦅 Bird's Eye
              </button>
            </div>

            {/* Floating Lighting Controls */}
            <div className="absolute top-4 right-6 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-20">
              <button
                onClick={() => setLightingMode("showtime")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  lightingMode === "showtime" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                🎭 Showtime
              </button>
              <button
                onClick={() => setLightingMode("bright")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  lightingMode === "bright" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                💡 Inspection
              </button>
              <button
                onClick={() => setLightingMode("lounge")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  lightingMode === "lounge" ? "bg-[#661F19] text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                ✨ Cabaret Lounge
              </button>
            </div>

            {/* Interactive Object HUD Tooltip on Hover */}
            {hovered3dObject && (
              <div className="absolute bottom-6 left-6 bg-black/85 backdrop-blur-md px-4 py-3 rounded-xl border border-[#FED800]/50 shadow-2xl z-20 pointer-events-none">
                <div className="text-xs font-bold text-[#FED800] uppercase tracking-wide">
                  {hovered3dObject.title}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">{hovered3dObject.details}</div>
              </div>
            )}

            {/* 3D Navigation Guide Pill */}
            <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-center gap-3">
              <span>🖱️ Drag: Rotate 360°</span>
              <span>•</span>
              <span>🔍 Scroll: Zoom In/Out</span>
              <span>•</span>
              <span>Right-Click: Pan</span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SPECIFICATIONS & CAPACITY BREAKDOWN              */}
        {/* ======================================================== */}
        {activeTab === "summary" && (
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <h3 className="text-xl font-bold text-white">Auditorium Engineering & Capacity Analysis</h3>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-xs font-medium text-slate-400 uppercase">Total Hall Capacity</div>
                <div className="text-3xl font-extrabold text-[#FED800] mt-2">
                  {totalCalculatedCapacity.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-slate-400">guests</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Seats: {totalAuditoriumSeats} | Table Seats: {totalTableSeats}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-xs font-medium text-slate-400 uppercase">Cabaret Tables</div>
                <div className="text-3xl font-extrabold text-amber-400 mt-2">
                  {tables.length} <span className="text-sm font-normal text-slate-400">tables</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Accommodating {totalTableSeats} dinner guests
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-xs font-medium text-slate-400 uppercase">Emergency & Exit Doors</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                  {doors.length} <span className="text-sm font-normal text-slate-400">doors</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {doors.filter((d) => d.type === "emergency").length} Fire Exits |{" "}
                  {doors.filter((d) => d.type === "main").length} Main Doors
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-xs font-medium text-slate-400 uppercase">Est. Full House Gross</div>
                <div className="text-3xl font-extrabold text-white mt-2">
                  LKR{" "}
                  {(
                    seatTypes.reduce((acc, s) => acc + (s.totalSeats || 0) * (s.price || 1500), 0) +
                    tables.reduce((acc, t) => acc + (t.price || 5000), 0)
                  ).toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400 mt-1">Per Sold-Out Showtime</div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seating Tiers */}
              <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/10">
                <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-[#FED800]" /> Seating Category Distribution
                </h4>
                <div className="space-y-3">
                  {seatTypes.map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{
                            backgroundColor: SEAT_TYPE_COLORS[tier.typeName] || SEAT_TYPE_COLORS.Default,
                          }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-white">{tier.typeName}</div>
                          <div className="text-xs text-slate-400">
                            {tier.rows || 2} Rows × {tier.seatsPerRow || 20} Seats
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{tier.totalSeats} seats</div>
                        <div className="text-xs text-emerald-400">LKR {(tier.price || 1500).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doors & Safety Exits */}
              <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/10">
                <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" /> Building & Fire Safety Specs
                </h4>
                <div className="space-y-3">
                  {doors.map((door) => (
                    <div key={door.id} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`p-1.5 rounded-lg ${
                            door.type === "emergency"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          <DoorOpen className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-white">{door.label}</div>
                          <div className="text-xs text-slate-400">
                            Wall: {door.wall.toUpperCase()} ({door.position}% coordinate)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono uppercase bg-white/10 px-2 py-1 rounded text-slate-300">
                          {door.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
