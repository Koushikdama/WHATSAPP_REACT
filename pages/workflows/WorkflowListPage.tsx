import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Edit, Trash2, Clock, MessageCircle, Zap } from 'lucide-react';
import { getUserWorkflows, deleteWorkflow, toggleWorkflowActive } from '../../services/firebase/workflow.service';
import { useAuth } from '../../context/AuthContext';
import { Workflow } from '../../types/workflow.types';

const WorkflowListPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            loadWorkflows();
        }
    }, [currentUser]);

    const loadWorkflows = async () => {
        if (!currentUser) return;

        try {
            const userWorkflows = await getUserWorkflows(currentUser.id);
            setWorkflows(userWorkflows);
        } catch (error) {
            console.error('Error loading workflows:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (workflowId: string, currentStatus: boolean) => {
        try {
            await toggleWorkflowActive(workflowId, !currentStatus);
            await loadWorkflows();
        } catch (error) {
            console.error('Error toggling workflow:', error);
        }
    };

    const handleDelete = async (workflowId: string) => {
        if (!confirm('Are you sure you want to delete this workflow?')) return;

        try {
            await deleteWorkflow(workflowId);
            await loadWorkflows();
        } catch (error) {
            console.error('Error deleting workflow:', error);
        }
    };

    const getTriggerIcon = (triggerType: string) => {
        switch (triggerType) {
            case 'manual':
                return <Play className="h-4 w-4" />;
            case 'messageReceived':
                return <MessageCircle className="h-4 w-4" />;
            case 'scheduled':
                return <Clock className="h-4 w-4" />;
            default:
                return <Zap className="h-4 w-4" />;
        }
    };

    const getTriggerLabel = (trigger: any) => {
        switch (trigger.type) {
            case 'manual':
                return 'Manual';
            case 'messageReceived':
                return `On message: "${trigger.messageCondition?.contains}"`;
            case 'scheduled':
                return `Scheduled`;
            default:
                return trigger.type;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0b141a] text-white">
                <p>Loading workflows...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b141a] text-white">
            {/* Header */}
            <div className="bg-[#111b21] border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Workflows</h1>
                            <p className="text-gray-400">Automate your messaging with custom workflows</p>
                        </div>
                        <button
                            onClick={() => navigate('/workflows/new')}
                            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors flex items-center space-x-2 font-semibold"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Create Workflow</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Workflows Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {workflows.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-[#202c33] rounded-full flex items-center justify-center mb-6">
                            <Zap className="h-12 w-12 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">No workflows yet</h3>
                        <p className="text-gray-400 mb-6">Create your first automated workflow</p>
                        <button
                            onClick={() => navigate('/workflows/new')}
                            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors inline-flex items-center space-x-2"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Create Workflow</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                className="bg-[#111b21] border border-gray-800 rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold mb-1">{workflow.name}</h3>
                                            <p className="text-sm text-gray-400 line-clamp-2">
                                                {workflow.description || 'No description'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleActive(workflow.id, workflow.isActive)}
                                            className={`ml-2 p-2 rounded-lg transition-colors ${workflow.isActive
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-700 text-gray-400'
                                                }`}
                                        >
                                            {workflow.isActive ? (
                                                <Pause className="h-4 w-4" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Stats */}
                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center text-sm text-gray-400">
                                            {getTriggerIcon(workflow.trigger.type)}
                                            <span className="ml-2">{getTriggerLabel(workflow.trigger)}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-400">
                                            <Zap className="h-4 w-4" />
                                            <span className="ml-2">{workflow.nodes.length} nodes</span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-4">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${workflow.isActive
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-700 text-gray-400'
                                                }`}
                                        >
                                            {workflow.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => navigate(`/workflows/edit/${workflow.id}`)}
                                            className="flex-1 px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(workflow.id)}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkflowListPage;
