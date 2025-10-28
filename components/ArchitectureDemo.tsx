'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, IconButton, Typography, Tooltip, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useRouter } from 'next/navigation';
import K8sNode from './K8sNode';
import ComponentPalette from './ComponentPalette';

// Enterprise Web Application Architecture - Left to Right Flow
const initialNodes: Node[] = [
  // Layer 1: Client (Left)
  {
    id: 'client-web',
    type: 'k8sNode',
    data: { label: 'Web Browser', icon: 'ns', type: 'Client' },
    position: { x: 50, y: 250 },
  },
  {
    id: 'client-mobile',
    type: 'k8sNode',
    data: { label: 'Mobile App', icon: 'ns', type: 'Client' },
    position: { x: 50, y: 400 },
  },

  // Layer 2: Firewall & Security
  {
    id: 'firewall',
    type: 'k8sNode',
    data: { label: 'WAF / Firewall', icon: 'ns', type: 'Security' },
    position: { x: 250, y: 325 },
  },

  // Layer 3: Ingress
  {
    id: 'ingress-nginx',
    type: 'k8sNode',
    data: { label: 'NGINX Ingress', icon: 'ing', type: 'Ingress' },
    position: { x: 450, y: 325 },
  },

  // Layer 4: Frontend Services
  {
    id: 'frontend-svc-1',
    type: 'k8sNode',
    data: { label: 'Web App Service', icon: 'svc', type: 'Service' },
    position: { x: 650, y: 200 },
  },
  {
    id: 'frontend-deploy-1',
    type: 'k8sNode',
    data: { label: 'React SPA', icon: 'deploy', type: 'Deployment', replicas: 3 },
    position: { x: 850, y: 200 },
  },
  {
    id: 'frontend-svc-2',
    type: 'k8sNode',
    data: { label: 'Admin Portal', icon: 'svc', type: 'Service' },
    position: { x: 650, y: 400 },
  },
  {
    id: 'frontend-deploy-2',
    type: 'k8sNode',
    data: { label: 'Admin Dashboard', icon: 'deploy', type: 'Deployment', replicas: 2 },
    position: { x: 850, y: 400 },
  },

  // Layer 5: Backend Services
  {
    id: 'backend-svc-api',
    type: 'k8sNode',
    data: { label: 'REST API', icon: 'svc', type: 'Service' },
    position: { x: 1050, y: 150 },
  },
  {
    id: 'backend-deploy-api',
    type: 'k8sNode',
    data: { label: 'Node.js API', icon: 'deploy', type: 'Deployment', replicas: 5 },
    position: { x: 1250, y: 150 },
  },
  {
    id: 'backend-svc-auth',
    type: 'k8sNode',
    data: { label: 'Auth Service', icon: 'svc', type: 'Service' },
    position: { x: 1050, y: 300 },
  },
  {
    id: 'backend-deploy-auth',
    type: 'k8sNode',
    data: { label: 'Auth Server', icon: 'deploy', type: 'Deployment', replicas: 3 },
    position: { x: 1250, y: 300 },
  },
  {
    id: 'backend-svc-worker',
    type: 'k8sNode',
    data: { label: 'Worker Service', icon: 'svc', type: 'Service' },
    position: { x: 1050, y: 450 },
  },
  {
    id: 'backend-deploy-worker',
    type: 'k8sNode',
    data: { label: 'Background Worker', icon: 'deploy', type: 'Deployment', replicas: 2 },
    position: { x: 1250, y: 450 },
  },

  // Layer 6: Database & Cache
  {
    id: 'db-svc',
    type: 'k8sNode',
    data: { label: 'Database Service', icon: 'svc', type: 'Headless' },
    position: { x: 1450, y: 200 },
  },
  {
    id: 'db-statefulset',
    type: 'k8sNode',
    data: { label: 'PostgreSQL', icon: 'sts', type: 'StatefulSet', replicas: 3 },
    position: { x: 1650, y: 200 },
  },
  {
    id: 'db-pv',
    type: 'k8sNode',
    data: { label: 'Persistent Storage', icon: 'pv', type: 'PV' },
    position: { x: 1850, y: 200 },
  },
  {
    id: 'redis-svc',
    type: 'k8sNode',
    data: { label: 'Cache Service', icon: 'svc', type: 'Service' },
    position: { x: 1450, y: 350 },
  },
  {
    id: 'redis-deploy',
    type: 'k8sNode',
    data: { label: 'Redis Cache', icon: 'deploy', type: 'Deployment', replicas: 2 },
    position: { x: 1650, y: 350 },
  },

  // Layer 7: Legacy Systems
  {
    id: 'legacy-svc',
    type: 'k8sNode',
    data: { label: 'Legacy Adapter', icon: 'svc', type: 'Service' },
    position: { x: 1450, y: 500 },
  },
  {
    id: 'legacy-system',
    type: 'k8sNode',
    data: { label: 'Legacy System', icon: 'job', type: 'External' },
    position: { x: 1650, y: 500 },
  },

  // CronJobs (bottom)
  {
    id: 'cronjob-reports',
    type: 'k8sNode',
    data: { label: 'Daily Reports', icon: 'cronjob', type: 'CronJob' },
    position: { x: 1050, y: 600 },
  },
  {
    id: 'cronjob-cleanup',
    type: 'k8sNode',
    data: { label: 'Data Cleanup', icon: 'cronjob', type: 'CronJob' },
    position: { x: 1250, y: 600 },
  },
];

