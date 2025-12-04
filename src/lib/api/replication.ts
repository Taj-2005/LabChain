/**
 * API utilities for replication tracking
 */

export interface ReplicationAttempt {
  attemptId: string;
  experimenter: {
    _id: string;
    name: string;
    email: string;
  };
  startedAt: string | Date;
  completedAt?: string | Date;
  results?: Record<string, unknown>;
  notes?: string;
}

export interface StartReplicationPayload {
  replicationAttempt: {
    attemptId?: string;
    startedAt?: string;
    notes?: string;
    results?: Record<string, unknown>;
  };
}

export interface UpdateReplicationPayload {
  replicationAttempt: {
    attemptId: string;
    completedAt?: string;
    notes?: string;
    results?: Record<string, unknown>;
  };
}

/**
 * Start a new replication attempt
 */
export async function startReplication(
  experimentId: string,
  token: string,
  notes?: string
): Promise<{ success: boolean; attemptId?: string; error?: string }> {
  try {
    const response = await fetch(`/api/experiments/${experimentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        replicationAttempt: {
          attemptId: `attempt-${Date.now()}`,
          startedAt: new Date().toISOString(),
          notes,
        },
      } as StartReplicationPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "Failed to start replication",
      };
    }

    const data = await response.json();
    // Extract the last replication attempt ID
    const attempts = data.experiment?.replicationAttempts || [];
    const lastAttempt = attempts[attempts.length - 1];

    return {
      success: true,
      attemptId: lastAttempt?.attemptId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Update an existing replication attempt
 */
export async function updateReplication(
  experimentId: string,
  attemptId: string,
  updates: {
    completedAt?: string;
    notes?: string;
    results?: Record<string, unknown>;
  },
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/experiments/${experimentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        replicationAttempt: {
          attemptId,
          ...updates,
        },
      } as UpdateReplicationPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "Failed to update replication",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Get all replication attempts for an experiment
 */
export async function getReplications(
  experimentId: string,
  token: string
): Promise<ReplicationAttempt[] | null> {
  try {
    const response = await fetch(`/api/experiments/${experimentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.experiment?.replicationAttempts || [];
  } catch (error) {
    console.error("Error fetching replications:", error);
    return null;
  }
}
