import { notFound } from "next/navigation";
import { activities } from "@/vo-tri/explore/activities";
import { Container } from "@/vo-tri/shell";
import { PlayClient } from "./PlayClient";

export function generateStaticParams() {
  return activities.map((a) => ({ activityId: a.id }));
}

export default async function PlayPage({ params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = await params;
  const exists = activities.some((a) => a.id === activityId);
  if (!exists) notFound();

  return (
    <Container size="prose" className="py-8">
      <PlayClient activityId={activityId} />
    </Container>
  );
}
