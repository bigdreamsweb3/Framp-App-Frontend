// lib/api/wallet-api.ts
import { App_Api_Base_Url } from "@/app/appConfig";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

interface WalletMethod {
  id: string;
  type: "wallet";
  name: string;
  details: string;
  accountName: string;
  isDefault: boolean;
  walletAddress: string;
  network?: string;
}

// Helper function to get headers with authorization
const getHeaders = (): HeadersInit => {
  // Use Dynamic Labs token instead of localStorage
  const accessToken = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
  };

  // Add authorization header if accessToken exists
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

export class WalletAPI {
  static async addWallet(walletData: {
    name: string;
    walletAddress: string;
    network?: string;
  }): Promise<WalletMethod> {
    const response = await fetch(`${App_Api_Base_Url}/api/user/wallets`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add wallet");
    }

    return response.json();
  }

  static async getWallets(): Promise<WalletMethod[]> {
    const response = await fetch(`${App_Api_Base_Url}/api/user/wallets`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const status = response.status;
      let message = "Failed to fetch wallets";
      try {
        const body = await response.json();
        if (body?.error) message = body.error;
      } catch (e) {
        // ignore parse errors
      }
      const err: any = new Error(message);
      err.status = status;
      throw err;
    }

    return response.json();
  }

  static async deleteWallet(id: string): Promise<void> {
    const response = await fetch(`${App_Api_Base_Url}/api/user/wallets/`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete wallet");
    }

    return response.json();
  }

  static async setDefaultWallet(id: string): Promise<void> {
    const response = await fetch(`${App_Api_Base_Url}/api/user/wallets/default`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to set default wallet");
    }

    return response.json();
  }
}