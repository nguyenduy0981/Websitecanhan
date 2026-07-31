import type { Metadata } from "next";
import { CourtInteractive } from "@/vo-tri/court";
import { getDailyDilemma } from "@/vo-tri/court/dilemmas";
import { Container, LoginButton } from "@/vo-tri/shell";
import { Mascot } from "@/vo-tri/ui";
import { getOptionalSession } from "@/vo-tri/server/session";
import * as courtService from "@/vo-tri/server/services/court-service";

export const metadata: Metadata = {
  title: "Toà Án Vô Tri — VÔ TRI",
  description: "Thách một người bạn, cùng trả lời một câu hỏi, để Toà tuyên án ai vô tri hơn.",
};

export default async function CourtPage() {
  const session = await getOptionalSession();
  const dilemma = getDailyDilemma();

  if (!session) {
    return (
      <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-4 py-12 text-center">
        <Mascot mood="thinking" size="xl" />
        <div>
          <h1 className="font-vt-display text-xl font-bold text-vt-text-primary">Toà chưa biết bạn là ai</h1>
          <p className="mt-2 max-w-sm text-sm text-vt-text-secondary">Đăng nhập để đưa bạn bè ra Toà — hoặc chờ bị đưa ra trước.</p>
        </div>
        <LoginButton size="lg" />
      </Container>
    );
  }

  const trialsResult = await courtService.listMyTrials(session.client, session.userId);

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-vt-display text-2xl font-bold text-vt-text-primary">Toà Án Vô Tri</h1>
        <p className="mt-1 text-sm text-vt-text-secondary">Nơi tình bạn được thử thách bằng những câu hỏi chẳng có đáp án đúng.</p>
      </div>
      <CourtInteractive trials={trialsResult.ok ? trialsResult.data : []} currentUserId={session.userId} dilemma={dilemma} />
    </Container>
  );
}
