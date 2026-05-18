import { Suspense } from "react";

import { NewOnlineGameClient } from "./NewOnlineGameClient";

export default function NewOnlineGamePage() {
  return (
    <Suspense>
      <NewOnlineGameClient />
    </Suspense>
  );
}
