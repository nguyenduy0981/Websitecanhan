import { Mascot } from "@/vo-tri/ui/Mascot";
import { cn } from "@/vo-tri/lib/cn";
import type { CollectionItem, CollectionKind } from "./types";

const KIND_LABEL: Record<CollectionKind, string> = {
  skin: "Skin",
  title: "Danh hiệu",
  item: "Vật phẩm",
};

export function CollectionShowcase({ items }: { items: CollectionItem[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-vt-display text-lg font-bold text-vt-text-primary">Bộ sưu tập</h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-vt-lg border border-vt-border bg-vt-card py-10 text-center">
          <Mascot mood="idle" size="md" />
          <div>
            <p className="font-vt-display text-sm font-semibold text-vt-text-primary">Tủ đồ đang trống trơn</p>
            <p className="mt-1 max-w-xs text-sm text-vt-text-secondary">Skin, danh hiệu, vật phẩm — sẽ có đủ cả, sớm thôi.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-vt-lg border border-vt-border bg-vt-card p-3 text-center",
                !item.unlocked && "opacity-50",
              )}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-vt-full bg-vt-secondary/15 text-vt-secondary">
                <item.icon className="h-5 w-5" />
              </span>
              <p className="text-[11px] font-medium text-vt-text-primary">{item.name}</p>
              <p className="text-[10px] text-vt-text-secondary">{KIND_LABEL[item.kind]}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
