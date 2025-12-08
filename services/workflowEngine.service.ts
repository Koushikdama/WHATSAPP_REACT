import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc,
    arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/schema';
import {
    Workflow,
    WorkflowExecution,
    WorkflowExecutionStatus,
    WorkflowNode,
    WorkflowEdge,
    ExecutionLog,
    MessageNodeData,
    DelayNodeData,
    ConditionNodeData,
    WaitForResponseNodeData,
    WorkflowExecutionContext,
} from '../types/workflow.types';
import { sendMessage } from './firebase/chat.service';
import { Message } from '../types';

/**
 * Workflow Execution Engine
 * Handles the execution of workflows, including node processing and state management
 */
class WorkflowEngineService {
    private activeExecutions: Map<string, NodeJS.Timeout> = new Map();
    private responseListeners: Map<string, () => void> = new Map();

    /**
     * Start a workflow execution
     */
    async startWorkflow(
        workflowId: string,
        userId: string,
        chatId: string,
        triggerContext?: Partial<WorkflowExecutionContext>
    ): Promise<string> {
        try {
            // Get workflow details
            const workflowRef = doc(db, COLLECTIONS.WORKFLOWS, workflowId);
            const workflowDoc = await getDoc(workflowRef);

            if (!workflowDoc.exists()) {
                throw new Error('Workflow not found');
            }

            const workflow = workflowDoc.data() as Workflow;

            // Create execution record
            const executionRef = await addDoc(collection(db, COLLECTIONS.WORKFLOW_EXECUTIONS), {
                workflowId,
                userId,
                chatId,
                status: 'running' as WorkflowExecutionStatus,
                currentNodeId: null,
                context: triggerContext || {},
                startedAt: serverTimestamp(),
                logs: [],
            });

            const executionId = executionRef.id;

            // Find start node (node without incoming edges)
            const startNode = this.findStartNode(workflow.nodes, workflow.edges);
            if (!startNode) {
                await this.failExecution(executionId, 'No start node found');
                throw new Error('No start node found in workflow');
            }

            // Log start
            await this.addLog(executionId, {
                timestamp: new Date().toISOString(),
                nodeId: 'start',
                nodeName: 'Workflow Start',
                action: 'Workflow execution started',
                status: 'info',
                message: `Starting workflow: ${workflow.name}`,
            });

            // Execute first node
            await this.executeNode(executionId, startNode.id, workflow);

            return executionId;
        } catch (error) {
            console.error('Error starting workflow:', error);
            throw error;
        }
    }

    /**
     * Execute a specific node
     */
    private async executeNode(
        executionId: string,
        nodeId: string,
        workflow: Workflow
    ): Promise<void> {
        try {
            const node = workflow.nodes.find(n => n.id === nodeId);
            if (!node) {
                throw new Error(`Node ${nodeId} not found`);
            }

            // Update current node
            await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
                currentNodeId: nodeId,
            });

            // Get execution context
            const execution = await this.getExecution(executionId);
            if (!execution) {
                throw new Error('Execution not found');
            }

