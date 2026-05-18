import { Suspense } from "react";

import { PlayAiClient } from "./PlayAiClient";

export default function PlayAiPage() {
  return (
    <Suspense>
      <PlayAiClient />
    </Suspense>
  );
}