const initialEdges: Edge[] = [
  // Client to Firewall
  { id: 'e1', source: 'client-web', target: 'firewall', animated: true, style: { stroke: '#3498db', strokeWidth: 2 } },
  { id: 'e2', source: 'client-mobile', target: 'firewall', animated: true, style: { stroke: '#3498db', strokeWidth: 2 } },

  // Firewall to Ingress
  { id: 'e3', source: 'firewall', target: 'ingress-nginx', animated: true, style: { stroke: '#e74c3c', strokeWidth: 3 } },

  // Ingress to Frontend Services
  { id: 'e4', source: 'ingress-nginx', target: 'frontend-svc-1', animated: true, style: { stroke: '#326CE5', strokeWidth: 2 } },
  { id: 'e5', source: 'ingress-nginx', target: 'frontend-svc-2', animated: true, style: { stroke: '#326CE5', strokeWidth: 2 } },

  // Frontend Services to Deployments
  { id: 'e6', source: 'frontend-svc-1', target: 'frontend-deploy-1', style: { stroke: '#13AA52', strokeWidth: 2 } },
  { id: 'e7', source: 'frontend-svc-2', target: 'frontend-deploy-2', style: { stroke: '#13AA52', strokeWidth: 2 } },

  // Frontend to Backend APIs
  { id: 'e8', source: 'frontend-deploy-1', target: 'backend-svc-api', animated: true, style: { stroke: '#61DAFB', strokeWidth: 2 } },
  { id: 'e9', source: 'frontend-deploy-1', target: 'backend-svc-auth', animated: true, style: { stroke: '#61DAFB', strokeWidth: 2 } },
  { id: 'e10', source: 'frontend-deploy-2', target: 'backend-svc-api', animated: true, style: { stroke: '#9b59b6', strokeWidth: 2 } },
  { id: 'e11', source: 'frontend-deploy-2', target: 'backend-svc-auth', animated: true, style: { stroke: '#9b59b6', strokeWidth: 2 } },

  // Backend Services to Deployments
  { id: 'e12', source: 'backend-svc-api', target: 'backend-deploy-api', style: { stroke: '#13AA52', strokeWidth: 2 } },
  { id: 'e13', source: 'backend-svc-auth', target: 'backend-deploy-auth', style: { stroke: '#13AA52', strokeWidth: 2 } },
  { id: 'e14', source: 'backend-svc-worker', target: 'backend-deploy-worker', style: { stroke: '#13AA52', strokeWidth: 2 } },

  // Backend to Database
  { id: 'e15', source: 'backend-deploy-api', target: 'db-svc', animated: true, style: { stroke: '#68A063', strokeWidth: 2 } },
  { id: 'e16', source: 'backend-deploy-auth', target: 'db-svc', animated: true, style: { stroke: '#68A063', strokeWidth: 2 } },
  { id: 'e17', source: 'backend-deploy-worker', target: 'db-svc', animated: true, style: { stroke: '#68A063', strokeWidth: 2 } },

  // Backend to Cache
  { id: 'e18', source: 'backend-deploy-api', target: 'redis-svc', animated: true, style: { stroke: '#DC382D', strokeWidth: 2 } },
  { id: 'e19', source: 'backend-deploy-auth', target: 'redis-svc', animated: true, style: { stroke: '#DC382D', strokeWidth: 2 } },

  // Database Service to StatefulSet
  { id: 'e20', source: 'db-svc', target: 'db-statefulset', style: { stroke: '#13AA52', strokeWidth: 2 } },
  { id: 'e21', source: 'db-statefulset', target: 'db-pv', style: { stroke: '#336791', strokeWidth: 2 } },

  // Redis Service to Deployment
  { id: 'e22', source: 'redis-svc', target: 'redis-deploy', style: { stroke: '#13AA52', strokeWidth: 2 } },

  // Backend to Legacy Systems
  { id: 'e23', source: 'backend-deploy-api', target: 'legacy-svc', animated: true, style: { stroke: '#95a5a6', strokeWidth: 2, strokeDasharray: '5,5' } },
  { id: 'e24', source: 'legacy-svc', target: 'legacy-system', style: { stroke: '#7f8c8d', strokeWidth: 2 } },

  // CronJobs to Backend Services
  { id: 'e25', source: 'cronjob-reports', target: 'backend-svc-worker', style: { stroke: '#FF9900', strokeWidth: 2, strokeDasharray: '5,5' } },
  { id: 'e26', source: 'cronjob-cleanup', target: 'backend-svc-worker', style: { stroke: '#FF9900', strokeWidth: 2, strokeDasharray: '5,5' } },
];

