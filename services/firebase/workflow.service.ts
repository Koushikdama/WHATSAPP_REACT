import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc,
    getDocs,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';
import { Workflow, WorkflowTrigger } from '../../types/workflow.types';

/**
 * Create a new workflow
 */
export const createWorkflow = async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        // Filter out undefined values (Firebase doesn't accept undefined)
        const workflowData: any = {
            userId: workflow.userId,
            name: workflow.name,
            description: workflow.description,
            nodes: workflow.nodes,
            edges: workflow.edges,
            trigger: workflow.trigger,
            isActive: workflow.isActive,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Only add chatId if it's defined
        if (workflow.chatId) {
            workflowData.chatId = workflow.chatId;
        }

        const workflowRef = await addDoc(collection(db, COLLECTIONS.WORKFLOWS), workflowData);
        return workflowRef.id;
    } catch (error) {
        console.error('Error creating workflow:', error);
        throw error;
    }
};

/**
 * Update an existing workflow
 */
export const updateWorkflow = async (workflowId: string, updates: Partial<Workflow>): Promise<void> => {
    try {
        const workflowRef = doc(db, COLLECTIONS.WORKFLOWS, workflowId);
        await updateDoc(workflowRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating workflow:', error);
        throw error;
    }
};

/**
 * Delete a workflow
 */
export const deleteWorkflow = async (workflowId: string): Promise<void> => {
    try {
        const workflowRef = doc(db, COLLECTIONS.WORKFLOWS, workflowId);
        await deleteDoc(workflowRef);
    } catch (error) {
        console.error('Error deleting workflow:', error);
        throw error;
    }
};

/**
 * Get a single workflow by ID
 */
export const getWorkflow = async (workflowId: string): Promise<Workflow | null> => {
    try {
        const workflowRef = doc(db, COLLECTIONS.WORKFLOWS, workflowId);
        const workflowDoc = await getDoc(workflowRef);

        if (!workflowDoc.exists()) {
            return null;
        }

        const data = workflowDoc.data();
        return {
            id: workflowDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Workflow;
    } catch (error) {
        console.error('Error getting workflow:', error);
        throw error;
    }
};

/**
 * Get all workflows for a user
 */
export const getUserWorkflows = async (userId: string): Promise<Workflow[]> => {
    try {
        const workflowsRef = collection(db, COLLECTIONS.WORKFLOWS);
        const q = query(
            workflowsRef,
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const workflows: Workflow[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            workflows.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as Workflow);
        });

        return workflows;
    } catch (error) {
        console.error('Error getting user workflows:', error);
        throw error;
    }
};

/**
 * Subscribe to user's workflows (real-time updates)
 */
export const subscribeToUserWorkflows = (
    userId: string,
    callback: (workflows: Workflow[]) => void
): (() => void) => {
    const workflowsRef = collection(db, COLLECTIONS.WORKFLOWS);
    const q = query(
        workflowsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const workflows: Workflow[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            workflows.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as Workflow);
        });

        callback(workflows);
    }, (error) => {
        console.error('Error subscribing to workflows:', error);
    });
};

/**
 * Get active workflows for a specific trigger type
 */
export const getActiveWorkflowsByTrigger = async (
    userId: string,
    triggerType: string
): Promise<Workflow[]> => {
    try {
        const workflowsRef = collection(db, COLLECTIONS.WORKFLOWS);
        const q = query(
            workflowsRef,
            where('userId', '==', userId),
            where('isActive', '==', true),
            where('trigger.type', '==', triggerType)
        );

        const snapshot = await getDocs(q);
        const workflows: Workflow[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            workflows.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as Workflow);
        });

        return workflows;
    } catch (error) {
        console.error('Error getting active workflows:', error);
        throw error;
    }
};

/**
 * Toggle workflow active status
 */
export const toggleWorkflowActive = async (workflowId: string, isActive: boolean): Promise<void> => {
    try {
        const workflowRef = doc(db, COLLECTIONS.WORKFLOWS, workflowId);
        await updateDoc(workflowRef, {
            isActive,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error toggling workflow active status:', error);
        throw error;
    }
};

/**
 * Get workflows for a specific chat
 */
export const getChatWorkflows = async (chatId: string): Promise<Workflow[]> => {
    try {
        const workflowsRef = collection(db, COLLECTIONS.WORKFLOWS);
        const q = query(
            workflowsRef,
            where('chatId', '==', chatId),
            where('isActive', '==', true)
        );

        const snapshot = await getDocs(q);
        const workflows: Workflow[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            workflows.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as Workflow);
        });

        return workflows;
    } catch (error) {
        console.error('Error getting chat workflows:', error);
        throw error;
    }
};
