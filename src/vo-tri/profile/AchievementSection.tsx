import { Card, CardContent } from "@/vo-tri/ui/Card";
import { Mascot } from "@/vo-tri/ui/Mascot";
import type { Achievement } from "./types";

export function AchievementSection({ achievements }: { achievements: Achievement[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-vt-display text-lg font-bold text-vt-text-primary">Thành tích</h2>

      {achievements.length === 0 ? (
        <Card variant="default" className="flex flex-col items-center gap-3 py-10 text-center">
          <Mascot mood="sleepy" size="md" />
          <div>
            <p className="font-vt-display text-sm font-semibold text-vt-text-primary">Chưa có thành tích nào cả</p>
            <p className="mt-1 max-w-xs text-sm text-vt-text-secondary">
              Chưa sao, đi khám phá vài trò rồi quay lại đây khoe sau.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {achievements.map((a) => (
            <Card key={a.id} variant="elevated" padding="sm" className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-vt-full bg-vt-reward/15 text-vt-reward">
                <a.icon className="h-5 w-5" />
              </span>
              <CardContent className="flex flex-col gap-0.5 p-0">
                <p className="text-xs font-semibold text-vt-text-primary">{a.name}</p>
                <p className="text-[11px] text-vt-text-secondary">{a.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
