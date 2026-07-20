"use client";

import { useEffect } from "react";
import { Container } from "@/vo-tri/shell";
import { Button, ErrorState } from "@/vo-tri/ui";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[vo-tri] route error", error);
  }, [error]);

  return (
    <Container className="flex min-h-[70vh] items-center justify-center">
      <ErrorState action={<Button onClick={reset}>Thử lại xem</Button>} />
    </Container>
  );
}
