import Link from "next/link";
import { Container } from "@/vo-tri/shell";
import { Button, ErrorState } from "@/vo-tri/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center">
      <ErrorState
        title="Trang này đi lạc rồi"
        description="Có thể nó chưa từng tồn tại, hoặc đã vô tri bay mất đâu đó."
        action={
          <Button asChild variant="primary">
            <Link href="/">Về trang chủ</Link>
          </Button>
        }
      />
    </Container>
  );
}