interface ArchitectureDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchitectureDemo({ isOpen, onClose }: ArchitectureDemoProps) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(() => ({ k8sNode: K8sNode }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataString = event.dataTransfer.getData('application/reactflow');

      if (!dataString) return;

      const nodeData = JSON.parse(dataString);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: nodeData.type,
        position,
        data: nodeData.data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <>
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: '#0a0a0a',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ borderBottom: '1px solid #333' }}>
            {/* Top bar: Back button left, Title right */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                pb: 1,
              }}
            >
              <Tooltip title="Back to Home">
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
              </Tooltip>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AccountTreeIcon sx={{ color: '#326CE5', fontSize: 28 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Kubernetes Architecture Builder
                </Typography>
              </Box>
            </Box>

            {/* Disclaimer */}
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                Demo published on{' '}
                <Link
                  href="https://bazzani.info"
                  target="_blank"
                  sx={{ color: '#326CE5', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  https://bazzani.info
                </Link>
                {' '}for demonstration purposes
              </Typography>
            </Box>

            {/* Description */}
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                Interactive drag-and-drop tool for designing enterprise web application architectures.
                Build complex K8s infrastructures with official components following the pattern:
                Client → Firewall → Ingress → Frontend → Backend → Database & Legacy
              </Typography>
            </Box>
          </Box>

          <Box ref={reactFlowWrapper} sx={{ flex: 1, position: 'relative' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#333" gap={16} />
            </ReactFlow>

            {/* Component Palette */}
            <ComponentPalette />
          </Box>
        </Box>
      )}
    </>
  );
}
