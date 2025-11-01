'use client';

import { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
  ReactFlowInstance,
  Handle,
  Position,
  NodeProps,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Button,
  Stack,
  Snackbar,
  Alert,
  Paper,
  Typography,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Grid from '@mui/material/Grid2';
import DownloadIcon from '@mui/icons-material/Download';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import HexagonOutlinedIcon from '@mui/icons-material/HexagonOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CropPortraitIcon from '@mui/icons-material/CropPortrait';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AssistantPanel from './AssistantPanel';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: {
      label: 'Start',
      shape: 'rectangle',
      width: 120,
      height: 60,
      bgColor: '#42a5f5',
      textColor: '#ffffff',
      fontSize: 14,
      fontFamily: 'Arial'
    },
    position: { x: 250, y: 50 },
  },
];

const initialEdges: Edge[] = [];

let nodeIdCounter = 2;

type NodeShape = 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'star' | 'pentagon' | 'triangle' | 'parallelogram' | 'trapezoid' | 'arrow';

// Custom node component with handles on all 4 sides
function CustomNode({ data }: NodeProps) {
  const shape = data.shape || 'rectangle';
  const width = data.width || 120;
  const height = data.height || 60;
  const bgColor = data.bgColor || '#42a5f5';
  const textColor = data.textColor || '#ffffff';
  const fontSize = data.fontSize || 14;
  const fontFamily = data.fontFamily || 'Arial';

  const shapeStyles: Record<NodeShape, any> = {
    rectangle: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      borderRadius: '8px',
      padding: '10px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    circle: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      borderRadius: '50%',
      padding: '20px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    diamond: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      padding: '15px 25px',
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    hexagon: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      padding: '20px 30px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    star: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      padding: '20px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    pentagon: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      padding: '20px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    triangle: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      padding: '20px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    parallelogram: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
      padding: '15px 25px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    trapezoid: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
      padding: '15px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
    arrow: {
      background: bgColor,
      color: textColor,
      border: `2px solid ${bgColor}`,
      clipPath: 'polygon(0% 30%, 70% 30%, 70% 0%, 100% 50%, 70% 100%, 70% 70%, 0% 70%)',
      padding: '15px 25px',
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
    },
  };

  return (
    <div style={{ ...shapeStyles[shape as NodeShape], fontWeight: 'bold', position: 'relative' }}>
      {/* Handles on all 4 sides with unique IDs */}
      <Handle type="target" position={Position.Top} id="target-top" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Top} id="source-top" style={{ background: '#555' }} />
      <Handle type="target" position={Position.Right} id="target-right" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ background: '#555' }} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ background: '#555' }} />
      <Handle type="target" position={Position.Left} id="target-left" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Left} id="source-left" style={{ background: '#555' }} />

      {data.label}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

const primaryShapes = [
  { type: 'rectangle', label: 'Rectangle', icon: CropSquareIcon, color: '#42a5f5' },
  { type: 'circle', label: 'Circle', icon: CircleOutlinedIcon, color: '#66bb6a' },
  { type: 'diamond', label: 'Diamond', icon: ChangeHistoryIcon, color: '#ffa726' },
  { type: 'hexagon', label: 'Hexagon', icon: HexagonOutlinedIcon, color: '#ab47bc' },
];

const additionalShapes = [
  { type: 'star', label: 'Star', icon: StarOutlineIcon, color: '#ffeb3b' },
  { type: 'pentagon', label: 'Pentagon', icon: PentagonOutlinedIcon, color: '#ff9800' },
  { type: 'triangle', label: 'Triangle', icon: ChangeHistoryIcon, color: '#4caf50' },
  { type: 'parallelogram', label: 'Parallelogram', icon: CropPortraitIcon, color: '#03a9f4' },
  { type: 'trapezoid', label: 'Trapezoid', icon: CropPortraitIcon, color: '#9c27b0' },
  { type: 'arrow', label: 'Arrow', icon: ArrowForwardIcon, color: '#f44336' },
];

