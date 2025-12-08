import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
    MessageCircle,
    Clock,
    GitBranch,
    MessageSquare,
    Send,
    Timer,
    HelpCircle
} from 'lucide-react';

// Base Node Container
const BaseNode: React.FC<{
    children: React.ReactNode;
    color: string;
    selected?: boolean;
}> = ({ children, color, selected }) => (
    <div
        className={`
            rounded-lg shadow-lg border-2 transition-all
            ${selected ? 'border-primary shadow-2xl scale-105' : 'border-gray-600'}
            backdrop-blur-sm
        `}
        style={{
            background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
            minWidth: '220px',
        }}
    >
        {children}
    </div>
);

// Message Node - Sends a message
export const MessageNode = memo(({ data, selected }: any) => {
    return (
        <BaseNode color="#10b981" selected={selected}>
            <Handle type="target" position={Position.Top} className="!bg-emerald-500" />

            <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Send className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{data?.label || 'Send Message'}</div>
                        <div className="text-xs text-gray-400">Send Message</div>
                    </div>
                </div>

                {data?.content && (
                    <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300 line-clamp-2">
                        {data.content}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
        </BaseNode>
    );
});

MessageNode.displayName = 'MessageNode';

// Delay Node - Waits for a duration
export const DelayNode = memo(({ data, selected }: any) => {
    return (
        <BaseNode color="#f59e0b" selected={selected}>
            <Handle type="target" position={Position.Top} className="!bg-amber-500" />

            <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Timer className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{data?.label || 'Wait'}</div>
                        <div className="text-xs text-gray-400">Wait</div>
                    </div>
                </div>

                {data?.duration && (
                    <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300">
                        ⏱️ {data.duration} {data.unit}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
        </BaseNode>
    );
});

DelayNode.displayName = 'DelayNode';

// Condition Node - Evaluates a condition and branches
export const ConditionNode = memo(({ data, selected }: any) => {
    return (
        <BaseNode color="#8b5cf6" selected={selected}>
            <Handle type="target" position={Position.Top} className="!bg-purple-500" />

            <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <GitBranch className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{data?.label || 'Check Condition'}</div>
                        <div className="text-xs text-gray-400">If/Else</div>
                    </div>
                </div>

                {data?.conditionType && data?.value && (
                    <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300">
                        {data.conditionType} "{data.value}"
                    </div>
                )}
            </div>

            <div className="flex justify-between px-4 pb-3">
                <div className="text-xs text-green-400 font-semibold">✓ True</div>
                <div className="text-xs text-red-400 font-semibold">✗ False</div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="!bg-green-500"
                style={{ left: '30%' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="!bg-red-500"
                style={{ left: '70%' }}
            />
        </BaseNode>
    );
});

ConditionNode.displayName = 'ConditionNode';

// Wait For Response Node - Waits for user response
export const WaitForResponseNode = memo(({ data, selected }: any) => {
    return (
        <BaseNode color="#3b82f6" selected={selected}>
            <Handle type="target" position={Position.Top} className="!bg-blue-500" />

            <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{data?.label || 'Wait for Reply'}</div>
                        <div className="text-xs text-gray-400">Wait for Response</div>
                    </div>
                </div>

                {data?.saveAs && (
                    <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300">
                        💾 Save as: {data.saveAs}
                    </div>
                )}

                {data?.timeout && (
                    <div className="mt-1 p-2 bg-black/20 rounded text-xs text-gray-300">
                        ⏱️ Timeout: {(data.timeout / 1000) || 300}s
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
        </BaseNode>
    );
});

WaitForResponseNode.displayName = 'WaitForResponseNode';

// Export node types configuration
export const nodeTypes = {
    message: MessageNode,
    delay: DelayNode,
    condition: ConditionNode,
    waitForResponse: WaitForResponseNode,
};

// Node configurations for the palette
export const nodeConfigs = [
    {
        type: 'message',
        icon: Send,
        label: 'Send Message',
        description: 'Send a message to the chat',
        color: '#10b981',
        defaultData: {
            label: 'Send Message',
            content: 'Hello! This is an automated message.',
            messageType: 'text',
        },
    },
    {
        type: 'delay',
        icon: Timer,
        label: 'Delay',
        description: 'Wait for a specified duration',
        color: '#f59e0b',
        defaultData: {
            label: 'Wait',
            duration: 5,
            unit: 'seconds',
        },
    },
    {
        type: 'condition',
        icon: GitBranch,
        label: 'Condition',
        description: 'Branch based on a condition',
        color: '#8b5cf6',
        defaultData: {
            label: 'Check Condition',
            conditionType: 'contains',
            value: 'yes',
            variable: 'lastResponse',
            caseSensitive: false,
        },
    },
    {
        type: 'waitForResponse',
        icon: MessageSquare,
        label: 'Wait for Response',
        description: 'Wait for user to respond',
        color: '#3b82f6',
        defaultData: {
            label: 'Wait for Reply',
            timeout: 300000, // 5 minutes
            saveAs: 'userResponse',
        },
    },
];
