'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Button,
  Stack,
  Grid,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SensorVisualization from './SensorVisualization';

interface SensorType {
  id: number;
  count: number;
  color: string;
}

export default function SensorOptimizerMain() {
  const [configured, setConfigured] = useState(false);

  // Space dimensions
  const [unitsX, setUnitsX] = useState(50);
  const [unitsY, setUnitsY] = useState(50);
  const [unitsZ, setUnitsZ] = useState(50);

  // Sensor configuration
  const [numSensorTypes, setNumSensorTypes] = useState(3);
  const [sensorCounts, setSensorCounts] = useState<number[]>([10, 10, 10, 10, 10]);
  const [sensorColors, setSensorColors] = useState<string[]>([
    '#FF3366', // Bright Red
    '#00FF88', // Bright Green
    '#3366FF', // Bright Blue
    '#FFCC00', // Bright Yellow
    '#FF00FF', // Bright Magenta
  ]);

  const handleSensorTypeChange = (event: Event, value: number | number[]) => {
    const newValue = value as number;
    setNumSensorTypes(newValue);
  };

  const handleSensorCountChange = (index: number) => (event: Event, value: number | number[]) => {
    const newCounts = [...sensorCounts];
    newCounts[index] = value as number;
    setSensorCounts(newCounts);
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...sensorColors];
    newColors[index] = newColor;
    setSensorColors(newColors);
  };

  const handleStartVisualization = () => {
    setConfigured(true);
  };

  const handleReconfigure = () => {
    setConfigured(false);
  };

  if (configured) {
    const sensors: SensorType[] = Array.from({ length: numSensorTypes }, (_, i) => ({
      id: i,
      count: sensorCounts[i],
      color: sensorColors[i],
    }));

    return <SensorVisualization
      unitsX={unitsX}
      unitsY={unitsY}
      unitsZ={unitsZ}
      sensors={sensors}
      onReconfigure={handleReconfigure}
    />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 800,
          width: '100%',
          p: 4,
          background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            3D Sensor Optimization
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa' }}>
            Configure your 3D space and sensor distribution
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: '#444', mb: 4 }} />

        {/* Space Dimensions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon /> Space Dimensions (units)
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom sx={{ color: '#4ECDC4' }}>
                Width (X): {unitsX} units
              </Typography>
              <Slider
                value={unitsX}
                onChange={(e, v) => setUnitsX(v as number)}
                min={10}
                max={1000}
                valueLabelDisplay="auto"
                sx={{
                  color: '#4ECDC4',
                  '& .MuiSlider-thumb': {
                    bgcolor: '#4ECDC4',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography gutterBottom sx={{ color: '#45B7D1' }}>
                Height (Y): {unitsY} units
              </Typography>
              <Slider
                value={unitsY}
                onChange={(e, v) => setUnitsY(v as number)}
                min={10}
                max={1000}
                valueLabelDisplay="auto"
                sx={{
                  color: '#45B7D1',
                  '& .MuiSlider-thumb': {
                    bgcolor: '#45B7D1',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography gutterBottom sx={{ color: '#FFA07A' }}>
                Depth (Z): {unitsZ} units
              </Typography>
              <Slider
                value={unitsZ}
                onChange={(e, v) => setUnitsZ(v as number)}
                min={10}
                max={1000}
                valueLabelDisplay="auto"
                sx={{
                  color: '#FFA07A',
                  '& .MuiSlider-thumb': {
                    bgcolor: '#FFA07A',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ bgcolor: '#444', my: 4 }} />

        {/* Sensor Configuration */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Sensor Configuration
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom sx={{ color: '#98D8C8' }}>
              Number of Sensor Types: {numSensorTypes}
            </Typography>
            <Slider
              value={numSensorTypes}
              onChange={handleSensorTypeChange}
              min={1}
              max={5}
              marks
              valueLabelDisplay="auto"
              sx={{
                color: '#98D8C8',
                '& .MuiSlider-thumb': {
                  bgcolor: '#98D8C8',
                },
              }}
            />
          </Box>

          <Stack spacing={3}>
            {Array.from({ length: numSensorTypes }, (_, i) => (
              <Box key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    component="input"
                    type="color"
                    value={sensorColors[i]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleColorChange(i, e.target.value)
                    }
                    sx={{
                      width: 40,
                      height: 40,
                      border: 'none',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&::-webkit-color-swatch-wrapper': {
                        padding: 0,
                      },
                      '&::-webkit-color-swatch': {
                        border: '2px solid rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                      },
                    }}
                  />
                  <Typography sx={{ color: sensorColors[i], fontWeight: 600, flex: 1 }}>
                    Sensor Type {i + 1}: {sensorCounts[i]} sensors
                  </Typography>
                </Box>
                <Slider
                  value={sensorCounts[i]}
                  onChange={handleSensorCountChange(i)}
                  min={1}
                  max={1000}
                  valueLabelDisplay="auto"
                  sx={{
                    color: sensorColors[i],
                    '& .MuiSlider-thumb': {
                      bgcolor: sensorColors[i],
                    },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ bgcolor: '#444', my: 4 }} />

        {/* Summary */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(102,126,234,0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
            Total Space: {unitsX} × {unitsY} × {unitsZ} = {unitsX * unitsY * unitsZ} cubic units
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
            Total Sensors: {sensorCounts.slice(0, numSensorTypes).reduce((a, b) => a + b, 0)}
          </Typography>
          {(() => {
            const totalVolume = unitsX * unitsY * unitsZ;
            const maxSensors = Math.floor(totalVolume * 0.3);
            const totalSensors = sensorCounts.slice(0, numSensorTypes).reduce((a, b) => a + b, 0);
            const percentage = ((totalSensors / totalVolume) * 100).toFixed(1);
            const isValid = totalSensors <= maxSensors;

            return (
              <>
                <Typography variant="body2" sx={{ color: isValid ? '#4ECDC4' : '#ff6666', mb: 0.5 }}>
                  Space Usage: {percentage}% (max 30%)
                </Typography>
                {!isValid && (
                  <Typography variant="caption" sx={{ color: '#ff6666', display: 'block' }}>
                    ⚠️ Too many sensors! Maximum allowed: {maxSensors} sensors (current: {totalSensors})
                  </Typography>
                )}
              </>
            );
          })()}
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={handleStartVisualization}
          disabled={(() => {
            const totalVolume = unitsX * unitsY * unitsZ;
            const maxSensors = Math.floor(totalVolume * 0.3);
            const totalSensors = sensorCounts.slice(0, numSensorTypes).reduce((a, b) => a + b, 0);
            return totalSensors > maxSensors;
          })()}
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #444 0%, #555 100%)',
              color: '#888',
            },
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          Start Visualization
        </Button>
      </Paper>
    </Box>
  );
}
