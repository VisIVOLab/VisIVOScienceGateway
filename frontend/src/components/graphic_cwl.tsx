import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FileInput, FileOutput, GitBranch } from 'lucide-react';

interface CWLGraphViewProps {
  cwlData: {
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    steps: Record<string, any>;
  };
};

// Helper function to safely get string representation of a value
function getDisplayValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.type) return String(value.type);
    if (value.class) return String(value.class);
    return 'object';
  }
  return String(value);
}

export function CWLGraphView({ cwlData }: CWLGraphViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { processedNodes, processedEdges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const nodeSpacing = 250;
    const verticalSpacing = 120;

    // Parse inputs
    const inputKeys = Object.keys(cwlData.inputs || {});
    inputKeys.forEach((key, index) => {
      const input = cwlData.inputs[key];
      newNodes.push({
        id: `input-${key}`,
        type: 'input',
        position: { x: 50, y: index * verticalSpacing },
        data: {
          label: (
            <div className="flex items-center gap-2">
              <FileInput size={16} className="text-blue-500" />
              <div>
                <div className="font-semibold">{key}</div>
                <div className="text-xs text-gray-500">
                  {getDisplayValue(input.type) || 'any'}
                </div>
              </div>
            </div>
          ),
        },
        style: {
          background: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '180px',
        },
      });
    });

    // Parse steps
    const stepKeys = Object.keys(cwlData.steps || {});
    const maxInputs = inputKeys.length;
    const stepStartY = Math.max(maxInputs * verticalSpacing / 2, 100);

    stepKeys.forEach((key, index) => {
      const step = cwlData.steps[key];
      newNodes.push({
        id: `step-${key}`,
        position: { x: 350, y: stepStartY + (index * verticalSpacing) - ((stepKeys.length * verticalSpacing) / 2) },
        data: {
          label: (
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-purple-500" />
              <div>
                <div className="font-semibold">{key}</div>
                <div className="text-xs text-gray-500">
                  {getDisplayValue(step.run) || 'process'}
                </div>
              </div>
            </div>
          ),
        },
        style: {
          background: '#faf5ff',
          border: '2px solid #a855f7',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '180px',
        },
      });

      // Create edges from inputs to steps
      if (step.in) {
        Object.entries(step.in).forEach(([inputName, source]) => {
          const sourceStr = String(source);
          
          // Check if it's a workflow input
          if (inputKeys.includes(sourceStr)) {
            newEdges.push({
              id: `input-${sourceStr}-step-${key}`,
              source: `input-${sourceStr}`,
              target: `step-${key}`,
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#6b7280',
              },
              style: { stroke: '#6b7280' },
              label: inputName,
              labelStyle: { fontSize: 10, fill: '#6b7280' },
            });
          }
          // Check if it's from another step
          else if (sourceStr.includes('/')) {
            const [sourceStep] = sourceStr.split('/');
            if (stepKeys.includes(sourceStep)) {
              newEdges.push({
                id: `step-${sourceStep}-step-${key}`,
                source: `step-${sourceStep}`,
                target: `step-${key}`,
                type: 'smoothstep',
                animated: true,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#6b7280',
                },
                style: { stroke: '#6b7280' },
                label: inputName,
                labelStyle: { fontSize: 10, fill: '#6b7280' },
              });
            }
          }
        });
      }
    });

    // Parse outputs
    const outputKeys = Object.keys(cwlData.outputs || {});
    outputKeys.forEach((key, index) => {
      const output = cwlData.outputs[key];
      newNodes.push({
        id: `output-${key}`,
        type: 'output',
        position: { x: 650, y: index * verticalSpacing },
        data: {
          label: (
            <div className="flex items-center gap-2">
              <FileOutput size={16} className="text-green-500" />
              <div>
                <div className="font-semibold">{key}</div>
                <div className="text-xs text-gray-500">
                  {getDisplayValue(output.type) || 'any'}
                </div>
              </div>
            </div>
          ),
        },
        style: {
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '180px',
        },
      });

      // Create edges from steps to outputs
      if (output.outputSource) {
        const source = String(output.outputSource);
        if (source.includes('/')) {
          const [sourceStep] = source.split('/');
          if (stepKeys.includes(sourceStep)) {
            newEdges.push({
              id: `step-${sourceStep}-output-${key}`,
              source: `step-${sourceStep}`,
              target: `output-${key}`,
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#6b7280',
              },
              style: { stroke: '#6b7280' },
            });
          }
        }
      }
    });

    return { processedNodes: newNodes, processedEdges: newEdges };
  }, [cwlData]);

  useEffect(() => {
    setNodes(processedNodes);
    setEdges(processedEdges);
  }, [processedNodes, processedEdges, setNodes, setEdges]);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-700">Inputs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-700">Steps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-700">Outputs</span>
          </div>
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'input') return '#3b82f6';
            if (node.type === 'output') return '#22c55e';
            return '#a855f7';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}