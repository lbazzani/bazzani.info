'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Slider,
  Button,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Tooltip as MuiTooltip,
  Link,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PublicIcon from '@mui/icons-material/Public';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SpeedIcon from '@mui/icons-material/Speed';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Co2Icon from '@mui/icons-material/Co2';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
} from 'recharts';

interface CO2DataDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

type MetricType = 'co2' | 'co2_per_capita' | 'cumulative_co2' | 'population' | 'gdp';
type ViewMode = 'overview' | 'country-detail' | 'comparison';

const COLORS = ['#326CE5', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
const MAJOR_COUNTRIES = [
  { code: 'USA', name: 'United States', color: '#326CE5' },
  { code: 'CHN', name: 'China', color: '#FF6B6B' },
  { code: 'IND', name: 'India', color: '#FFD93D' },
  { code: 'RUS', name: 'Russia', color: '#F38181' },
  { code: 'JPN', name: 'Japan', color: '#4ECDC4' },
  { code: 'DEU', name: 'Germany', color: '#95E1D3' },
  { code: 'GBR', name: 'United Kingdom', color: '#AA96DA' },
  { code: 'FRA', name: 'France', color: '#FCBAD3' },
];

const METRICS = [
  { key: 'co2', label: 'Total CO₂', unit: 'Mt', icon: <Co2Icon /> },
  { key: 'co2_per_capita', label: 'CO₂ per Capita', unit: 't/person', icon: <PeopleIcon /> },
  { key: 'cumulative_co2', label: 'Cumulative CO₂', unit: 'Mt', icon: <TrendingUpIcon /> },
];

export default function CO2DataDemo({ isOpen, onClose }: CO2DataDemoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [globalData, setGlobalData] = useState<any[]>([]);
  const [topEmittersData, setTopEmittersData] = useState<any>({});
  const [countriesData, setCountriesData] = useState<Map<string, any>>(new Map());

  // Interactive states
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(200);
  const [visibleCountries, setVisibleCountries] = useState<Set<string>>(
    new Set(MAJOR_COUNTRIES.slice(0, 4).map(c => c.code)) // Start with 4 countries
  );
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountryForDetail, setSelectedCountryForDetail] = useState<string | null>(null);
  const [comparisonMetrics, setComparisonMetrics] = useState<Set<MetricType>>(new Set<MetricType>(['co2', 'co2_per_capita']));

  const playbackInterval = useRef<NodeJS.Timeout | null>(null);
  const minYear = 1950;
  const maxYear = 2023;

  useEffect(() => {
    if (isOpen && globalData.length === 0) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isPlaying) {
      playbackInterval.current = setInterval(() => {
        setSelectedYear(year => {
          if (year >= maxYear) {
            setIsPlaying(false);
            return maxYear;
          }
          return year + 1;
        });
      }, playbackSpeed);
    } else {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    }

    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [globalRes, topRes] = await Promise.all([
        fetch('/api/co2-aggregated?view=global'),
        fetch('/api/co2-aggregated?view=top'),
      ]);

      const [globalJson, topJson] = await Promise.all([
        globalRes.json(),
        topRes.json(),
      ]);

      setGlobalData(globalJson.data);
      setTopEmittersData(topJson.data);

      const countryPromises = MAJOR_COUNTRIES.map(c =>
        fetch(`/api/co2-aggregated?view=country&country=${c.code}`).then(r => r.json())
      );

      const countryResults = await Promise.all(countryPromises);
      const countryMap = new Map();
      countryResults.forEach((result, idx) => {
        if (result.success) {
          countryMap.set(MAJOR_COUNTRIES[idx].code, result.data);
        }
      });

      setCountriesData(countryMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCountry = (countryCode: string) => {
    setVisibleCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryCode)) {
        if (newSet.size > 1) { // Keep at least one country
          newSet.delete(countryCode);
        }
      } else {
        newSet.add(countryCode);
      }
      return newSet;
    });
  };

  const toggleMetric = (metric: MetricType) => {
    setComparisonMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(metric)) {
        if (newSet.size > 1) {
          newSet.delete(metric);
        }
      } else {
        newSet.add(metric);
      }
      return newSet;
    });
  };

  const handlePlay = () => {
    if (selectedYear >= maxYear) {
      setSelectedYear(minYear);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setSelectedYear(minYear);
  };

  const handleCountryClick = (countryCode: string) => {
    setSelectedCountryForDetail(countryCode);
    setViewMode('country-detail');
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedCountryForDetail(null);
  };

  // Prepare timeline data
  const timelineData = globalData
    .filter(d => d.year >= minYear && d.year <= selectedYear)
    .map(yearData => {
      const dataPoint: any = { year: yearData.year };

      MAJOR_COUNTRIES.forEach(country => {
        if (visibleCountries.has(country.code)) {
          const countryData = countriesData.get(country.code);
          if (countryData) {
            const yearRecord = countryData.data.find((d: any) => d.year === yearData.year);
            if (yearRecord) {
              dataPoint[country.code] = yearRecord.co2;
            }
          }
        }
      });

      return dataPoint;
    });

  // Comparison data with normalized scales
  const comparisonData = globalData
    .filter(d => d.year >= minYear && d.year <= selectedYear)
    .map(yearData => {
      const dataPoint: any = { year: yearData.year };

      Array.from(visibleCountries).forEach(countryCode => {
        const countryData = countriesData.get(countryCode);
        if (countryData) {
          const yearRecord = countryData.data.find((d: any) => d.year === yearData.year);
          if (yearRecord) {
            Array.from(comparisonMetrics).forEach(metric => {
              dataPoint[`${countryCode}_${metric}`] = yearRecord[metric];
            });
          }
        }
      });

      return dataPoint;
    });

  const currentTopEmitters = (topEmittersData[selectedYear] || [])
    .slice(0, 10)
    .sort((a: any, b: any) => b.co2 - a.co2);

  const currentGlobalData = globalData.find(d => d.year === selectedYear);

  // Detail view data
  const detailCountryData = selectedCountryForDetail ? countriesData.get(selectedCountryForDetail) : null;
  const detailYearData = detailCountryData?.data.find((d: any) => d.year === selectedYear);

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#0a0a0a',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Top bar: Back button left, Title right */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 1 }}>
          <MuiTooltip title="Back to Home">
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </MuiTooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PublicIcon sx={{ color: '#326CE5', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Global CO₂ Emissions Explorer
            </Typography>
          </Box>
        </Box>

        {/* Disclaimer */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
            Demo published on{' '}
            <Link href="https://bazzani.info" target="_blank" sx={{ color: '#326CE5', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              https://bazzani.info
            </Link>
            {' '}for demonstration purposes
          </Typography>
        </Box>

        {/* Description */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
            Interactive analysis of global CO₂ emissions from 1950 to 2023. Explore emission trends,
            compare countries, and analyze multiple metrics including total emissions, per capita emissions,
            and cumulative impact over time.
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
            <CircularProgress sx={{ color: '#326CE5' }} />
            <Typography sx={{ color: 'white' }}>Loading data...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
            {/* Time Control Panel */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Large Year Display - Top Right */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 24,
                  zIndex: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    display: 'block',
                    textAlign: 'right',
                  }}
                >
                  Year
                </Typography>
                <Typography
                  sx={{
                    color: '#326CE5',
                    fontSize: '4rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    textShadow: '0 0 30px rgba(50,108,229,0.5)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  key={selectedYear}
                >
                  {selectedYear}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pr: 20 }}>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!isPlaying ? (
                      <IconButton
                        onClick={handlePlay}
                        sx={{
                          bgcolor: '#326CE5',
                          color: 'white',
                          '&:hover': { bgcolor: '#2559c7', transform: 'scale(1.05)' },
                          width: 56,
                          height: 56,
                          transition: 'all 0.2s',
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 32 }} />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={handlePause}
                        sx={{
                          bgcolor: '#FF6B6B',
                          color: 'white',
                          '&:hover': { bgcolor: '#ff5252', transform: 'scale(1.05)' },
                          width: 56,
                          height: 56,
                          transition: 'all 0.2s',
                        }}
                      >
                        <PauseIcon sx={{ fontSize: 32 }} />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={handleRestart}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'scale(1.05)' },
                        width: 56,
                        height: 56,
                        transition: 'all 0.2s',
                      }}
                    >
                      <RestartAltIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }} />
                    <ToggleButtonGroup
                      value={playbackSpeed}
                      exclusive
                      onChange={(_, value) => value && setPlaybackSpeed(value)}
                      size="small"
                      sx={{ '& .MuiToggleButton-root': { color: 'white', borderColor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5 } }}
                    >
                      <ToggleButton value={400}>0.5x</ToggleButton>
                      <ToggleButton value={200}>1x</ToggleButton>
                      <ToggleButton value={100}>2x</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Slider
                    value={selectedYear}
                    onChange={(_, value) => setSelectedYear(value as number)}
                    min={minYear}
                    max={maxYear}
                    disabled={isPlaying}
                    marks={[
                      { value: 1950, label: '1950' },
                      { value: 1975, label: '1975' },
                      { value: 2000, label: '2000' },
                      { value: 2023, label: '2023' },
                    ]}
                    sx={{
                      color: '#326CE5',
                      '& .MuiSlider-thumb': {
                        width: 24,
                        height: 24,
                        '&:hover': { boxShadow: '0 0 0 10px rgba(50,108,229,0.16)' },
                      },
                      '& .MuiSlider-track': { height: 8, border: 'none' },
                      '& .MuiSlider-rail': { height: 8, opacity: 0.3 },
                      '& .MuiSlider-mark': { bgcolor: 'rgba(255,255,255,0.3)', height: 12, width: 2 },
                      '& .MuiSlider-markLabel': { color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' },
                    }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* View Mode Selector */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, value) => value && setViewMode(value)}
                sx={{ '& .MuiToggleButton-root': { color: 'white', borderColor: 'rgba(255,255,255,0.2)' } }}
              >
                <ToggleButton value="overview">
                  <PublicIcon sx={{ mr: 1 }} />
                  Overview
                </ToggleButton>
                <ToggleButton value="comparison">
                  <CompareArrowsIcon sx={{ mr: 1 }} />
                  Multi-Metric Comparison
                </ToggleButton>
                {selectedCountryForDetail && (
                  <ToggleButton value="country-detail">
                    Detail: {MAJOR_COUNTRIES.find(c => c.code === selectedCountryForDetail)?.name}
                  </ToggleButton>
                )}
              </ToggleButtonGroup>

              {viewMode !== 'overview' && (
                <Button
                  variant="outlined"
                  startIcon={<PublicIcon />}
                  onClick={handleBackToOverview}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Back to Overview
                </Button>
              )}
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Fade in={true} timeout={500}>
                  <Card sx={{ bgcolor: 'rgba(50,108,229,0.1)', border: '1px solid rgba(50,108,229,0.3)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        Global Emissions {selectedYear}
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#326CE5', fontWeight: 600 }}>
                        {currentGlobalData ? Math.round(currentGlobalData.total_co2).toLocaleString() : '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Mt CO₂
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
              <Grid item xs={12} md={3}>
                <Fade in={true} timeout={600}>
                  <Card sx={{ bgcolor: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        From Coal
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#FF6B6B', fontWeight: 600 }}>
                        {currentGlobalData ? Math.round(currentGlobalData.total_coal).toLocaleString() : '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Mt CO₂
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
              <Grid item xs={12} md={3}>
                <Fade in={true} timeout={700}>
                  <Card sx={{ bgcolor: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        From Gas
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#4ECDC4', fontWeight: 600 }}>
                        {currentGlobalData ? Math.round(currentGlobalData.total_gas).toLocaleString() : '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Mt CO₂
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
              <Grid item xs={12} md={3}>
                <Fade in={true} timeout={800}>
                  <Card sx={{ bgcolor: 'rgba(255,217,61,0.1)', border: '1px solid rgba(255,217,61,0.3)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        From Oil
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#FFD93D', fontWeight: 600 }}>
                        {currentGlobalData ? Math.round(currentGlobalData.total_oil).toLocaleString() : '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Mt CO₂
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>

            {/* Main Content based on view mode */}
            {viewMode === 'overview' && (
              <OverviewView
                timelineData={timelineData}
                currentTopEmitters={currentTopEmitters}
                visibleCountries={visibleCountries}
                hoveredCountry={hoveredCountry}
                selectedYear={selectedYear}
                onToggleCountry={toggleCountry}
                onHoverCountry={setHoveredCountry}
                onCountryClick={handleCountryClick}
              />
            )}

            {viewMode === 'comparison' && (
              <ComparisonView
                comparisonData={comparisonData}
                visibleCountries={visibleCountries}
                comparisonMetrics={comparisonMetrics}
                selectedYear={selectedYear}
                onToggleCountry={toggleCountry}
                onToggleMetric={toggleMetric}
              />
            )}

            {viewMode === 'country-detail' && detailCountryData && (
              <CountryDetailView
                countryData={detailCountryData}
                yearData={detailYearData}
                selectedYear={selectedYear}
              />
            )}

            {/* Help Text */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'rgba(50,108,229,0.1)', border: '1px solid rgba(50,108,229,0.3)' }}>
              <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
                💡 <strong>Interactive!</strong> Press Play for animation • Drag the slider • Click chips to show/hide countries • Hover to highlight • Click bars for country details
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Sub-components
interface OverviewViewProps {
  timelineData: any[];
  currentTopEmitters: any[];
  visibleCountries: Set<string>;
  hoveredCountry: string | null;
  selectedYear: number;
  onToggleCountry: (code: string) => void;
  onHoverCountry: (code: string | null) => void;
  onCountryClick: (code: string) => void;
}

function OverviewView({
  timelineData,
  currentTopEmitters,
  visibleCountries,
  hoveredCountry,
  selectedYear,
  onToggleCountry,
  onHoverCountry,
  onCountryClick,
}: OverviewViewProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            CO₂ Emissions Evolution (1950-{selectedYear})
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {MAJOR_COUNTRIES.map(country => (
              <Chip
                key={country.code}
                label={country.name}
                onClick={() => onToggleCountry(country.code)}
                onMouseEnter={() => onHoverCountry(country.code)}
                onMouseLeave={() => onHoverCountry(null)}
                sx={{
                  bgcolor: visibleCountries.has(country.code) ? country.color : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: visibleCountries.has(country.code) ? 600 : 400,
                  opacity: hoveredCountry === country.code || !hoveredCountry ? 1 : 0.4,
                  border: `2px solid ${visibleCountries.has(country.code) ? country.color : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 12px ${country.color}`,
                  },
                }}
              />
            ))}
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timelineData}>
              <defs>
                {MAJOR_COUNTRIES.map(country => (
                  <linearGradient key={country.code} id={`gradient-${country.code}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={country.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={country.color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" label={{ value: 'Mt CO₂', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.7)' } }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }}
                labelStyle={{ color: 'white' }}
                formatter={(value: number, name: string) => {
                  const country = MAJOR_COUNTRIES.find(c => c.code === name);
                  return [`${Math.round(value).toLocaleString()} Mt`, country?.name || name];
                }}
              />
              {MAJOR_COUNTRIES.map(country =>
                visibleCountries.has(country.code) ? (
                  <Area
                    key={country.code}
                    type="monotone"
                    dataKey={country.code}
                    stroke={country.color}
                    fill={`url(#gradient-${country.code})`}
                    strokeWidth={hoveredCountry === country.code ? 4 : 2}
                    opacity={hoveredCountry === country.code || !hoveredCountry ? 1 : 0.3}
                    animationDuration={300}
                  />
                ) : null
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Top 10 Emitters {selectedYear}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 2 }}>
            Click a bar to see country details
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={currentTopEmitters} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
              <YAxis dataKey="country" type="category" stroke="rgba(255,255,255,0.7)" width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }}
                labelStyle={{ color: 'white' }}
                formatter={(value: number) => `${Math.round(value).toLocaleString()} Mt`}
              />
              <Bar dataKey="co2" animationDuration={500} onClick={(data: any) => onCountryClick(data.iso_code)} cursor="pointer">
                {currentTopEmitters.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

interface ComparisonViewProps {
  comparisonData: any[];
  visibleCountries: Set<string>;
  comparisonMetrics: Set<MetricType>;
  selectedYear: number;
  onToggleCountry: (code: string) => void;
  onToggleMetric: (metric: MetricType) => void;
}

function ComparisonView({
  comparisonData,
  visibleCountries,
  comparisonMetrics,
  selectedYear,
  onToggleCountry,
  onToggleMetric,
}: ComparisonViewProps) {
  // Normalize data for comparison
  const normalizedData = comparisonData.map(dataPoint => {
    const normalized: any = { year: dataPoint.year };

    Array.from(visibleCountries).forEach(countryCode => {
      Array.from(comparisonMetrics).forEach(metric => {
        const key = `${countryCode}_${metric}`;
        const value = dataPoint[key];
        if (value !== undefined) {
          // Normalize to 0-100 scale based on max value
          const allValues = comparisonData.map(d => d[key]).filter(v => v !== undefined);
          const maxValue = Math.max(...allValues);
          normalized[key] = maxValue > 0 ? (value / maxValue) * 100 : 0;
          normalized[`${key}_raw`] = value;
        }
      });
    });

    return normalized;
  });

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Multi-Metric Comparison (Normalized Scale)
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
              Countries
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {MAJOR_COUNTRIES.map(country => (
                <Chip
                  key={country.code}
                  label={country.name}
                  onClick={() => onToggleCountry(country.code)}
                  sx={{
                    bgcolor: visibleCountries.has(country.code) ? country.color : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: `2px solid ${visibleCountries.has(country.code) ? country.color : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
              Metrics
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {METRICS.map(metric => (
                <Chip
                  key={metric.key}
                  icon={metric.icon}
                  label={metric.label}
                  onClick={() => onToggleMetric(metric.key as MetricType)}
                  sx={{
                    bgcolor: comparisonMetrics.has(metric.key as MetricType) ? '#326CE5' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: `2px solid ${comparisonMetrics.has(metric.key as MetricType) ? '#326CE5' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={normalizedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" />
            <YAxis stroke="rgba(255,255,255,0.7)" label={{ value: 'Normalized (0-100)', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.7)' } }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }}
              labelStyle={{ color: 'white' }}
              formatter={(value: number, name: string) => {
                const [countryCode, metric] = name.split('_');
                const country = MAJOR_COUNTRIES.find(c => c.code === countryCode);
                const metricInfo = METRICS.find(m => m.key === metric);
                const rawKey = `${name}_raw`;
                const rawValue = normalizedData.find(d => d.year === value)?.year;
                return [`${value.toFixed(1)}% (normalized)`, `${country?.name} - ${metricInfo?.label}`];
              }}
            />
            <Legend />
            {Array.from(visibleCountries).map((countryCode, idx) => {
              const country = MAJOR_COUNTRIES.find(c => c.code === countryCode);
              return Array.from(comparisonMetrics).map((metric, metricIdx) => {
                const key = `${countryCode}_${metric}`;
                const dashArray = metricIdx === 0 ? '0' : metricIdx === 1 ? '5 5' : '10 5';
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={country?.color || COLORS[idx]}
                    strokeWidth={2}
                    strokeDasharray={dashArray}
                    dot={false}
                    name={`${country?.name} - ${METRICS.find(m => m.key === metric)?.label}`}
                  />
                );
              });
            })}
          </ComposedChart>
        </ResponsiveContainer>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> All metrics are normalized to 0-100 scale for comparison. Different line styles represent different metrics.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}

interface CountryDetailViewProps {
  countryData: any;
  yearData: any;
  selectedYear: number;
}

function CountryDetailView({ countryData, yearData, selectedYear }: CountryDetailViewProps) {
  const filteredData = countryData.data.filter((d: any) => d.year <= selectedYear);

  return (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
        {countryData.country} - Detailed Analysis
      </Typography>

      {yearData && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(50,108,229,0.1)', border: '1px solid rgba(50,108,229,0.3)' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Total CO₂ ({selectedYear})
                </Typography>
                <Typography variant="h5" sx={{ color: '#326CE5', fontWeight: 600 }}>
                  {Math.round(yearData.co2).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Mt
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Per Capita
                </Typography>
                <Typography variant="h5" sx={{ color: '#4ECDC4', fontWeight: 600 }}>
                  {yearData.co2_per_capita.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  t/person
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255,217,61,0.1)', border: '1px solid rgba(255,217,61,0.3)' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Cumulative
                </Typography>
                <Typography variant="h5" sx={{ color: '#FFD93D', fontWeight: 600 }}>
                  {Math.round(yearData.cumulative_co2).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Mt
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Population
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  {yearData.population > 0 ? `${(yearData.population / 1000000).toFixed(1)}M` : '—'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  people
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Emissions Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }}
                  labelStyle={{ color: 'white' }}
                />
                <Legend />
                <Line type="monotone" dataKey="co2" stroke="#326CE5" strokeWidth={2} name="Total CO₂ (Mt)" />
                <Line type="monotone" dataKey="co2_per_capita" stroke="#4ECDC4" strokeWidth={2} name="Per Capita (t)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Emissions by Source
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }}
                  labelStyle={{ color: 'white' }}
                />
                <Legend />
                <Area type="monotone" dataKey="coal_co2" stackId="1" stroke="#444444" fill="#444444" name="Coal" />
                <Area type="monotone" dataKey="gas_co2" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" name="Gas" />
                <Area type="monotone" dataKey="oil_co2" stackId="1" stroke="#326CE5" fill="#326CE5" name="Oil" />
                <Area type="monotone" dataKey="cement_co2" stackId="1" stroke="#FFD93D" fill="#FFD93D" name="Cement" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