const allShapes = [...primaryShapes, ...additionalShapes];

const colorPalette = [
  { name: 'Blue', value: '#42a5f5' },
  { name: 'Green', value: '#66bb6a' },
  { name: 'Orange', value: '#ffa726' },
  { name: 'Purple', value: '#ab47bc' },
  { name: 'Red', value: '#ef5350' },
  { name: 'Teal', value: '#26a69a' },
  { name: 'Pink', value: '#ec407a' },
  { name: 'Indigo', value: '#5c6bc0' },
  { name: 'Yellow', value: '#ffee58' },
  { name: 'Cyan', value: '#26c6da' },
  { name: 'Gray', value: '#78909c' },
  { name: 'Brown', value: '#8d6e63' },
];

const textColorPalette = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Light Gray', value: '#e0e0e0' },
  { name: 'Dark Gray', value: '#424242' },
];

const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Roboto', 'Open Sans'];

export default function FlowchartBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showPreview, setShowPreview] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Temporary state for editing
  const [tempLabel, setTempLabel] = useState<string>('');
  const [tempWidth, setTempWidth] = useState<string>('');
  const [tempHeight, setTempHeight] = useState<string>('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingWidth, setIsEditingWidth] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [shapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      // Remove any existing connection between the same two nodes (in either direction)
      setEdges((eds) => {
        const filtered = eds.filter(
          (edge) =>
            !(
              (edge.source === params.source && edge.target === params.target) ||
              (edge.source === params.target && edge.target === params.source)
            )
        );

        const newEdge = {
          ...params,
          type: 'straight', // Use straight edges to match PPT export
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#666',
          },
          style: { stroke: '#666', strokeWidth: 2 },
        };

        return addEdge(newEdge, filtered);
      });
      setSnackbar({ open: true, message: 'Connection created', severity: 'success' });
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedNodes([node]);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedNodes([]);
  }, []);

  const onSelectionChange = useCallback((params: { nodes: Node[] }) => {
    if (params.nodes.length > 0) {
      setSelectedNodes(params.nodes);
      setSelectedNode(params.nodes[0]); // Use first node for single-node panel
    } else {
      setSelectedNodes([]);
      setSelectedNode(null);
    }
  }, []);

  const onDragStart = (event: React.DragEvent, nodeType: NodeShape) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow') as NodeShape;

      // Get the bounds of the ReactFlow wrapper
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Convert screen position to ReactFlow position using project()
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${nodeIdCounter++}`,
        type: 'custom',
        data: {
          label: `Node ${nodeIdCounter - 1}`,
          shape: type,
          width: 120,
          height: 60,
          bgColor: '#42a5f5',
          textColor: '#ffffff',
          fontSize: 14,
          fontFamily: 'Arial'
        },
        position,
      };

      setNodes((nds) => nds.concat(newNode));
      setSnackbar({ open: true, message: `${type} node added`, severity: 'success' });
    },
    [reactFlowInstance, setNodes]
  );

  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, label: newLabel },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const updateNodeShape = useCallback((nodeId: string, newShape: NodeShape) => {
    // If multiple nodes selected, update all of them
    const nodeIds = selectedNodes.length > 1 ? selectedNodes.map(n => n.id) : [nodeId];

    setNodes((nds) =>
      nds.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            data: { ...node.data, shape: newShape },
          };
        }
        return node;
      })
    );
    // Update selected nodes
    setSelectedNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...node.data, shape: newShape },
      }))
    );
    setSelectedNode((current) => {
      if (current && nodeIds.includes(current.id)) {
        return {
          ...current,
          data: { ...current.data, shape: newShape },
        };
      }
      return current;
    });
  }, [setNodes, selectedNodes]);

  const updateNodeSize = useCallback((nodeId: string, width: number, height: number) => {
    // If multiple nodes selected, update all of them
    const nodeIds = selectedNodes.length > 1 ? selectedNodes.map(n => n.id) : [nodeId];

    setNodes((nds) =>
      nds.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            data: { ...node.data, width, height },
          };
        }
        return node;
      })
    );
    // Update selected nodes
    setSelectedNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...node.data, width, height },
      }))
    );
    // Update selected node
    setSelectedNode((current) => {
      if (current && nodeIds.includes(current.id)) {
        return {
          ...current,
          data: { ...current.data, width, height },
        };
      }
      return current;
    });
  }, [setNodes, selectedNodes]);

  const updateNodeColors = useCallback((nodeId: string, bgColor: string, textColor: string) => {
    // If multiple nodes selected, update all of them
    const nodeIds = selectedNodes.length > 1 ? selectedNodes.map(n => n.id) : [nodeId];

    setNodes((nds) =>
      nds.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            data: { ...node.data, bgColor, textColor },
          };
        }
        return node;
      })
    );
    // Update selected nodes
    setSelectedNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...node.data, bgColor, textColor },
      }))
    );
    setSelectedNode((current) => {
      if (current && nodeIds.includes(current.id)) {
        return {
          ...current,
          data: { ...current.data, bgColor, textColor },
        };
      }
      return current;
    });
  }, [setNodes, selectedNodes]);

  const updateNodeFont = useCallback((nodeId: string, fontSize: number, fontFamily: string) => {
    // If multiple nodes selected, update all of them
    const nodeIds = selectedNodes.length > 1 ? selectedNodes.map(n => n.id) : [nodeId];

    setNodes((nds) =>
      nds.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            data: { ...node.data, fontSize, fontFamily },
          };
        }
        return node;
      })
    );
    // Update selected nodes
    setSelectedNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...node.data, fontSize, fontFamily },
      }))
    );
    setSelectedNode((current) => {
      if (current && nodeIds.includes(current.id)) {
        return {
          ...current,
          data: { ...current.data, fontSize, fontFamily },
        };
      }
      return current;
    });
  }, [setNodes, selectedNodes]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNodes.length > 0) {
      const nodeIds = selectedNodes.map(n => n.id);
      setNodes((nds) => nds.filter((node) => !nodeIds.includes(node.id)));
      setEdges((eds) => eds.filter((edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)));
      setSelectedNode(null);
      setSelectedNodes([]);
      setSnackbar({ open: true, message: `${nodeIds.length} node(s) deleted`, severity: 'success' });
    }
  }, [selectedNodes, setNodes, setEdges]);

  const exportDiagram = useCallback(() => {
    const diagramData = {
      nodes: nodes.map((node) => ({
        id: node.id,
        label: node.data.label,
        position: node.position,
        type: node.type,
        shape: node.data.shape || 'rectangle',
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    const dataStr = JSON.stringify(diagramData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `flowchart-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setSnackbar({ open: true, message: 'Diagram exported successfully', severity: 'success' });
  }, [nodes, edges]);

  const generatePPT = useCallback(async () => {
    try {
      setSnackbar({ open: true, message: 'Generating PowerPoint...', severity: 'success' });

      const diagramData = {
        nodes: nodes.map((node) => ({
          id: node.id,
          label: node.data.label,
          position: node.position,
          shape: node.data.shape || 'rectangle',
          width: node.data.width || 120,
          height: node.data.height || 60,
          bgColor: node.data.bgColor || '#42a5f5',
          textColor: node.data.textColor || '#ffffff',
          fontSize: node.data.fontSize || 14,
          fontFamily: node.data.fontFamily || 'Arial',
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      };

      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagramData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PowerPoint');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `flowchart-${Date.now()}.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({ open: true, message: 'PowerPoint generated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error generating PPT:', error);
      setSnackbar({ open: true, message: 'Failed to generate PowerPoint', severity: 'error' });
    }
  }, [nodes, edges]);

  const resetDiagram = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNode(null);
    nodeIdCounter = 2;
    setSnackbar({ open: true, message: 'Diagram reset', severity: 'success' });
  }, [setNodes, setEdges]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Compact PowerPoint-Style Toolbar */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 1,
          py: 0.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          bgcolor: '#fafafa',
          flexShrink: 0
        }}
      >
        {/* Shapes Section */}
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', pr: 1, borderRight: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
            Shapes:
          </Typography>
          {primaryShapes.map((shape) => {
            const IconComponent = shape.icon;
            return (
              <Tooltip key={shape.type} title={`Drag to canvas to add ${shape.label}`}>
                <Paper
                  draggable
                  onDragStart={(e) => onDragStart(e, shape.type as NodeShape)}
                  elevation={0}
                  sx={{
                    p: 0.5,
                    cursor: 'grab',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white',
                    minWidth: '32px',
                    minHeight: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      borderColor: shape.color,
                      bgcolor: `${shape.color}15`,
                    },
                    '&:active': {
                      cursor: 'grabbing',
                    },
                  }}
                >
                  <IconComponent sx={{ fontSize: 20, color: shape.color }} />
                </Paper>
              </Tooltip>
            );
          })}
        </Box>

        {/* Stats - Compact */}
        <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary' }}>
          {nodes.length} nodes • {edges.length} edges
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Action Buttons - Compact Icons */}
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={showPreview ? 'Hide Preview' : 'Show Preview'}>
            <Button
              variant={showPreview ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setShowPreview(!showPreview)}
              sx={{ minWidth: '32px', p: 0.5 }}
            >
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </Button>
          </Tooltip>
          <Tooltip title="AI Assistant">
            <Button
              variant="contained"
              size="small"
              onClick={() => setAssistantOpen(true)}
              sx={{
                minWidth: '32px',
                p: 0.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                },
              }}
            >
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Button>
          </Tooltip>
          <Tooltip title="Export JSON">
            <Button
              variant="outlined"
              size="small"
              onClick={exportDiagram}
              sx={{ minWidth: '32px', p: 0.5 }}
            >
              <DownloadIcon sx={{ fontSize: 18 }} />
            </Button>
          </Tooltip>
          <Tooltip title="Generate PowerPoint">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={generatePPT}
              sx={{ px: 1.5, py: 0.5, fontSize: '12px' }}
            >
              <SlideshowIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Export PPT
            </Button>
          </Tooltip>
          <Tooltip title="Reset Diagram">
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={resetDiagram}
              sx={{ minWidth: '32px', p: 0.5 }}
            >
              <RestartAltIcon sx={{ fontSize: 18 }} />
            </Button>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Main Content Area */}
      <Grid container spacing={0} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Canvas */}
        <Grid size={{ xs: 12, md: selectedNode ? 9 : 12 }} sx={{ height: '100%' }}>
          <Box sx={{ height: '100%', position: 'relative', borderRight: selectedNode ? '1px solid' : 'none', borderColor: 'divider' }}>
            <div ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver} style={{ width: '100%', height: '100%' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onSelectionChange={onSelectionChange}
                onInit={setReactFlowInstance}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                minZoom={0.25}
                maxZoom={4}
                attributionPosition="bottom-right"
                connectionMode={ConnectionMode.Loose}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                panOnDrag={[1, 2]}
                selectionOnDrag={true}
                panOnScroll={false}
                zoomOnScroll={false}
                zoomOnPinch={true}
                zoomOnDoubleClick={false}
              >
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    return node.data?.bgColor || '#42a5f5';
                  }}
                />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              </ReactFlow>
            </div>

            {/* Preview Overlay */}
            {showPreview && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  p: 2,
                  maxWidth: 280,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  PowerPoint Preview
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Slide: 10" × 7.5" (16:9)
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: 'text.secondary',
                    textAlign: 'center',
                    p: 1,
                  }}
                >
                  Diagram auto-scaled
                  <br />
                  and centered
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Configuration Panel */}
        {selectedNode && (
          <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
            <Paper elevation={0} sx={{ p: 2, height: '100%', overflow: 'auto', bgcolor: '#fafafa' }}>
              <Typography variant="overline" sx={{ display: 'block', mb: 1, fontWeight: 700, fontSize: '11px', color: 'text.secondary' }}>
                {selectedNodes.length > 1 ? `${selectedNodes.length} Nodes Selected` : 'Node Properties'}
              </Typography>

              <Stack spacing={1.5}>
                {selectedNodes.length === 1 && (
                  <TextField
                    label="Text"
                    fullWidth
                    value={isEditingLabel ? tempLabel : (selectedNode.data.label || '')}
                    onChange={(e) => {
                      setTempLabel(e.target.value);
                    }}
                    onFocus={() => {
                      setIsEditingLabel(true);
                      setTempLabel(selectedNode.data.label || '');
                    }}
                    onBlur={() => {
                      updateNodeLabel(selectedNode.id, tempLabel);
                      setIsEditingLabel(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateNodeLabel(selectedNode.id, tempLabel);
                        setIsEditingLabel(false);
                        (e.target as HTMLInputElement).blur();
                      } else if (e.key === 'Escape') {
                        setTempLabel(selectedNode.data.label || '');
                        setIsEditingLabel(false);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    size="small"
                    variant="outlined"
                  />
                )}

                {selectedNodes.length > 1 && (
                  <Paper sx={{ p: 1.5, bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main' }}>
                    <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 600 }}>
                      Bulk editing {selectedNodes.length} nodes. Changes apply to all selected.
                    </Typography>
                  </Paper>
                )}

                {selectedNodes.length === 1 && (
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel>Shape</InputLabel>
                      <Select
                        value={selectedNode.data.shape || 'rectangle'}
                        label="Shape"
                        onChange={(e) => updateNodeShape(selectedNode.id, e.target.value as NodeShape)}
                      >
                        {primaryShapes.map((shape) => {
                          const IconComponent = shape.icon;
                          return (
                            <MenuItem key={shape.type} value={shape.type}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconComponent sx={{ color: shape.color }} />
                                {shape.label}
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <Button
                      size="small"
                      onClick={() => setShapeDialogOpen(true)}
                      startIcon={<MoreHorizIcon />}
                      sx={{ mt: 0.5, fontSize: '11px', textTransform: 'none' }}
                      fullWidth
                    >
                      More shapes
                    </Button>
                  </Box>
                )}

                {/* Width/Height - show for both single and multiple */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Width"
                    type="number"
                    fullWidth
                    value={isEditingWidth ? tempWidth : (selectedNode.data.width || 120)}
                    onChange={(e) => {
                      setTempWidth(e.target.value);
                    }}
                    onFocus={() => {
                      setIsEditingWidth(true);
                      setTempWidth(String(selectedNode.data.width || 120));
                    }}
                    onBlur={() => {
                      const newWidth = parseInt(tempWidth) || 120;
                      updateNodeSize(selectedNode.id, newWidth, selectedNode.data.height || 60);
                      setIsEditingWidth(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const newWidth = parseInt(tempWidth) || 120;
                        updateNodeSize(selectedNode.id, newWidth, selectedNode.data.height || 60);
                        setIsEditingWidth(false);
                        (e.target as HTMLInputElement).blur();
                      } else if (e.key === 'Escape') {
                        setTempWidth(String(selectedNode.data.width || 120));
                        setIsEditingWidth(false);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    size="small"
                    slotProps={{ htmlInput: { min: 40, max: 500, step: 10 } }}
                  />
                  <TextField
                    label="Height"
                    type="number"
                    fullWidth
                    value={isEditingHeight ? tempHeight : (selectedNode.data.height || 60)}
                    onChange={(e) => {
                      setTempHeight(e.target.value);
                    }}
                    onFocus={() => {
                      setIsEditingHeight(true);
                      setTempHeight(String(selectedNode.data.height || 60));
                    }}
                    onBlur={() => {
                      const newHeight = parseInt(tempHeight) || 60;
                      updateNodeSize(selectedNode.id, selectedNode.data.width || 120, newHeight);
                      setIsEditingHeight(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const newHeight = parseInt(tempHeight) || 60;
                        updateNodeSize(selectedNode.id, selectedNode.data.width || 120, newHeight);
                        setIsEditingHeight(false);
                        (e.target as HTMLInputElement).blur();
                      } else if (e.key === 'Escape') {
                        setTempHeight(String(selectedNode.data.height || 60));
                        setIsEditingHeight(false);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    size="small"
                    slotProps={{ htmlInput: { min: 40, max: 500, step: 10 } }}
                  />
                </Box>

                {/* Background Color */}
                <FormControl fullWidth size="small">
                  <InputLabel>Background Color</InputLabel>
                  <Select
                    value={selectedNode.data.bgColor || '#42a5f5'}
                    label="Background Color"
                    onChange={(e) => updateNodeColors(selectedNode.id, e.target.value, selectedNode.data.textColor || '#ffffff')}
                  >
                    {colorPalette.map((color) => (
                      <MenuItem key={color.value} value={color.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 20, height: 20, bgcolor: color.value, border: '1px solid #ccc', borderRadius: '4px' }} />
                          {color.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Text Color */}
                <FormControl fullWidth size="small">
                  <InputLabel>Text Color</InputLabel>
                  <Select
                    value={selectedNode.data.textColor || '#ffffff'}
                    label="Text Color"
                    onChange={(e) => updateNodeColors(selectedNode.id, selectedNode.data.bgColor || '#42a5f5', e.target.value)}
                  >
                    {textColorPalette.map((color) => (
                      <MenuItem key={color.value} value={color.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 20, height: 20, bgcolor: color.value, border: '1px solid #ccc', borderRadius: '4px' }} />
                          {color.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Font Family */}
                <FormControl fullWidth size="small">
                  <InputLabel>Font</InputLabel>
                  <Select
                    value={selectedNode.data.fontFamily || 'Arial'}
                    label="Font"
                    onChange={(e) => updateNodeFont(selectedNode.id, selectedNode.data.fontSize || 14, e.target.value)}
                  >
                    {fontFamilies.map((font) => (
                      <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                        {font}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Font Size */}
                <TextField
                  label="Font Size"
                  type="number"
                  fullWidth
                  value={selectedNode.data.fontSize || 14}
                  onChange={(e) => updateNodeFont(selectedNode.id, parseInt(e.target.value) || 14, selectedNode.data.fontFamily || 'Arial')}
                  size="small"
                  slotProps={{ htmlInput: { min: 8, max: 48, step: 2 } }}
                />

                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '10px', color: 'text.disabled', mb: 0.5 }}>
                    ID: {selectedNode.id} | X: {Math.round(selectedNode.position.x)} | Y: {Math.round(selectedNode.position.y)}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={deleteSelectedNode}
                  fullWidth
                >
                  {selectedNodes.length > 1 ? `Delete ${selectedNodes.length} Nodes` : 'Delete Node'}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Shape Picker Dialog */}
      <Dialog
        open={shapeDialogOpen}
        onClose={() => setShapeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
            All Shapes
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setShapeDialogOpen(false)}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1.5}>
            {allShapes.map((shape) => {
              const IconComponent = shape.icon;
              const isSelected = selectedNode?.data.shape === shape.type;
              return (
                <Grid key={shape.type} size={{ xs: 6, sm: 4 }}>
                  <Paper
                    elevation={isSelected ? 4 : 1}
                    onClick={() => {
                      if (selectedNode) {
                        updateNodeShape(selectedNode.id, shape.type as NodeShape);
                        setShapeDialogOpen(false);
                      }
                    }}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: isSelected ? shape.color : 'transparent',
                      bgcolor: isSelected ? `${shape.color}15` : 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: shape.color,
                        bgcolor: `${shape.color}10`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <IconComponent sx={{ fontSize: 40, color: shape.color, mb: 1 }} />
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: isSelected ? 600 : 400 }}>
                      {shape.label}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Panel */}
      <AssistantPanel
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        nodes={nodes}
        edges={edges}
      />
    </Box>
  );
}
