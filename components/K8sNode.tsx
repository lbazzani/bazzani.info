import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box } from '@mui/material';

interface K8sNodeData {
  label: string;
  icon: string;
  type: string;
  replicas?: number;
}

function K8sNode({ data, selected }: NodeProps<K8sNodeData>) {
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'rgba(255,255,255,0.95)',
        border: selected ? '3px solid #326CE5' : '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '12px',
        minWidth: '160px',
        boxShadow: selected ? '0 4px 20px rgba(50, 108, 229, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Input Handle - Left */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#326CE5',
          width: 10,
          height: 10,
          border: '2px solid white',
        }}
      />

      {/* Icon and Label */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* K8s Icon */}
        <Box
          component="img"
          src={`/icons/k8s/${data.icon}.svg`}
          alt={data.type}
          sx={{
            width: 48,
            height: 48,
            filter: selected ? 'drop-shadow(0 2px 4px rgba(50, 108, 229, 0.3))' : 'none',
          }}
        />

        {/* Label */}
        <Box
          sx={{
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 600,
            color: '#2c3e50',
            lineHeight: 1.3,
          }}
        >
          {data.label}
        </Box>

        {/* Replicas badge */}
        {data.replicas && (
          <Box
            sx={{
              bgcolor: '#326CE5',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '10px',
              mt: 0.5,
            }}
          >
            x{data.replicas}
          </Box>
        )}

        {/* Type badge */}
        <Box
          sx={{
            fontSize: '10px',
            color: '#7f8c8d',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {data.type}
        </Box>
      </Box>

      {/* Output Handle - Right */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#326CE5',
          width: 10,
          height: 10,
          border: '2px solid white',
        }}
      />
    </Box>
  );
}

export default memo(K8sNode);
