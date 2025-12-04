/**
 * API utilities for protocol operations
 */

export interface ProtocolStep {
  id: string;
  type: "step" | "note" | "measurement";
  content: string;
  order: number;
}

export interface ProtocolUpdatePayload {
  protocol: {
    steps: ProtocolStep[];
  };
  version: number;
  notes?: string;
}

/**
 * Update protocol with autosave
 */
export async function updateProtocol(
  experimentId: string,
  protocol: { steps: ProtocolStep[] },
  version: number,
  token: string,
  notes?: string
): Promise<{ success: boolean; newVersion?: number; error?: string }> {
  try {
    const response = await fetch(`/api/experiments/${experimentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        protocol: {
          steps: protocol.steps,
        },
        version,
        notes,
      } as ProtocolUpdatePayload),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "Failed to update protocol",
      };
    }

    const data = await response.json();
    return {
      success: true,
      newVersion: data.experiment?.version,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Get protocol from experiment
 */
export async function getProtocol(
  experimentId: string,
  token: string
): Promise<{ protocol: ProtocolStep[]; version: number } | null> {
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
    const experiment = data.experiment;

    // Extract protocol steps from experiment
    if (
      experiment.protocol?.steps &&
      Array.isArray(experiment.protocol.steps)
    ) {
      return {
        protocol: experiment.protocol.steps,
        version: experiment.version || 1,
      };
    }

    return {
      protocol: [],
      version: experiment.version || 1,
    };
  } catch (error) {
    console.error("Error fetching protocol:", error);
    return null;
  }
}
