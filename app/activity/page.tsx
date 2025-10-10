import { ActivityView } from "@/components/views/activity-view";

export const metadata = {
  title: "Activity",
  description: "Your recent activity on FRAMP — transactions, deposits, and on-ramp history.",
  openGraph: {
    title: "Activity | FRAMP",
    description: "Your recent activity on FRAMP — transactions, deposits, and on-ramp/off-ramp history.",
  },
};

export default function ActivityPage() {
  return <ActivityView />;
}
