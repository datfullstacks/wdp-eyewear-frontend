import apiClient from "./client";

export interface SystemConfig {
  id: string;
  key: string;
  featureFlags: {
    preorderEnabled: boolean;
    splitPaymentEnabled: boolean;
    refundWorkflowEnabled: boolean;
    managerPolicyEditorEnabled: boolean;
  };
  payments: {
    payNowGateway: "sepay";
    codEnabled: boolean;
    supportedPayNowMethods: string[];
  };
  shipping: {
    defaultCarrier: "ghn";
    ghnEnabled: boolean;
    allowEstimatedShippingFee: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
  refunds: {
    staffApprovalLimit: number;
    requiresManagerForReturn: boolean;
    requiresManagerForShippingRefund: boolean;
    requirePayoutProof: boolean;
  };
  integrations: {
    sepay: { enabled: boolean };
    ghn: { enabled: boolean };
  };
  maintenanceMode: boolean;
  updatedAt?: string;
}

export interface RuntimeSystemConfig {
  featureFlags: {
    preorderEnabled: boolean;
    splitPaymentEnabled: boolean;
    refundWorkflowEnabled: boolean;
    managerPolicyEditorEnabled: boolean;
  };
  payments: {
    codEnabled: boolean;
  };
  shipping: {
    ghnEnabled: boolean;
    allowEstimatedShippingFee: boolean;
  };
  maintenanceMode: boolean;
}

function extractData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && (payload as any).data) {
    return (payload as any).data as T;
  }

  return payload as T;
}

export const systemConfigApi = {
  async get() {
    const response = await apiClient.get("/api/system-config");
    return extractData<SystemConfig>(response.data);
  },

  async getRuntime() {
    const response = await apiClient.get("/api/system-config/runtime");
    return extractData<RuntimeSystemConfig>(response.data);
  },

  async update(input: Partial<SystemConfig>) {
    const response = await apiClient.put("/api/system-config", input);
    return extractData<SystemConfig>(response.data);
  },
};

export default systemConfigApi;
