// lib/api/wallet-api.ts
import { App_Api_Base_Url } from "@/app/appConfig";

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

export class WalletAPI {
  static async addWallet(walletData: {
    name: string;
    walletAddress: string;
    network?: string;
  }): Promise<WalletMethod> {
    const response = await fetch(`${App_Api_Base_Url}/api/user/wallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      },
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
      headers: {
        "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      },
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
    // Your implementation
  }

  static async setDefaultWallet(id: string): Promise<void> {
    // Your implementation
  }
}
