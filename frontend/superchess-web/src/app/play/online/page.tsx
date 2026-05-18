import { redirect } from "next/navigation";

import { DEFAULT_ONLINE_SETUP_HREF } from "@/features/game/setupRoutes";

export default function PlayOnlinePage() {
  redirect(DEFAULT_ONLINE_SETUP_HREF);
}
