"use client";

import { WalletView } from "@/components/views/wallet-view";
import React, { useState } from "react";
import type { WalletMethod } from "@/types/wallet";

export default function WalletPage() {
	const [selectedWallet, setSelectedWallet] = useState<WalletMethod | null>(null);

	// Safe no-op login handler — the global layout/root shell controls auth modal.
	const handleLogin = () => {
		// If you want this to open the auth modal, we can wire a handler through context or a prop from RootShell.
		return;
	};

	return (
		<div className="space-y-4">
			<div className="px-2">
				<h1 className="text-lg font-semibold">Wallets</h1>
				<p className="text-sm text-muted-foreground">Manage connected wallets and payment methods here.</p>
			</div>
			<WalletView
				onWalletSelect={setSelectedWallet}
				selectedWallet={selectedWallet}
				onLogin={handleLogin}
			// onClose={() => setActiveView("onramp")}
			/>
		</div>
	);
}
