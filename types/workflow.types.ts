// Workflow System Type Definitions

// ============================================
// Workflow Node Types
// ============================================

export type WorkflowNodeType =
    | 'message'           // Send a message
    | 'delay'             // Wait for a duration
    | 'condition'         // Branch based on condition
    | 'waitForResponse';  // Wait for user response

export interface WorkflowNodeData {
    label: string;
    description?: string;
}

// Message Node - Sends a message
export interface MessageNodeData extends WorkflowNodeData {
    content: string;
    messageType?: 'text' | 'image' | 'video' | 'document';
    fileUrl?: string;
}

// Delay Node - Waits for specified duration
export interface DelayNodeData extends WorkflowNodeData {
    duration: number; // in milliseconds
    unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

// Condition Node - Evaluates a condition and branches
export interface ConditionNodeData extends WorkflowNodeData {
    conditionType: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex' | 'custom';
    value: string;
    variable?: string; // Variable to check (e.g., 'lastResponse')
    caseSensitive?: boolean;
}

// Wait For Response Node - Waits for user to respond
export interface WaitForResponseNodeData extends WorkflowNodeData {
    timeout?: number; // in milliseconds, optional
    timeoutMessage?: string; // Message to send if timeout
    saveAs?: string; // Variable name to save response
}

// Generic Workflow Node
export interface WorkflowNode {
    id: string;
    type: WorkflowNodeType;
    position: { x: number; y: number };
    data: MessageNodeData | DelayNodeData | ConditionNodeData | WaitForResponseNodeData | WorkflowNodeData;
}

// ============================================
// Workflow Edge (Connection)
// ============================================

export interface WorkflowEdge {
    id: string;
    source: string; // Source node ID
    target: string; // Target node ID
    sourceHandle?: string; // For condition nodes (true/false branches)
    label?: string;
}

// ============================================
// Workflow Trigger Types
// ============================================

export type WorkflowTriggerType =
    | 'manual'           // Manually triggered by user
    | 'scheduled'        // Triggered at specific time
    | 'messageReceived'  // Triggered when message received
    | 'chatOpened';      // Triggered when chat is opened

export interface WorkflowTrigger {
    type: WorkflowTriggerType;
    // For scheduled triggers
    scheduledTime?: string; // ISO timestamp
    recurring?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        time?: string; // Time of day (HH:mm)
        dayOfWeek?: number; // 0-6 for weekly
        dayOfMonth?: number; // 1-31 for monthly
    };
    // For message received triggers
    messageCondition?: {
        contains?: string;
        equals?: string;
        regex?: string;
    };
}

// ============================================
// Workflow Definition
// ============================================

export interface Workflow {
    id: string;
    userId: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    trigger: WorkflowTrigger;
    isActive: boolean;
    chatId?: string; // Optional - for chat-specific workflows
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Workflow Execution
// ============================================

export type WorkflowExecutionStatus =
    | 'pending'
    | 'running'
    | 'waiting'     // Waiting for response
    | 'paused'
    | 'completed'
    | 'failed'
    | 'cancelled';

export interface ExecutionLog {
    timestamp: string;
    nodeId: string;
    nodeName: string;
    action: string;
    status: 'success' | 'error' | 'info';
    message: string;
    data?: any;
}

export interface WorkflowExecutionContext {
    [key: string]: any; // Variables collected during execution
    lastResponse?: string;
    lastMessageId?: string;
    triggerMessage?: string;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    userId: string;
    chatId: string;
    status: WorkflowExecutionStatus;
    currentNodeId: string | null;
    context: WorkflowExecutionContext;
    startedAt: string;
    completedAt?: string;
    logs: ExecutionLog[];
    error?: string;
}

// ============================================
// Scheduled Messages
// ============================================

export type ScheduledMessageStatus =
    | 'pending'
    | 'sent'
    | 'failed'
    | 'cancelled';

export interface ScheduledMessage {
    id: string;
    userId: string;
    chatId: string;
    content: string;
    messageType: 'text' | 'image' | 'video' | 'document' | 'voice';
    fileInfo?: {
        name: string;
        size: string;
        url: string;
    };
    scheduledFor: string; // ISO timestamp
    status: ScheduledMessageStatus;
    workflowExecutionId?: string; // If part of a workflow
    recurring?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        endDate?: string;
    };
    createdAt: string;
    sentAt?: string;
    error?: string;
}

// ============================================
// UI Helper Types
// ============================================

export interface WorkflowNodeConfig {
    type: WorkflowNodeType;
    icon: string;
    label: string;
    description: string;
    color: string;
    defaultData: Partial<WorkflowNodeData>;
}

export interface WorkflowValidationError {
    nodeId?: string;
    edgeId?: string;
    field?: string;
    message: string;
}
