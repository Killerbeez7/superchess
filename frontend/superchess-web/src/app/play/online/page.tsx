import { redirect } from "next/navigation";

import { ONLINE_SETUP_HREF } from "@/features/game/setupRoutes";

export default function PlayOnlinePage() {
  redirect(ONLINE_SETUP_HREF);
}