            // Execute based on node type
            switch (node.type) {
                case 'message':
                    await this.executeMessageNode(executionId, node, execution, workflow);
                    break;
                case 'delay':
                    await this.executeDelayNode(executionId, node, execution, workflow);
                    break;
                case 'condition':
                    await this.executeConditionNode(executionId, node, execution, workflow);
                    break;
                case 'waitForResponse':
                    await this.executeWaitForResponseNode(executionId, node, execution, workflow);
                    break;
                default:
                    throw new Error(`Unknown node type: ${node.type}`);
            }
        } catch (error) {
            console.error(`Error executing node ${nodeId}:`, error);
            await this.failExecution(executionId, (error as Error).message);
        }
    }

    /**
     * Execute a message node - sends a message
     */
    private async executeMessageNode(
        executionId: string,
        node: WorkflowNode,
        execution: WorkflowExecution,
        workflow: Workflow
    ): Promise<void> {
        const data = node.data as MessageNodeData;

        try {
            // Replace variables in content
            const content = this.replaceVariables(data.content, execution.context);

            // Send message
            await sendMessage(
                execution.chatId,
                execution.userId,
                content,
                data.messageType || 'text',
                data.fileUrl ? { url: data.fileUrl } : undefined
            );

            await this.addLog(executionId, {
                timestamp: new Date().toISOString(),
                nodeId: node.id,
                nodeName: data.label,
                action: 'Send Message',
                status: 'success',
                message: `Sent message: "${content.substring(0, 50)}..."`,
                data: { content },
            });

            // Move to next node
            await this.moveToNextNode(executionId, node.id, workflow);
        } catch (error) {
            await this.addLog(executionId, {
                timestamp: new Date().toISOString(),
                nodeId: node.id,
                nodeName: data.label,
                action: 'Send Message',
                status: 'error',
                message: `Failed to send message: ${(error as Error).message}`,
            });
            throw error;
        }
    }

    /**
     * Execute a delay node - waits for specified duration
     */
    private async executeDelayNode(
        executionId: string,
        node: WorkflowNode,
        execution: WorkflowExecution,
        workflow: Workflow
    ): Promise<void> {
        const data = node.data as DelayNodeData;

        // Convert duration to milliseconds
        let durationMs = data.duration;
        switch (data.unit) {
            case 'seconds':
                durationMs *= 1000;
                break;
            case 'minutes':
                durationMs *= 60 * 1000;
                break;
            case 'hours':
                durationMs *= 60 * 60 * 1000;
                break;
            case 'days':
                durationMs *= 24 * 60 * 60 * 1000;
                break;
        }

        await this.addLog(executionId, {
            timestamp: new Date().toISOString(),
            nodeId: node.id,
            nodeName: data.label,
            action: 'Delay',
            status: 'info',
            message: `Waiting for ${data.duration} ${data.unit}`,
        });

        // Update status to waiting
        await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
            status: 'waiting' as WorkflowExecutionStatus,
        });

        // Set timeout
        const timeout = setTimeout(async () => {
            await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
                status: 'running' as WorkflowExecutionStatus,
            });

            await this.addLog(executionId, {
                timestamp: new Date().toISOString(),
                nodeId: node.id,
                nodeName: data.label,
                action: 'Delay Complete',
                status: 'success',
                message: `Delay of ${data.duration} ${data.unit} completed`,
            });

            await this.moveToNextNode(executionId, node.id, workflow);
            this.activeExecutions.delete(executionId);
        }, durationMs);

        this.activeExecutions.set(executionId, timeout);
    }

    /**
     * Execute a condition node - evaluates condition and branches
     */
    private async executeConditionNode(
        executionId: string,
        node: WorkflowNode,
        execution: WorkflowExecution,
        workflow: Workflow
    ): Promise<void> {
        const data = node.data as ConditionNodeData;

        try {
            const result = this.evaluateCondition(data, execution.context);

            await this.addLog(executionId, {
                timestamp: new Date().toISOString(),
                nodeId: node.id,
                nodeName: data.label,
                action: 'Evaluate Condition',
                status: 'success',
                message: `Condition evaluated to: ${result}`,
                data: { result, condition: data },
            });

            // Find the appropriate edge based on result
            const edge = workflow.edges.find(
                e => e.source === node.id && e.sourceHandle === (result ? 'true' : 'false')
            );

            if (edge) {
                await this.executeNode(executionId, edge.target, workflow);
            } else {
                // No edge found, complete execution
                await this.completeExecution(executionId);
            }
        } catch (error) {
            await this.addLog(executionId, {
                timestamp: new Date().toISOString(),
                nodeId: node.id,
                nodeName: data.label,
                action: 'Evaluate Condition',
                status: 'error',
                message: `Failed to evaluate condition: ${(error as Error).message}`,
            });
            throw error;
        }
    }

    /**
     * Execute wait for response node - waits for user response
     */
    private async executeWaitForResponseNode(
        executionId: string,
        node: WorkflowNode,
        execution: WorkflowExecution,
        workflow: Workflow
    ): Promise<void> {
        const data = node.data as WaitForResponseNodeData;

        await this.addLog(executionId, {
            timestamp: new Date().toISOString(),
            nodeId: node.id,
            nodeName: data.label,
            action: 'Wait for Response',
            status: 'info',
            message: 'Waiting for user response...',
        });

        // Update status to waiting
        await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
            status: 'waiting' as WorkflowExecutionStatus,
        });

        // Set up message listener
        const unsubscribe = this.listenForResponse(
            execution.chatId,
            execution.userId,
            async (response: string, messageId: string) => {
                // Save response to context
                const newContext = {
                    ...execution.context,
                    lastResponse: response,
                    lastMessageId: messageId,
                };

                if (data.saveAs) {
                    newContext[data.saveAs] = response;
                }

                await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
                    context: newContext,
                    status: 'running' as WorkflowExecutionStatus,
                });

                await this.addLog(executionId, {
                    timestamp: new Date().toISOString(),
                    nodeId: node.id,
                    nodeName: data.label,
                    action: 'Response Received',
                    status: 'success',
                    message: `Received response: "${response.substring(0, 50)}..."`,
                    data: { response },
                });

                // Clean up listener and timeout
                unsubscribe();
                this.responseListeners.delete(executionId);

                if (this.activeExecutions.has(executionId)) {
                    clearTimeout(this.activeExecutions.get(executionId)!);
                    this.activeExecutions.delete(executionId);
                }

                // Move to next node
                const updatedExecution = await this.getExecution(executionId);
                if (updatedExecution) {
                    await this.moveToNextNode(executionId, node.id, workflow);
                }
            }
        );

        this.responseListeners.set(executionId, unsubscribe);

        // Set timeout if specified
        if (data.timeout) {
            const timeout = setTimeout(async () => {
                // Clean up listener
                if (this.responseListeners.has(executionId)) {
                    this.responseListeners.get(executionId)!();
                    this.responseListeners.delete(executionId);
                }

                await this.addLog(executionId, {
                    timestamp: new Date().toISOString(),
                    nodeId: node.id,
                    nodeName: data.label,
                    action: 'Response Timeout',
                    status: 'info',
                    message: 'Response timeout - continuing workflow',
                });

                // Send timeout message if specified
                if (data.timeoutMessage) {
                    await sendMessage(
                        execution.chatId,
                        execution.userId,
                        data.timeoutMessage,
                        'text'
                    );
                }

                await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
                    status: 'running' as WorkflowExecutionStatus,
                });

                await this.moveToNextNode(executionId, node.id, workflow);
                this.activeExecutions.delete(executionId);
            }, data.timeout);

            this.activeExecutions.set(executionId, timeout);
        }
    }

    /**
     * Listen for message responses in a chat
     */
    private listenForResponse(
        chatId: string,
        excludeUserId: string,
        callback: (response: string, messageId: string) => void
    ): () => void {
        const messagesRef = collection(db, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES);
        const q = query(messagesRef, where('senderId', '!=', excludeUserId));

        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const message = change.doc.data() as Message;
                    // Only process new messages (not historical)
                    const messageTime = new Date(message.timestamp).getTime();
                    const now = Date.now();
                    if (now - messageTime < 5000) { // Within last 5 seconds
                        callback(message.content, message.id);
                    }
                }
            });
        });
    }

    /**
     * Evaluate a condition
     */
    private evaluateCondition(data: ConditionNodeData, context: WorkflowExecutionContext): boolean {
        const variable = context[data.variable || 'lastResponse'] as string || '';
        const value = data.value;
        const caseSensitive = data.caseSensitive !== false;

        const varToCheck = caseSensitive ? variable : variable.toLowerCase();
        const valueToCheck = caseSensitive ? value : value.toLowerCase();

        switch (data.conditionType) {
            case 'contains':
                return varToCheck.includes(valueToCheck);
            case 'equals':
                return varToCheck === valueToCheck;
            case 'startsWith':
                return varToCheck.startsWith(valueToCheck);
            case 'endsWith':
                return varToCheck.endsWith(valueToCheck);
            case 'regex':
                try {
                    const regex = new RegExp(value, caseSensitive ? '' : 'i');
                    return regex.test(variable);
                } catch {
                    return false;
                }
            case 'custom':
                // For now, just do contains
                return varToCheck.includes(valueToCheck);
            default:
                return false;
        }
    }

    /**
     * Replace variables in text with values from execution context
     */
    private replaceVariables(text: string, context: Record<string, any>): string {
        return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return context[varName] !== undefined ? String(context[varName]) : match;
        });
    }

    /**
     * Find the start node (node without incoming edges)
     */
    private findStartNode(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode | null {
        const nodesWithIncoming = new Set(edges.map(e => e.target));
        return nodes.find(n => !nodesWithIncoming.has(n.id)) || null;
    }

    /**
     * Move to the next node in the workflow
     */
    private async moveToNextNode(
        executionId: string,
        currentNodeId: string,
        workflow: Workflow
    ): Promise<void> {
        // Find outgoing edge
        const edge = workflow.edges.find(e => e.source === currentNodeId && !e.sourceHandle);

        if (edge) {
            // Execute next node
            await this.executeNode(executionId, edge.target, workflow);
        } else {
            // No more nodes, complete execution
            await this.completeExecution(executionId);
        }
    }

    /**
     * Get execution details
     */
    private async getExecution(executionId: string): Promise<WorkflowExecution | null> {
        const executionDoc = await getDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId));
        if (!executionDoc.exists()) {
            return null;
        }

        const data = executionDoc.data();
        return {
            id: executionDoc.id,
            ...data,
            startedAt: data.startedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            completedAt: data.completedAt?.toDate?.()?.toISOString(),
        } as WorkflowExecution;
    }

    /**
     * Add a log entry to execution
     */
    private async addLog(executionId: string, log: ExecutionLog): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
            logs: arrayUnion(log),
        });
    }

    /**
     * Complete a workflow execution
     */
    private async completeExecution(executionId: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
            status: 'completed' as WorkflowExecutionStatus,
            completedAt: serverTimestamp(),
        });

        await this.addLog(executionId, {
            timestamp: new Date().toISOString(),
            nodeId: 'end',
            nodeName: 'Workflow End',
            action: 'Workflow completed successfully',
            status: 'success',
            message: 'Workflow execution completed',
        });

        // Clean up
        if (this.activeExecutions.has(executionId)) {
            clearTimeout(this.activeExecutions.get(executionId)!);
            this.activeExecutions.delete(executionId);
        }
        if (this.responseListeners.has(executionId)) {
            this.responseListeners.get(executionId)!();
            this.responseListeners.delete(executionId);
        }
    }

    /**
     * Fail a workflow execution
     */
    private async failExecution(executionId: string, error: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
            status: 'failed' as WorkflowExecutionStatus,
            completedAt: serverTimestamp(),
            error,
        });

        await this.addLog(executionId, {
            timestamp: new Date().toISOString(),
            nodeId: 'error',
            nodeName: 'Error',
            action: 'Workflow failed',
            status: 'error',
            message: `Workflow execution failed: ${error}`,
        });

        // Clean up
        if (this.activeExecutions.has(executionId)) {
            clearTimeout(this.activeExecutions.get(executionId)!);
            this.activeExecutions.delete(executionId);
        }
        if (this.responseListeners.has(executionId)) {
            this.responseListeners.get(executionId)!();
            this.responseListeners.delete(executionId);
        }
    }

    /**
     * Pause a workflow execution
     */
    async pauseExecution(executionId: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
            status: 'paused' as WorkflowExecutionStatus,
        });

        // Clean up active timers
        if (this.activeExecutions.has(executionId)) {
            clearTimeout(this.activeExecutions.get(executionId)!);
            this.activeExecutions.delete(executionId);
        }
    }

    /**
     * Cancel a workflow execution
     */
    async cancelExecution(executionId: string): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.WORKFLOW_EXECUTIONS, executionId), {
            status: 'cancelled' as WorkflowExecutionStatus,
            completedAt: serverTimestamp(),
        });

        // Clean up
        if (this.activeExecutions.has(executionId)) {
            clearTimeout(this.activeExecutions.get(executionId)!);
            this.activeExecutions.delete(executionId);
        }
        if (this.responseListeners.has(executionId)) {
            this.responseListeners.get(executionId)!();
            this.responseListeners.delete(executionId);
        }
    }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngineService();
