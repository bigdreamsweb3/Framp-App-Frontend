export type WalletMethod = {
  id: string;
  type: "wallet";
  name: string;
  details?: string;
  accountName: string; // required string to match other components
  isDefault?: boolean;
  walletAddress: string;
  network?: string;
};