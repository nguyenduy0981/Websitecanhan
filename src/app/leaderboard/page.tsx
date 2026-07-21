import type { Metadata } from "next";
import { LeaderboardInteractive } from "@/vo-tri/leaderboard";
import { Container } from "@/vo-tri/shell";

export const metadata: Metadata = {
  title: "Xếp Hạng — VÔ TRI",
  description: "Ai vô tri nhất tuần này?",
};

export default function LeaderboardPage() {
  return (
    <Container className="flex flex-col gap-6 py-8">
      <LeaderboardInteractive />
    </Container>
  );
}
