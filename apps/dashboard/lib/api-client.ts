class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Action methods
  async retryPayment(id: string): Promise<any> {
    return this.post(`/payments/${id}/retry`);
  }

  async cancelSubscription(id: string): Promise<any> {
    return this.post(`/subscriptions/${id}/cancel`);
  }

  async fetchSubscriptions(): Promise<any> {
    return this.get("/subscriptions");
  }

  async getMetrics(): Promise<any> {
    return this.get("/metrics");
  }

  async getAlerts(): Promise<any> {
    return this.get("/alerts");
  }

  async fetchCustomers(): Promise<any> {
    return this.get("/customers");
  }
}

export const apiClient = new ApiClient();
