export async function createOfframp(payload: any) {
  // Stubbed API: in production replace with real API call
  console.log("[offramp] createOfframp payload:", payload)
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300))
  return {
    data: {
      order_id: `sell_${Date.now()}`,
      status: payload.method === 'manual' ? 'awaiting_payment' : 'pending',
    },
  }
}
