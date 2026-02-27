import { ApiCredential } from '../types';

/**
 * 统一的 API 客户端
 * 自动附加认证头
 */
class ApiClient {
  private credential: ApiCredential | null = null;

  setCredential(credential: ApiCredential) {
    this.credential = credential;
  }

  getCredential(): ApiCredential | null {
    return this.credential;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.credential) {
      return {};
    }
    return {
      'X-SMS4DEV-KEY': this.credential.accessKeyId,
      'X-SMS4DEV-SECRET': this.credential.accessKeySecret,
    };
  }

  async get<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
  }

  async post<T>(url: string, body: any): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
    return res.json();
  }

  async put<T>(url: string, body: any): Promise<T> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
    return res.json();
  }

  async delete<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
    return res.json();
  }
}

export const apiClient = new ApiClient();
