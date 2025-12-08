import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Node,
    Panel,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, nodeConfigs } from '../../components/workflows/WorkflowNodes';
import { createWorkflow, updateWorkflow, getWorkflow } from '../../services/firebase/workflow.service';
import { useAuth } from '../../context/AuthContext';
import { Workflow, WorkflowNode, WorkflowEdge, WorkflowTrigger } from '../../types/workflow.types';
import { ArrowLeft, Save, Play, Plus, Settings, Trash2, X } from 'lucide-react';

const WorkflowBuilderContent: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // Workflow state - explicitly typed to avoid 'never[]' inference
    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
    const [workflowName, setWorkflowName] = useState('New Workflow');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [chatId, setChatId] = useState('');

    // UI state
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [showNodeConfig, setShowNodeConfig] = useState(false);
    const [showTriggerConfig, setShowTriggerConfig] = useState(false);
    const [saving, setSaving] = useState(false);

    // Trigger configuration
    const [trigger, setTrigger] = useState<WorkflowTrigger>({
        type: 'manual',
    });

    // Load existing workflow if editing
    useEffect(() => {
        if (id && currentUser) {
            loadWorkflow(id);
        }
    }, [id, currentUser]);

    const loadWorkflow = async (workflowId: string) => {
        try {
            const workflow = await getWorkflow(workflowId);
            if (workflow) {
                setWorkflowName(workflow.name);
                setWorkflowDescription(workflow.description);
                setIsActive(workflow.isActive);
                setChatId(workflow.chatId || '');
                setTrigger(workflow.trigger);

                // Convert workflow nodes to React Flow nodes
                const flowNodes = workflow.nodes.map(node => ({
                    ...node,
                    type: node.type,
                }));
                setNodes(flowNodes);
                setEdges(workflow.edges);
            }
        } catch (error) {
            console.error('Error loading workflow:', error);
        }
    };

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

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type || !reactFlowInstance) return;

            const config = nodeConfigs.find(c => c.type === type);
            if (!config) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { ...config.defaultData },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setShowNodeConfig(true);
    }, []);

    const updateNodeData = (nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: { ...node.data, ...newData },
                    };
                }
                return node;
            })
        );
    };

    const deleteSelectedNode = () => {
        if (selectedNode) {
            setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
            setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
            setShowNodeConfig(false);
            setSelectedNode(null);
        }
    };

    const saveWorkflow = async () => {
        if (!currentUser) return;

        setSaving(true);
        try {
            const workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'> = {
                userId: currentUser.id,
                name: workflowName,
                description: workflowDescription,
                nodes: nodes as WorkflowNode[],
                edges: edges as WorkflowEdge[],
                trigger,
                isActive,
                chatId: chatId || undefined,
            };

            if (id) {
                await updateWorkflow(id, workflowData);
            } else {
                const newId = await createWorkflow(workflowData);
                navigate(`/workflows/edit/${newId}`, { replace: true });
            }

            alert('Workflow saved successfully!');
        } catch (error) {
            console.error('Error saving workflow:', error);
            alert('Failed to save workflow');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0b141a]">
            {/* Node Palette */}
            <div className="w-64 bg-[#111b21] border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-white font-semibold mb-2">Workflow Nodes</h3>
                    <p className="text-xs text-gray-400">Drag nodes to the canvas</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {nodeConfigs.map((config) => {
                        const Icon = config.icon;
                        return (
                            <div
                                key={config.type}
                                className="p-3 rounded-lg border border-gray-700 bg-[#202c33] cursor-move hover:border-primary transition-colors"
                                draggable
                                onDragStart={(event) => {
                                    event.dataTransfer.setData('application/reactflow', config.type);
                                    event.dataTransfer.effectAllowed = 'move';
                                }}
                            >
                                <div className="flex items-center space-x-2 mb-1">
                                    <div
                                        className="p-2 rounded"
                                        style={{ backgroundColor: `${config.color}20` }}
                                    >
                                        <Icon className="h-4 w-4" style={{ color: config.color }} />
                                    </div>
                                    <span className="text-sm font-semibold text-white">{config.label}</span>
                                </div>
                                <p className="text-xs text-gray-400">{config.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-[#111b21] border-b border-gray-800 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/workflows')}
                                className="p-2 hover:bg-[#202c33] rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <input
                                type="text"
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                className="text-xl font-semibold bg-transparent text-white border-none outline-none"
                                placeholder="Workflow Name"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowTriggerConfig(true)}
                                className="px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <Settings className="h-4 w-4" />
                                <span>Trigger</span>
                            </button>
                            <button
                                onClick={saveWorkflow}
                                disabled={saving}
                                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                <span>{saving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* React Flow Canvas */}
                <div ref={reactFlowWrapper} className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-[#0b141a]"
                    >
                        <Background color="#1f2937" gap={16} />
                        <Controls className="bg-[#202c33] border border-gray-700" />
                        <MiniMap
                            className="bg-[#202c33] border border-gray-700"
                            nodeColor={(node) => {
                                const config = nodeConfigs.find(c => c.type === node.type);
                                return config?.color || '#666';
                            }}
                        />
                        <Panel position="top-center">
                            <div className="bg-[#202c33] border border-gray-700 rounded-lg px-4 py-2">
                                <p className="text-sm text-gray-400">
                                    Drag nodes from the left panel • Connect nodes by dragging from output to input
                                </p>
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
            </div>

            {/* Node Configuration Panel */}
            {showNodeConfig && selectedNode && (
                <NodeConfigPanel
                    node={selectedNode}
                    onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                    onDelete={deleteSelectedNode}
                    onClose={() => setShowNodeConfig(false)}
                />
            )}

            {/* Trigger Configuration Modal */}
            {showTriggerConfig && (
                <TriggerConfigModal
                    trigger={trigger}
                    onUpdate={setTrigger}
                    onClose={() => setShowTriggerConfig(false)}
                />
            )}
        </div>
    );
};

// Node Configuration Panel Component
const NodeConfigPanel: React.FC<{
    node: Node;
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onClose: () => void;
}> = ({ node, onUpdate, onDelete, onClose }) => {
    const [localData, setLocalData] = useState(node.data);

    useEffect(() => {
        setLocalData(node.data);
    }, [node]);

    const handleUpdate = () => {
        onUpdate(localData);
    };

    return (
        <div className="w-80 bg-[#111b21] border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold">Configure Node</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Label */}
                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Label</label>
                    <input
                        type="text"
                        value={localData.label || ''}
                        onChange={(e) => setLocalData({ ...localData, label: e.target.value })}
                        onBlur={handleUpdate}
                        className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                    />
                </div>

                {/* Type-specific fields */}
                {node.type === 'message' && (
                    <>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Message Content</label>
                            <textarea
                                value={localData.content || ''}
                                onChange={(e) => setLocalData({ ...localData, content: e.target.value })}
                                onBlur={handleUpdate}
                                rows={4}
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                                placeholder="Enter message text..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Use {`{{variableName}}`} for variables</p>
                        </div>
                    </>
                )}

                {node.type === 'delay' && (
                    <>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Duration</label>
                            <input
                                type="number"
                                value={localData.duration || 1}
                                onChange={(e) => setLocalData({ ...localData, duration: parseInt(e.target.value) })}
                                onBlur={handleUpdate}
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Unit</label>
                            <select
                                value={localData.unit || 'seconds'}
                                onChange={(e) => setLocalData({ ...localData, unit: e.target.value })}
                                onBlur={handleUpdate}
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                            >
                                <option value="seconds">Seconds</option>
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                    </>
                )}

                {node.type === 'condition' && (
                    <>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Variable</label>
                            <input
                                type="text"
                                value={localData.variable || 'lastResponse'}
                                onChange={(e) => setLocalData({ ...localData, variable: e.target.value })}
                                onBlur={handleUpdate}
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Condition Type</label>
                            <select
                                value={localData.conditionType || 'contains'}
                                onChange={(e) => setLocalData({ ...localData, conditionType: e.target.value })}
                                onBlur={handleUpdate}
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                            >
                                <option value="contains">Contains</option>
                                <option value="equals">Equals</option>
                                <option value="startsWith">Starts With</option>
                                <option value="endsWith">Ends With</option>
                                <option value="regex">Regex</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Value</label>
                            <input
                                type="text"
                                value={localData.value || ''}
                                onChange={(e) => setLocalData({ ...localData, value: e.target.value })}
                                onBlur={handleUpdate}
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>
                    </>
                )}

                {node.type === 'waitForResponse' && (
                    <>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Save Response As</label>
                            <input
                                type="text"
                                value={localData.saveAs || ''}
                                onChange={(e) => setLocalData({ ...localData, saveAs: e.target.value })}
                                onBlur={handleUpdate}
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                                placeholder="variableName"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Timeout (seconds)</label>
                            <input
                                type="number"
                                value={(localData.timeout || 300000) / 1000}
                                onChange={(e) => setLocalData({ ...localData, timeout: parseInt(e.target.value) * 1000 })}
                                onBlur={handleUpdate}
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Node</span>
                </button>
            </div>
        </div>
    );
};

// Trigger Configuration Modal
const TriggerConfigModal: React.FC<{
    trigger: WorkflowTrigger;
    onUpdate: (trigger: WorkflowTrigger) => void;
    onClose: () => void;
}> = ({ trigger, onUpdate, onClose }) => {
    const [localTrigger, setLocalTrigger] = useState(trigger);

    const handleSave = () => {
        onUpdate(localTrigger);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#111b21] rounded-lg w-full max-w-md border border-gray-800">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-white font-semibold">Workflow Trigger</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Trigger Type</label>
                        <select
                            value={localTrigger.type}
                            onChange={(e) => setLocalTrigger({ ...localTrigger, type: e.target.value as any })}
                            className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                        >
                            <option value="manual">Manual</option>
                            <option value="messageReceived">When Message Received</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                    </div>

                    {localTrigger.type === 'messageReceived' && (
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Message Contains</label>
                            <input
                                type="text"
                                value={localTrigger.messageCondition?.contains || ''}
                                onChange={(e) =>
                                    setLocalTrigger({
                                        ...localTrigger,
                                        messageCondition: { contains: e.target.value },
                                    })
                                }
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                                placeholder="e.g., hello"
                            />
                        </div>
                    )}

                    {localTrigger.type === 'scheduled' && (
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Scheduled Time</label>
                            <input
                                type="datetime-local"
                                value={localTrigger.scheduledTime?.substring(0, 16) || ''}
                                onChange={(e) =>
                                    setLocalTrigger({
                                        ...localTrigger,
                                        scheduledTime: new Date(e.target.value).toISOString(),
                                    })
                                }
                                className="w-full bg-[#202c33] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main component with ReactFlowProvider
const WorkflowBuilderPage: React.FC = () => {
    return (
        <ReactFlowProvider>
            <WorkflowBuilderContent />
        </ReactFlowProvider>
    );
};

export default WorkflowBuilderPage;
