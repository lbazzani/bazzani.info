'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type p5 from 'p5';
import {
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CableIcon from '@mui/icons-material/Cable';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
});

interface SensorType {
  id: number;
  count: number;
  color: string;
}

interface Sensor {
  x: number;
  y: number;
  z: number;
  type: number;
  color: string;
}

interface JunctionBox {
  id: string;
  x: number;
  y: number;
  z: number;
  sensorTypeId: number;
  ports: number;
  color: string;
}

interface SensorVisualizationProps {
  unitsX: number;
  unitsY: number;
  unitsZ: number;
  sensors: SensorType[];
  onReconfigure: () => void;
}

export default function SensorVisualization({
  unitsX,
  unitsY,
  unitsZ,
  sensors,
  onReconfigure,
}: SensorVisualizationProps) {
  const router = useRouter();
  const [placedSensors, setPlacedSensors] = useState<Sensor[]>([]);
  const [junctionBoxes, setJunctionBoxes] = useState<JunctionBox[]>([]);
  const [junctionDialogOpen, setJunctionDialogOpen] = useState(false);
  const [selectedSensorType, setSelectedSensorType] = useState(0);
  const [selectedPorts, setSelectedPorts] = useState(6);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [optimizationSteps, setOptimizationSteps] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const rotationX = useRef(-0.4);
  const rotationY = useRef(0.6);
  const zoomLevel = useRef(1);

  // Generate random sensor positions
  useEffect(() => {
    const newSensors: Sensor[] = [];

    sensors.forEach((sensorType) => {
      for (let i = 0; i < sensorType.count; i++) {
        newSensors.push({
          x: Math.random() * unitsX,
          y: Math.random() * unitsY,
          z: Math.random() * unitsZ,
          type: sensorType.id,
          color: sensorType.color,
        });
      }
    });

    setPlacedSensors(newSensors);
  }, [unitsX, unitsY, unitsZ, sensors]);

  // Get already connected sensors (sensors that are connected to any junction box)
  const getConnectedSensors = () => {
    const connected = new Set<Sensor>();

    junctionBoxes.forEach((jbox) => {
      const typeSensors = placedSensors.filter((s) => s.type === jbox.sensorTypeId);

      // Calculate distances and get the closest sensors up to port count
      const distances = typeSensors.map((s) => ({
        sensor: s,
        dist: Math.sqrt(
          Math.pow(s.x - jbox.x, 2) +
          Math.pow(s.y - jbox.y, 2) +
          Math.pow(s.z - jbox.z, 2)
        ),
      }));

      distances.sort((a, b) => a.dist - b.dist);
      const connectedToThisBox = distances.slice(0, jbox.ports);

      connectedToThisBox.forEach(({ sensor }) => connected.add(sensor));
    });

    return connected;
  };

  // Check if a position overlaps with existing junction boxes
  const isPositionOverlapping = (x: number, y: number, z: number, minDistance = 5) => {
    return junctionBoxes.some((jbox) => {
      const dist = Math.sqrt(
        Math.pow(jbox.x - x, 2) +
        Math.pow(jbox.y - y, 2) +
        Math.pow(jbox.z - z, 2)
      );
      return dist < minDistance;
    });
  };

  // Calculate optimal position for junction box
  const calculateOptimalPosition = (sensorTypeId: number, ports: number) => {
    // Get sensors of this type that are NOT already connected
    const connectedSensors = getConnectedSensors();
    const typeSensors = placedSensors.filter(
      (s) => s.type === sensorTypeId && !connectedSensors.has(s)
    );

    if (typeSensors.length === 0) {
      // No free sensors, return a random non-overlapping position
      let attempts = 0;
      while (attempts < 100) {
        const testPos = {
          x: Math.random() * unitsX,
          y: Math.random() * unitsY,
          z: Math.random() * unitsZ,
        };
        if (!isPositionOverlapping(testPos.x, testPos.y, testPos.z)) {
          return testPos;
        }
        attempts++;
      }
      return { x: unitsX / 2, y: unitsY / 2, z: unitsZ / 2 };
    }

    // Calculate centroid of the free sensors
    const centroid = {
      x: typeSensors.reduce((sum, s) => sum + s.x, 0) / typeSensors.length,
      y: typeSensors.reduce((sum, s) => sum + s.y, 0) / typeSensors.length,
      z: typeSensors.reduce((sum, s) => sum + s.z, 0) / typeSensors.length,
    };

    // Try multiple positions and choose the one that connects most sensors
    let bestPosition = centroid;
    let maxConnections = 0;

    // Test positions in a grid around the centroid
    const testRadius = Math.min(unitsX, unitsY, unitsZ) / 4;
    const step = testRadius / 3;

    for (let dx = -testRadius; dx <= testRadius; dx += step) {
      for (let dy = -testRadius; dy <= testRadius; dy += step) {
        for (let dz = -testRadius; dz <= testRadius; dz += step) {
          const testPos = {
            x: Math.max(0, Math.min(unitsX, centroid.x + dx)),
            y: Math.max(0, Math.min(unitsY, centroid.y + dy)),
            z: Math.max(0, Math.min(unitsZ, centroid.z + dz)),
          };

          // Skip if overlapping with existing junction boxes
          if (isPositionOverlapping(testPos.x, testPos.y, testPos.z)) {
            continue;
          }

          // Calculate distances to all FREE sensors of this type
          const distances = typeSensors.map((s) => ({
            sensor: s,
            dist: Math.sqrt(
              Math.pow(s.x - testPos.x, 2) +
              Math.pow(s.y - testPos.y, 2) +
              Math.pow(s.z - testPos.z, 2)
            ),
          }));

          // Sort by distance and count how many can be connected
          distances.sort((a, b) => a.dist - b.dist);
          const connections = Math.min(ports, distances.length);

          if (connections > maxConnections) {
            maxConnections = connections;
            bestPosition = testPos;
          }
        }
      }
    }

    return bestPosition;
  };

  const handleAddJunctionBox = () => {
    const position = calculateOptimalPosition(selectedSensorType, selectedPorts);
    const sensorColor = sensors[selectedSensorType].color;

    const newBox: JunctionBox = {
      id: `jb-${Date.now()}`,
      x: position.x,
      y: position.y,
      z: position.z,
      sensorTypeId: selectedSensorType,
      ports: selectedPorts,
      color: sensorColor,
    };

    setJunctionBoxes([...junctionBoxes, newBox]);
    setJunctionDialogOpen(false);
  };

  const handleDeleteJunctionBox = (id: string) => {
    setJunctionBoxes(junctionBoxes.filter((jbox) => jbox.id !== id));
  };

  const handleAutoConnect = () => {
    // Get currently connected sensors
    const alreadyConnected = getConnectedSensors();

    // Group unconnected sensors by type
    const unconnectedByType = new Map<number, Sensor[]>();
    sensors.forEach((_, typeId) => {
      const typeSensors = placedSensors.filter((s) => s.type === typeId && !alreadyConnected.has(s));
      if (typeSensors.length > 0) {
        unconnectedByType.set(typeId, typeSensors);
      }
    });

    const newBoxes: JunctionBox[] = [...junctionBoxes];

    // For each type with unconnected sensors, create optimal junction boxes
    unconnectedByType.forEach((typeSensors, typeId) => {
      // Calculate how many junction boxes we need (24 ports max per box)
      const maxPortsPerBox = 24;
      const numBoxesNeeded = Math.ceil(typeSensors.length / maxPortsPerBox);

      for (let i = 0; i < numBoxesNeeded; i++) {
        const startIdx = i * maxPortsPerBox;
        const endIdx = Math.min(startIdx + maxPortsPerBox, typeSensors.length);
        const boxSensors = typeSensors.slice(startIdx, endIdx);

        if (boxSensors.length === 0) continue;

        // Calculate centroid of these sensors
        const centroid = {
          x: boxSensors.reduce((sum, s) => sum + s.x, 0) / boxSensors.length,
          y: boxSensors.reduce((sum, s) => sum + s.y, 0) / boxSensors.length,
          z: boxSensors.reduce((sum, s) => sum + s.z, 0) / boxSensors.length,
        };

        // Try to find a non-overlapping position near the centroid
        let finalPosition = centroid;
        const testRadius = Math.min(unitsX, unitsY, unitsZ) / 6;
        const step = testRadius / 2;
        let foundPosition = false;

        for (let dx = 0; !foundPosition && dx <= testRadius; dx += step) {
          for (let dy = 0; !foundPosition && dy <= testRadius; dy += step) {
            for (let dz = 0; !foundPosition && dz <= testRadius; dz += step) {
              const testPos = {
                x: Math.max(0, Math.min(unitsX, centroid.x + dx)),
                y: Math.max(0, Math.min(unitsY, centroid.y + dy)),
                z: Math.max(0, Math.min(unitsZ, centroid.z + dz)),
              };

              // Check if this position overlaps with existing boxes
              const overlaps = [...newBoxes].some((jbox) => {
                const dist = Math.sqrt(
                  Math.pow(jbox.x - testPos.x, 2) +
                  Math.pow(jbox.y - testPos.y, 2) +
                  Math.pow(jbox.z - testPos.z, 2)
                );
                return dist < 5;
              });

              if (!overlaps) {
                finalPosition = testPos;
                foundPosition = true;
              }
            }
          }
        }

        newBoxes.push({
          id: `auto-${typeId}-${i}-${Date.now()}`,
          x: finalPosition.x,
          y: finalPosition.y,
          z: finalPosition.z,
          sensorTypeId: typeId,
          ports: boxSensors.length,
          color: sensors[typeId].color,
        });
      }
    });

    setJunctionBoxes(newBoxes);
  };

  // Check if all sensors are connected
  const areAllSensorsConnected = () => {
    if (placedSensors.length === 0 || junctionBoxes.length === 0) return false;

    const alreadyConnected = new Set<Sensor>();
    junctionBoxes.forEach((jbox) => {
      const typeSensors = placedSensors.filter((s) => s.type === jbox.sensorTypeId);
      const availableSensors = typeSensors
        .filter((s) => !alreadyConnected.has(s))
        .map((s) => ({
          sensor: s,
          dist: Math.sqrt(
            Math.pow(s.x - jbox.x, 2) +
            Math.pow(s.y - jbox.y, 2) +
            Math.pow(s.z - jbox.z, 2)
          ),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, jbox.ports);

      availableSensors.forEach(({ sensor }) => alreadyConnected.add(sensor));
    });

    return alreadyConnected.size === placedSensors.length;
  };

  // Optimization function with streaming updates
  const handleOptimize = async () => {
    setOptimizeDialogOpen(true);
    setIsOptimizing(true);
    setOptimizationSteps([]);

    const addStep = (step: string) => {
      setOptimizationSteps((prev) => [...prev, step]);
    };

    try {
      const startTime = Date.now();

      addStep('🚀 Starting optimization process...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      addStep(`📊 Current configuration: ${placedSensors.length} sensors, ${junctionBoxes.length} junction boxes`);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Calculate current total cable length
      let totalCableLength = 0;
      const alreadyConnected = new Set<Sensor>();
      junctionBoxes.forEach((jbox) => {
        const typeSensors = placedSensors.filter((s) => s.type === jbox.sensorTypeId);
        const availableSensors = typeSensors
          .filter((s) => !alreadyConnected.has(s))
          .map((s) => ({
            sensor: s,
            dist: Math.sqrt(
              Math.pow(s.x - jbox.x, 2) +
              Math.pow(s.y - jbox.y, 2) +
              Math.pow(s.z - jbox.z, 2)
            ),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, jbox.ports);

        availableSensors.forEach(({ sensor, dist }) => {
          alreadyConnected.add(sensor);
          totalCableLength += dist;
        });
      });

      addStep(`📏 Current total cable length: ${totalCableLength.toFixed(2)} units`);
      await new Promise((resolve) => setTimeout(resolve, 500));

      addStep('🎯 Optimization goals: Minimize cable length AND number of junction boxes');
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Step 1: Try to consolidate junction boxes by type
      addStep('📦 Step 1: Analyzing junction box consolidation opportunities...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const sensorsByType = new Map<number, Sensor[]>();
      sensors.forEach((sensor, idx) => {
        sensorsByType.set(idx, placedSensors.filter((s) => s.type === idx));
      });

      const optimizedBoxes: JunctionBox[] = [];

      // Group junction boxes by sensor type
      const boxesByType = new Map<number, JunctionBox[]>();
      junctionBoxes.forEach((jbox) => {
        if (!boxesByType.has(jbox.sensorTypeId)) {
          boxesByType.set(jbox.sensorTypeId, []);
        }
        boxesByType.get(jbox.sensorTypeId)!.push(jbox);
      });

      let removedBoxes = 0;

      for (const [typeId, typeBoxes] of boxesByType.entries()) {
        const typeSensors = sensorsByType.get(typeId) || [];
        const totalPorts = typeBoxes.reduce((sum, box) => sum + box.ports, 0);

        addStep(`   → Type ${typeId + 1}: ${typeBoxes.length} junction boxes, ${totalPorts} total ports, ${typeSensors.length} sensors`);
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (typeSensors.length <= totalPorts && typeBoxes.length > 1) {
          // Can potentially consolidate into fewer boxes
          const minBoxesNeeded = Math.ceil(typeSensors.length / 24); // Max 24 ports per box

          if (minBoxesNeeded < typeBoxes.length) {
            addStep(`   ✓ Can consolidate into ${minBoxesNeeded} box(es) (saving ${typeBoxes.length - minBoxesNeeded} boxes)`);
            await new Promise((resolve) => setTimeout(resolve, 300));
            removedBoxes += typeBoxes.length - minBoxesNeeded;

            // Create consolidated boxes
            const sensorsPerBox = Math.ceil(typeSensors.length / minBoxesNeeded);
            for (let i = 0; i < minBoxesNeeded; i++) {
              const startIdx = i * sensorsPerBox;
              const endIdx = Math.min(startIdx + sensorsPerBox, typeSensors.length);
              const boxSensors = typeSensors.slice(startIdx, endIdx);

              if (boxSensors.length === 0) continue;

              // Calculate optimal position for this consolidated box
              const centroid = {
                x: boxSensors.reduce((sum, s) => sum + s.x, 0) / boxSensors.length,
                y: boxSensors.reduce((sum, s) => sum + s.y, 0) / boxSensors.length,
                z: boxSensors.reduce((sum, s) => sum + s.z, 0) / boxSensors.length,
              };

              optimizedBoxes.push({
                id: `optimized-${typeId}-${i}-${Date.now()}`,
                x: centroid.x,
                y: centroid.y,
                z: centroid.z,
                sensorTypeId: typeId,
                ports: Math.min(boxSensors.length, 24),
                color: sensors[typeId].color,
              });
            }
          } else {
            addStep(`   → Cannot consolidate further (already optimal)`);
            await new Promise((resolve) => setTimeout(resolve, 300));
            optimizedBoxes.push(...typeBoxes);
          }
        } else {
          optimizedBoxes.push(...typeBoxes);
        }
      }

      if (removedBoxes > 0) {
        addStep(`✨ Removed ${removedBoxes} redundant junction box(es)`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Step 2: Optimize positions of remaining boxes
      addStep('📐 Step 2: Optimizing positions of junction boxes...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const finalBoxes: JunctionBox[] = [];
      let newTotalCableLength = 0;
      const processedSensors = new Set<Sensor>();

      for (let i = 0; i < optimizedBoxes.length; i++) {
        const jbox = optimizedBoxes[i];
        addStep(`   → Optimizing Junction Box ${i + 1}/${optimizedBoxes.length} (Type ${jbox.sensorTypeId + 1})`);
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Get free sensors for this type
        const typeSensors = placedSensors.filter(
          (s) => s.type === jbox.sensorTypeId && !processedSensors.has(s)
        );

        if (typeSensors.length === 0) {
          finalBoxes.push(jbox);
          continue;
        }

        // Calculate centroid
        const centroid = {
          x: typeSensors.reduce((sum, s) => sum + s.x, 0) / typeSensors.length,
          y: typeSensors.reduce((sum, s) => sum + s.y, 0) / typeSensors.length,
          z: typeSensors.reduce((sum, s) => sum + s.z, 0) / typeSensors.length,
        };

        // Find optimal position
        let bestPos = centroid;
        let minTotalDist = Infinity;
        const testRadius = Math.min(unitsX, unitsY, unitsZ) / 5;
        const step = testRadius / 3;

        for (let dx = -testRadius; dx <= testRadius; dx += step) {
          for (let dy = -testRadius; dy <= testRadius; dy += step) {
            for (let dz = -testRadius; dz <= testRadius; dz += step) {
              const testPos = {
                x: Math.max(0, Math.min(unitsX, centroid.x + dx)),
                y: Math.max(0, Math.min(unitsY, centroid.y + dy)),
                z: Math.max(0, Math.min(unitsZ, centroid.z + dz)),
              };

              const distances = typeSensors
                .map((s) => Math.sqrt(
                  Math.pow(s.x - testPos.x, 2) +
                  Math.pow(s.y - testPos.y, 2) +
                  Math.pow(s.z - testPos.z, 2)
                ))
                .sort((a, b) => a - b)
                .slice(0, jbox.ports);

              const totalDist = distances.reduce((sum, d) => sum + d, 0);
              if (totalDist < minTotalDist) {
                minTotalDist = totalDist;
                bestPos = testPos;
              }
            }
          }
        }

        // Create optimized junction box
        const optimizedBox: JunctionBox = {
          ...jbox,
          x: bestPos.x,
          y: bestPos.y,
          z: bestPos.z,
        };
        finalBoxes.push(optimizedBox);

        // Mark sensors as connected
        const connectedSensors = typeSensors
          .map((s) => ({
            sensor: s,
            dist: Math.sqrt(
              Math.pow(s.x - bestPos.x, 2) +
              Math.pow(s.y - bestPos.y, 2) +
              Math.pow(s.z - bestPos.z, 2)
            ),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, jbox.ports);

        connectedSensors.forEach(({ sensor, dist }) => {
          processedSensors.add(sensor);
          newTotalCableLength += dist;
        });

        addStep(`   ✓ Optimized position: (${bestPos.x.toFixed(1)}, ${bestPos.y.toFixed(1)}, ${bestPos.z.toFixed(1)})`);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      addStep('📊 Step 3: Calculating optimization results...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const cableImprovement = totalCableLength - newTotalCableLength;
      const cableImprovementPercent = ((cableImprovement / totalCableLength) * 100).toFixed(1);
      const boxesReduction = junctionBoxes.length - finalBoxes.length;

      addStep(`📏 New total cable length: ${newTotalCableLength.toFixed(2)} units`);
      await new Promise((resolve) => setTimeout(resolve, 400));

      addStep(`📦 New number of junction boxes: ${finalBoxes.length} (reduced by ${boxesReduction})`);
      await new Promise((resolve) => setTimeout(resolve, 400));

      addStep(`✨ Cable saved: ${cableImprovement.toFixed(2)} units (${cableImprovementPercent}% improvement)`);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Apply optimized configuration
      setJunctionBoxes(finalBoxes);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      addStep(`⏱️ Optimization completed in ${duration} seconds`);
      addStep('✅ Configuration optimized successfully!');

    } catch (error) {
      addStep(`❌ Error during optimization: ${error}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAIOptimize = async () => {
    setOptimizeDialogOpen(true);
    setIsOptimizing(true);
    setOptimizationSteps([]);

    const addStep = (step: string) => {
      setOptimizationSteps((prev) => [...prev, step]);
    };

    try {
      const startTime = Date.now();

      addStep('🤖 Starting AI-powered optimization...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Calculate current metrics
      addStep(`📊 Current configuration: ${placedSensors.length} sensors, ${junctionBoxes.length} junction boxes`);
      await new Promise((resolve) => setTimeout(resolve, 300));

      let totalCableLength = 0;
      const alreadyConnected = new Set<Sensor>();
      junctionBoxes.forEach((jbox) => {
        const typeSensors = placedSensors.filter((s) => s.type === jbox.sensorTypeId);
        const availableSensors = typeSensors
          .filter((s) => !alreadyConnected.has(s))
          .map((s) => ({
            sensor: s,
            dist: Math.sqrt(
              Math.pow(s.x - jbox.x, 2) +
              Math.pow(s.y - jbox.y, 2) +
              Math.pow(s.z - jbox.z, 2)
            ),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, jbox.ports);

        availableSensors.forEach(({ sensor, dist }) => {
          alreadyConnected.add(sensor);
          totalCableLength += dist;
        });
      });

      addStep(`📏 Current total cable length: ${totalCableLength.toFixed(2)} units`);
      await new Promise((resolve) => setTimeout(resolve, 500));

      addStep('🧠 Sending configuration to AI for analysis...');
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Prepare data for AI
      const requestData = {
        sensors: placedSensors,
        junctionBoxes: junctionBoxes,
        unitsX,
        unitsY,
        unitsZ,
      };

      const response = await fetch('/api/optimize-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI optimization');
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Display AI analysis
      if (result.analysis) {
        addStep(`💡 AI Analysis: ${result.analysis}`);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      // Show AI steps
      if (result.steps && Array.isArray(result.steps)) {
        for (const step of result.steps) {
          addStep(step);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      // Apply optimized junction boxes
      if (result.optimizedBoxes && Array.isArray(result.optimizedBoxes)) {
        addStep(`📦 Applying AI-optimized configuration...`);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newBoxes: JunctionBox[] = result.optimizedBoxes.map((box: any, idx: number) => ({
          id: `ai-optimized-${box.sensorTypeId}-${idx}-${Date.now()}`,
          x: box.x,
          y: box.y,
          z: box.z,
          sensorTypeId: box.sensorTypeId,
          ports: box.ports,
          color: sensors[box.sensorTypeId].color,
        }));

        // Calculate new cable length and verify all sensors are connected
        let newTotalCableLength = 0;
        const processedSensors = new Set<Sensor>();

        newBoxes.forEach((jbox) => {
          const typeSensors = placedSensors.filter(
            (s) => s.type === jbox.sensorTypeId && !processedSensors.has(s)
          );

          const connectedSensors = typeSensors
            .map((s) => ({
              sensor: s,
              dist: Math.sqrt(
                Math.pow(s.x - jbox.x, 2) +
                Math.pow(s.y - jbox.y, 2) +
                Math.pow(s.z - jbox.z, 2)
              ),
            }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, jbox.ports);

          connectedSensors.forEach(({ sensor, dist }) => {
            processedSensors.add(sensor);
            newTotalCableLength += dist;
          });
        });

        // Verify that all sensors are connected
        const allSensorsConnected = processedSensors.size === placedSensors.length;

        if (!allSensorsConnected) {
          addStep(`❌ AI optimization failed: Not all sensors are connected!`);
          await new Promise((resolve) => setTimeout(resolve, 400));
          addStep(`📊 Connected sensors: ${processedSensors.size}/${placedSensors.length}`);
          await new Promise((resolve) => setTimeout(resolve, 400));
          addStep(`⚠️ The AI-generated configuration is invalid and will NOT be applied.`);
          await new Promise((resolve) => setTimeout(resolve, 400));
          addStep(`💡 Try using the Algorithm Optimizer instead, or add more junction boxes manually.`);
          setIsOptimizing(false);
          return;
        }

        // All sensors are connected, proceed with applying the optimization
        setJunctionBoxes(newBoxes);

        addStep(`📏 New total cable length: ${newTotalCableLength.toFixed(2)} units`);
        await new Promise((resolve) => setTimeout(resolve, 400));

        addStep(`📦 New number of junction boxes: ${newBoxes.length} (reduced by ${junctionBoxes.length - newBoxes.length})`);
        await new Promise((resolve) => setTimeout(resolve, 400));

        const cableImprovement = totalCableLength - newTotalCableLength;
        const cableImprovementPercent = ((cableImprovement / totalCableLength) * 100).toFixed(1);

        addStep(`✨ Cable saved: ${cableImprovement.toFixed(2)} units (${cableImprovementPercent}% improvement)`);
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (result.improvements?.efficiencyGain) {
          addStep(`📈 Overall efficiency gain: ${result.improvements.efficiencyGain.toFixed(1)}%`);
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      addStep(`⏱️ AI optimization completed in ${duration} seconds`);
      addStep('✅ Configuration optimized successfully with AI!');

    } catch (error) {
      addStep(`❌ Error during AI optimization: ${error}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const setup = (p5: p5, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL).parent(canvasParentRef);
    p5.frameRate(60);
  };

  const draw = (p5: p5) => {
    p5.background(0);

    // Enable orbit control with mouse
    if (p5.mouseIsPressed) {
      rotationY.current += (p5.mouseX - p5.pmouseX) * 0.01;
      rotationX.current += (p5.mouseY - p5.pmouseY) * 0.01;
    }

    // Apply transformations
    p5.rotateX(rotationX.current);
    p5.rotateY(rotationY.current);
    p5.scale(zoomLevel.current);

    // Calculate unit size based on space dimensions to fit in viewport
    const maxDimension = Math.max(unitsX, unitsY, unitsZ);
    const unitSize = Math.min(600 / maxDimension, 10);

    // Draw base floor (bottom of the cube) with color
    p5.push();
    p5.translate(0, (unitsY * unitSize) / 2, 0);
    p5.rotateX(p5.HALF_PI);
    p5.fill(20, 20, 40, 150);
    p5.noStroke();
    p5.rect(-unitsX * unitSize / 2, -unitsZ * unitSize / 2, unitsX * unitSize, unitsZ * unitSize);
    p5.pop();

    // Draw space boundaries (wireframe box)
    p5.push();
    p5.stroke(80);
    p5.noFill();
    p5.strokeWeight(1);
    p5.box(unitsX * unitSize, unitsY * unitSize, unitsZ * unitSize);
    p5.pop();

    // Draw grid lines on bottom
    p5.push();
    p5.stroke(60, 60, 120);
    p5.strokeWeight(1);

    // Position grid at bottom of box
    p5.translate(0, (unitsY * unitSize) / 2, 0);
    p5.rotateX(p5.HALF_PI);

    const gridStep = Math.max(5, Math.floor(maxDimension / 10));
    for (let i = -unitsX/2; i <= unitsX/2; i += gridStep) {
      p5.line(
        i * unitSize, -unitsZ * unitSize / 2,
        i * unitSize, unitsZ * unitSize / 2
      );
    }
    for (let i = -unitsZ/2; i <= unitsZ/2; i += gridStep) {
      p5.line(
        -unitsX * unitSize / 2, i * unitSize,
        unitsX * unitSize / 2, i * unitSize
      );
    }
    p5.pop();

    // Draw connections from junction boxes to sensors (with exclusivity)
    const alreadyConnected = new Set<Sensor>();

    junctionBoxes.forEach((jbox) => {
      const jboxX = (jbox.x - unitsX / 2) * unitSize;
      const jboxY = (jbox.y - unitsY / 2) * unitSize;
      const jboxZ = (jbox.z - unitsZ / 2) * unitSize;

      // Get sensors of this type that are NOT already connected
      const availableSensors = placedSensors
        .filter((s) => s.type === jbox.sensorTypeId && !alreadyConnected.has(s))
        .map((s) => ({
          sensor: s,
          dist: Math.sqrt(
            Math.pow(s.x - jbox.x, 2) +
            Math.pow(s.y - jbox.y, 2) +
            Math.pow(s.z - jbox.z, 2)
          ),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, jbox.ports);

      // Mark these sensors as connected
      availableSensors.forEach(({ sensor }) => alreadyConnected.add(sensor));

      // Draw lines to connected sensors
      p5.push();
      const r = parseInt(jbox.color.slice(1, 3), 16);
      const g = parseInt(jbox.color.slice(3, 5), 16);
      const b = parseInt(jbox.color.slice(5, 7), 16);
      p5.stroke(r, g, b, 150);
      p5.strokeWeight(1);

      availableSensors.forEach(({ sensor }) => {
        const sensorX = (sensor.x - unitsX / 2) * unitSize;
        const sensorY = (sensor.y - unitsY / 2) * unitSize;
        const sensorZ = (sensor.z - unitsZ / 2) * unitSize;
        p5.line(jboxX, jboxY, jboxZ, sensorX, sensorY, sensorZ);
      });
      p5.pop();
    });

    // Draw sensors with correct positioning
    placedSensors.forEach((sensor) => {
      p5.push();

      // Center the coordinates around origin
      const x = (sensor.x - unitsX / 2) * unitSize;
      const y = (sensor.y - unitsY / 2) * unitSize;
      const z = (sensor.z - unitsZ / 2) * unitSize;

      p5.translate(x, y, z);

      // Parse hex color to RGB
      const r = parseInt(sensor.color.slice(1, 3), 16);
      const g = parseInt(sensor.color.slice(3, 5), 16);
      const b = parseInt(sensor.color.slice(5, 7), 16);

      // Check if this sensor is connected
      const isConnected = alreadyConnected.has(sensor);

      if (isConnected) {
        // Connected sensor - normal appearance
        // Inner sphere
        p5.fill(r, g, b);
        p5.noStroke();
        p5.sphere(unitSize * 0.6);

        // Glow effect
        p5.stroke(r, g, b, 100);
        p5.strokeWeight(1);
        p5.noFill();
        p5.sphere(unitSize * 0.9);
      } else {
        // Unconnected sensor - dimmed with border
        // Inner sphere - much dimmer
        p5.fill(r * 0.3, g * 0.3, b * 0.3, 120);
        p5.stroke(r, g, b, 180);
        p5.strokeWeight(2);
        p5.sphere(unitSize * 0.6);

        // Pulsing effect outline
        const pulseSize = 0.9 + Math.sin(p5.frameCount * 0.05) * 0.1;
        p5.stroke(r, g, b, 80);
        p5.strokeWeight(1);
        p5.noFill();
        p5.sphere(unitSize * pulseSize);
      }

      p5.pop();
    });

    // Draw junction boxes
    junctionBoxes.forEach((jbox) => {
      p5.push();

      const x = (jbox.x - unitsX / 2) * unitSize;
      const y = (jbox.y - unitsY / 2) * unitSize;
      const z = (jbox.z - unitsZ / 2) * unitSize;

      p5.translate(x, y, z);

      // Parse hex color to RGB
      const r = parseInt(jbox.color.slice(1, 3), 16);
      const g = parseInt(jbox.color.slice(3, 5), 16);
      const b = parseInt(jbox.color.slice(5, 7), 16);

      // Draw box
      p5.fill(r, g, b);
      p5.stroke(255);
      p5.strokeWeight(2);
      p5.box(unitSize * 1.5);

      // Draw outline
      p5.noFill();
      p5.stroke(r, g, b, 200);
      p5.strokeWeight(1);
      p5.box(unitSize * 1.8);

      p5.pop();
    });

    // Draw info overlay
    drawInfoOverlay(p5);
  };

  const drawInfoOverlay = (p5: p5) => {
    p5.push();
    p5.resetMatrix();

    // Display info in top-left corner
    p5.textAlign(p5.LEFT);
    p5.textSize(14);
    p5.fill(100, 200, 255);
    p5.text(`Space: ${unitsX} × ${unitsY} × ${unitsZ} units`, -p5.width/2 + 20, -p5.height/2 + 100);
    p5.fill(150, 255, 150);
    p5.text(`Sensors: ${placedSensors.length}`, -p5.width/2 + 20, -p5.height/2 + 120);

    // Instructions at the bottom
    p5.textAlign(p5.CENTER);
    p5.textSize(13);
    p5.fill(200, 200, 200);

    const bottomY = p5.height/2 - 60;
    p5.text('🖱️ Click and drag to rotate  |  🔍 Scroll to zoom', 0, bottomY);

    p5.textSize(12);
    p5.fill(180, 180, 180);

    // Show appropriate button instructions based on state
    const allConnected = areAllSensorsConnected();
    if (!allConnected && placedSensors.length > 0) {
      p5.text('⚡ Auto-Connect: Automatically create junction boxes for all sensors', 0, bottomY + 25);
    } else if (allConnected) {
      p5.text('🔧 Algorithm Optimizer: Consolidate and optimize junction boxes  |  🤖 AI Optimize: AI-powered optimization', 0, bottomY + 25);
    }

    p5.fill(160, 160, 160);
    p5.textSize(11);
    p5.text('➕ Add Junction Box: Manually place a junction box', 0, bottomY + 45);

    p5.pop();
  };

  const mouseWheel = (p5: p5, event: any) => {
    // Zoom in/out with mouse wheel
    const zoomSpeed = 0.001;
    zoomLevel.current -= event.delta * zoomSpeed;
    zoomLevel.current = p5.constrain(zoomLevel.current, 0.3, 3);
    return false; // Prevent default scrolling
  };

  const windowResized = (p5: p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <>
      {/* Optimization Dialog */}
      <Dialog
        open={optimizeDialogOpen}
        onClose={() => !isOptimizing && setOptimizeDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: 10000,
        }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
            color: 'white',
            minHeight: 400,
            maxHeight: 600,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ color: '#4ECDC4' }} />
            <Typography variant="h6">Optimization Process</Typography>
          </Box>
          {!isOptimizing && (
            <IconButton onClick={() => setOptimizeDialogOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{
              maxHeight: 450,
              overflowY: 'auto',
              bgcolor: 'rgba(0,0,0,0.3)',
              borderRadius: 2,
              p: 2,
              fontFamily: 'monospace',
            }}
          >
            {optimizationSteps.map((step, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 1,
                  opacity: 0,
                  animation: 'fadeIn 0.3s ease forwards',
                  animationDelay: '0s',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-5px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: step.includes('✅') || step.includes('✓') ? '#4ECDC4' :
                           step.includes('❌') ? '#ff4444' :
                           step.includes('🚀') || step.includes('✨') ? '#FFD93D' :
                           step.includes('🤖') || step.includes('🧠') ? '#FF6B9D' :
                           step.includes('💡') ? '#FFCC00' :
                           step.includes('→') ? '#9B59B6' :
                           '#aaa',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                  }}
                >
                  {step}
                </Typography>
              </Box>
            ))}
            {isOptimizing && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#4ECDC4',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                      '50%': { opacity: 0.5, transform: 'scale(1.2)' },
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#4ECDC4' }}>
                  Processing...
                </Typography>
              </Box>
            )}
          </Box>

          {!isOptimizing && optimizationSteps.length > 0 && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => setOptimizeDialogOpen(false)}
              sx={{
                mt: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3db8b0 0%, #3aa4ba 100%)',
                },
              }}
            >
              Close
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Junction Box Dialog - Outside P5 */}
      <Dialog
        open={junctionDialogOpen}
        onClose={() => setJunctionDialogOpen(false)}
        sx={{
          zIndex: 10000,
        }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
            color: 'white',
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CableIcon sx={{ color: '#667eea' }} />
            <Typography variant="h6">Add Junction Box</Typography>
          </Box>
          <IconButton onClick={() => setJunctionDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sensor Type</InputLabel>
            <Select
              value={selectedSensorType}
              onChange={(e) => setSelectedSensorType(e.target.value as number)}
              label="Sensor Type"
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#2d2d2d',
                    color: 'white',
                  },
                },
                disablePortal: false,
                style: { zIndex: 10001 },
              }}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea',
                },
              }}
            >
              {sensors.map((sensor, idx) => (
                <MenuItem key={idx} value={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: sensor.color,
                      }}
                    />
                    Type {idx + 1} ({sensor.count} sensors)
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Number of Ports</InputLabel>
            <Select
              value={selectedPorts}
              onChange={(e) => setSelectedPorts(e.target.value as number)}
              label="Number of Ports"
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#2d2d2d',
                    color: 'white',
                  },
                },
                disablePortal: false,
                style: { zIndex: 10001 },
              }}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea',
                },
              }}
            >
              {[3, 6, 9, 12, 15, 18, 21, 24].map((num) => (
                <MenuItem key={num} value={num}>
                  {num} ports
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            onClick={handleAddJunctionBox}
            sx={{
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              },
            }}
          >
            Add Junction Box
          </Button>
        </DialogContent>
      </Dialog>

      {/* Full-screen overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: '#000',
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        {/* Top bar */}
        <AppBar
          elevation={0}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <Toolbar sx={{ gap: 2, py: 1.5 }}>
            <Button
              variant="text"
              startIcon={<HomeIcon />}
              onClick={() => router.push('/')}
              sx={{
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 2,
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                },
              }}
            >
              Home
            </Button>
            <Box
              sx={{
                width: '1px',
                height: '24px',
                bgcolor: 'rgba(102, 126, 234, 0.3)',
              }}
            />
            <Button
              variant="text"
              startIcon={<SettingsIcon />}
              onClick={onReconfigure}
              sx={{
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 2,
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                },
              }}
            >
              Reconfigure
            </Button>
            <Box
              sx={{
                width: '1px',
                height: '24px',
                bgcolor: 'rgba(102, 126, 234, 0.3)',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.1rem',
                flex: 1,
              }}
            >
              3D Sensor Optimization
            </Typography>
            {!areAllSensorsConnected() && placedSensors.length > 0 && (
              <Button
                variant="contained"
                startIcon={<FlashOnIcon />}
                onClick={handleAutoConnect}
                sx={{
                  background: 'linear-gradient(135deg, #FFD93D 0%, #FFA500 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFC520 0%, #FF8C00 100%)',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  mr: 1,
                  color: '#000',
                }}
              >
                Auto-Connect
              </Button>
            )}
            {areAllSensorsConnected() && (
              <>
                <Button
                  variant="contained"
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleOptimize}
                  sx={{
                    background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3db8b0 0%, #3aa4ba 100%)',
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                    mr: 1,
                  }}
                >
                  Algorithm Optimizer
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PsychologyIcon />}
                  onClick={handleAIOptimize}
                  sx={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E85A8B 0%, #A85D73 100%)',
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                    mr: 1,
                  }}
                >
                  AI Optimize
                </Button>
              </>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setJunctionDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Add Junction Box
            </Button>
          </Toolbar>
        </AppBar>

        {/* Sensor Types & Statistics (Left) */}
        <Paper
          sx={{
            position: 'absolute',
            top: 74,
            left: 12,
            p: 1.2,
            bgcolor: 'rgba(0,0,0,0.8)',
            color: 'white',
            zIndex: 1000,
            minWidth: 260,
            maxWidth: 300,
            maxHeight: 'calc(100vh - 84px)',
            overflowY: 'auto',
            borderRadius: 1.5,
            border: '1px solid rgba(102, 126, 234, 0.3)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontSize: '0.8rem', color: '#667eea', fontWeight: 700 }}>
            Sensor Types & Statistics
          </Typography>

          {(() => {
            // Calculate statistics with proper connection tracking
            const alreadyConnected = new Set<Sensor>();
            const stats = sensors.map((sensor, idx) => {
              const typeSensors = placedSensors.filter((s) => s.type === idx);

              return {
                type: idx,
                color: sensor.color,
                total: typeSensors.length,
                connected: 0,
                ports: 0,
                cableLength: 0,
              };
            });

            // Process each junction box in order to track connections properly
            junctionBoxes.forEach((jbox) => {
              const typeSensors = placedSensors.filter((s) => s.type === jbox.sensorTypeId);

              // Get available sensors for this junction box
              const availableSensors = typeSensors
                .filter((s) => !alreadyConnected.has(s))
                .map((s) => ({
                  sensor: s,
                  dist: Math.sqrt(
                    Math.pow(s.x - jbox.x, 2) +
                    Math.pow(s.y - jbox.y, 2) +
                    Math.pow(s.z - jbox.z, 2)
                  ),
                }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, jbox.ports);

              // Update statistics for this sensor type
              stats[jbox.sensorTypeId].ports += jbox.ports;
              stats[jbox.sensorTypeId].connected += availableSensors.length;

              availableSensors.forEach(({ sensor, dist }) => {
                alreadyConnected.add(sensor);
                stats[jbox.sensorTypeId].cableLength += dist;
              });
            });

            const totalConnected = stats.reduce((sum, s) => sum + s.connected, 0);
            const totalPorts = stats.reduce((sum, s) => sum + s.ports, 0);
            const totalCable = stats.reduce((sum, s) => sum + s.cableLength, 0);

            return (
              <>
                {stats.map((stat) => (
                  <Box
                    key={stat.type}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 0.75,
                      bgcolor: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${stat.color}40`,
                      boxShadow: `0 3px 5px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(0,0,0,0.5)`,
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.4)',
                        boxShadow: `0 5px 7px rgba(0,0,0,0.4), 0 2px 3px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(0,0,0,0.6)`,
                      },
                    }}
                  >
                    {/* Header with color indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: stat.color,
                          boxShadow: `0 0 6px ${stat.color}`,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: stat.color, fontSize: '0.8rem' }}>
                        Type {stat.type + 1}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#888', ml: 'auto', fontSize: '0.6rem' }}>
                        {stat.total} sensors
                      </Typography>
                    </Box>

                    {/* Connection bar */}
                    <Box sx={{ mb: 0.4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                        <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                          Connected
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                          {stat.connected}/{stat.total}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 4,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 0.5,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${stat.total > 0 ? (stat.connected / stat.total) * 100 : 0}%`,
                            height: '100%',
                            bgcolor: stat.color,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Unconnected sensors */}
                    {stat.total - stat.connected > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#ff6666',
                          display: 'block',
                          fontSize: '0.6rem',
                          mb: 0.2,
                          fontWeight: 600
                        }}
                      >
                        Unconnected: {stat.total - stat.connected}
                      </Typography>
                    )}

                    {/* Ports and Cable on same line */}
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      {stat.ports > 0 && (
                        <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                          Ports: {stat.ports}
                        </Typography>
                      )}
                      {stat.cableLength > 0 && (
                        <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                          Cable: {stat.cableLength.toFixed(1)}u
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}

                {/* Total section */}
                {junctionBoxes.length > 0 && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      borderRadius: 0.75,
                      bgcolor: 'rgba(102,126,234,0.15)',
                      border: '1px solid rgba(102,126,234,0.4)',
                      boxShadow: `0 3px 5px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(0,0,0,0.5)`,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea', mb: 0.5, fontSize: '0.8rem' }}>
                      Total
                    </Typography>

                    {/* Total connections bar */}
                    <Box sx={{ mb: 0.4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                        <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                          Connected Sensors
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                          {totalConnected}/{placedSensors.length}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 5,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 0.5,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${placedSensors.length > 0 ? (totalConnected / placedSensors.length) * 100 : 0}%`,
                            height: '100%',
                            bgcolor: '#667eea',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                        Ports: {totalPorts}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                        Cable: {totalCable.toFixed(1)}u
                      </Typography>
                    </Box>
                  </Box>
                )}
              </>
            );
          })()}
        </Paper>

        {/* Junction Box Panel (Right) */}
        <Paper
          sx={{
            position: 'absolute',
            top: 74,
            right: 12,
            p: 1.2,
            bgcolor: 'rgba(0,0,0,0.8)',
            color: 'white',
            zIndex: 1000,
            minWidth: 200,
            maxHeight: 'calc(100vh - 84px)',
            overflowY: 'auto',
            borderRadius: 1.5,
            border: '1px solid rgba(102, 126, 234, 0.3)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontSize: '0.8rem', color: '#667eea', fontWeight: 700 }}>
            Junction Boxes
          </Typography>

          {junctionBoxes.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
              No junction boxes yet
            </Typography>
          ) : (
            (() => {
              // Process junction boxes sequentially to track connections properly
              const alreadyConnected = new Set<Sensor>();
              const jboxStats: Array<{
                jbox: JunctionBox;
                connectedCount: number;
                freeSensors: number;
              }> = [];

              junctionBoxes.forEach((jbox) => {
                const typeSensors = placedSensors.filter((s) => s.type === jbox.sensorTypeId);

                // Get sensors that are NOT already connected
                const availableSensors = typeSensors
                  .filter((s) => !alreadyConnected.has(s))
                  .map((s) => ({
                    sensor: s,
                    dist: Math.sqrt(
                      Math.pow(s.x - jbox.x, 2) +
                      Math.pow(s.y - jbox.y, 2) +
                      Math.pow(s.z - jbox.z, 2)
                    ),
                  }))
                  .sort((a, b) => a.dist - b.dist)
                  .slice(0, jbox.ports);

                // Mark sensors as connected
                availableSensors.forEach(({ sensor }) => alreadyConnected.add(sensor));

                // Calculate free sensors (sensors of this type not yet connected)
                const freeSensors = typeSensors.filter((s) => !alreadyConnected.has(s)).length;

                jboxStats.push({
                  jbox,
                  connectedCount: availableSensors.length,
                  freeSensors,
                });
              });

              return jboxStats.map((stat) => (
                <Box
                  key={stat.jbox.id}
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 0.75,
                    bgcolor: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${stat.jbox.color}40`,
                    boxShadow: `0 3px 5px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(0,0,0,0.5)`,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.4)',
                      boxShadow: `0 5px 7px rgba(0,0,0,0.4), 0 2px 3px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(0,0,0,0.6)`,
                    },
                  }}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        bgcolor: stat.jbox.color,
                        border: '1px solid white',
                        boxShadow: `0 0 6px ${stat.jbox.color}`,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, fontSize: '0.8rem' }}>
                      Type {stat.jbox.sensorTypeId + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteJunctionBox(stat.jbox.id)}
                      sx={{
                        color: '#ff4444',
                        p: 0.3,
                        '&:hover': {
                          bgcolor: 'rgba(255,68,68,0.1)',
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Box>

                  {/* Ports bar */}
                  <Box sx={{ mb: 0.4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                      <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                        Ports Used
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.6rem' }}>
                        {stat.connectedCount}/{stat.jbox.ports}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 4,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 0.5,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${stat.jbox.ports > 0 ? (stat.connectedCount / stat.jbox.ports) * 100 : 0}%`,
                          height: '100%',
                          bgcolor: stat.jbox.color,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Free sensors info */}
                  <Typography variant="caption" sx={{ color: '#888', fontSize: '0.6rem' }}>
                    {stat.freeSensors} free
                  </Typography>
                </Box>
              ));
            })()
          )}
        </Paper>

        {/* Canvas area */}
        <Box
          sx={{
            position: 'absolute',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: 'calc(100vh - 64px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <Sketch setup={setup} draw={draw} mouseWheel={mouseWheel} windowResized={windowResized} />
        </Box>
      </Box>
    </>
  );
}
