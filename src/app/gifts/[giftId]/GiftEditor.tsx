"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { GiftStatus, GiftTier } from "@prisma/client";
import { giftStatusLabel } from "@/lib/gift-status-label";
import { THEMES, DEFAULT_THEME_ID, getTheme } from "@/config/themes";
import { EFFECTS, DEFAULT_EFFECT_ID } from "@/config/effects";

interface Block {
  id: string;
  type: string;
  position: number;
  content: { text?: string; mediaAssetId?: string; url?: string };
}

interface GiftData {
  id: string;
  slug: string;
  title: string;
  message: string;
  status: GiftStatus;
  tier: GiftTier;
  themeId: string | null;
  effectId: string | null;
}

const inputClass =
  "mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
const buttonClass =
  "rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function GiftEditor({
  gift,
  initialBlocks,
  appUrl,
  shareQrDataUrl,
  vipPriceVnd,
}: {
  gift: GiftData;
  initialBlocks: Block[];
  appUrl: string;
  shareQrDataUrl: string | null;
  vipPriceVnd: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment");
  const isEditable = gift.status === "DRAFT" || gift.status === "ACTIVE";

  const [title, setTitle] = useState(gift.title);
  const [message, setMessage] = useState(gift.message);
  const [status, setStatus] = useState<GiftStatus>(gift.status);
  const [vipCheckoutError, setVipCheckoutError] = useState<string | null>(null);
  const [vipCheckoutLoading, setVipCheckoutLoading] = useState(false);
  const [themeId, setThemeId] = useState(gift.themeId ?? DEFAULT_THEME_ID);
  const [effectId, setEffectId] = useState(gift.effectId ?? DEFAULT_EFFECT_ID);
  const [blocks, setBlocks] = useState(
    [...initialBlocks].sort((a, b) => a.position - b.position),
  );
  const [newBlockText, setNewBlockText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  const isFirstRender = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced autosave for title/message — skips the initial mount so
  // loading the page doesn't immediately fire a save.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isEditable) return;

    setSaveStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/gifts/${gift.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, message, themeId, effectId }),
        });
        setSaveStatus(res.ok ? "saved" : "error");
      } catch {
        setSaveStatus("error");
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, message, themeId, effectId]);

  async function addTextBlock() {
    if (!newBlockText.trim()) return;
    setActionError(null);
    const res = await fetch(`/api/gifts/${gift.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "TEXT", content: { text: newBlockText } }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error?.message ?? "Không thể thêm khối nội dung");
      return;
    }
    setBlocks((prev) => [...prev, data.block]);
    setNewBlockText("");
  }

  async function uploadImage(file: File) {
    setActionError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`/api/gifts/${gift.id}/media`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setActionError(uploadData.error?.message ?? "Không thể tải ảnh lên");
        return;
      }

      const blockRes = await fetch(`/api/gifts/${gift.id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "IMAGE", content: { mediaAssetId: uploadData.media.id } }),
      });
      const blockData = await blockRes.json();
      if (!blockRes.ok) {
        setActionError(blockData.error?.message ?? "Không thể thêm ảnh vào quà");
        return;
      }

      setBlocks((prev) => [
        ...prev,
        { ...blockData.block, content: { ...blockData.block.content, url: uploadData.media.url } },
      ]);
    } catch {
      setActionError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteBlock(blockId: string) {
    setActionError(null);
    const res = await fetch(`/api/gifts/${gift.id}/blocks/${blockId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error?.message ?? "Không thể xóa khối nội dung");
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }

  async function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;

    const reordered = [...blocks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved!);

    setActionError(null);
    const res = await fetch(`/api/gifts/${gift.id}/blocks/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedBlockIds: reordered.map((b) => b.id) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error?.message ?? "Không thể sắp xếp lại");
      return;
    }
    setBlocks(data.blocks);
  }

  async function publish() {
    setActionError(null);
    const res = await fetch(`/api/gifts/${gift.id}/publish`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error?.message ?? "Không thể xuất bản");
      return;
    }
    setStatus(data.gift.status);
  }

  async function deleteGift() {
    if (!window.confirm("Xóa quà nháp này? Không thể hoàn tác.")) return;
    const res = await fetch(`/api/gifts/${gift.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setActionError(data.error?.message ?? "Không thể xóa");
    }
  }

  async function startVipCheckout() {
    setVipCheckoutError(null);
    setVipCheckoutLoading(true);
    try {
      const res = await fetch(`/api/gifts/${gift.id}/vip-checkout`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setVipCheckoutError(data.error?.message ?? "Không thể tạo thanh toán");
        return;
      }
      // Full-page redirect to PayOS's hosted checkout — keeps card/bank
      // details entirely on PayOS's side. VIP itself only ever activates
      // via the server-side webhook, never from this redirect.
      window.location.href = data.checkout.checkoutUrl;
    } catch {
      setVipCheckoutError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setVipCheckoutLoading(false);
    }
  }

  const shareUrl = `${appUrl}/g/${gift.slug}`;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {giftStatusLabel(status)} · {gift.tier === "VIP" ? "VIP" : "Miễn phí"}
          </span>
          <span className="text-sm text-muted-foreground" role="status">
            {saveStatus === "saving" && "Đang lưu..."}
            {saveStatus === "saved" && "Đã lưu"}
            {saveStatus === "error" && "Lỗi khi lưu"}
          </span>
        </div>

        {paymentParam === "return" && (
          <p role="status" className="mb-4 rounded-md border p-3 text-sm">
            Thanh toán đang được xác nhận, có thể mất vài phút. Tải lại trang để kiểm tra trạng thái
            VIP.
          </p>
        )}
        {paymentParam === "cancelled" && (
          <p role="status" className="mb-4 rounded-md border p-3 text-sm">
            Bạn đã hủy thanh toán.
          </p>
        )}

        {gift.tier !== "VIP" && (
          <div className="mb-4">
            {vipCheckoutError && (
              <p role="alert" className="mb-2 rounded-md border border-red-500 p-3 text-sm text-red-600">
                {vipCheckoutError}
              </p>
            )}
            <button
              type="button"
              onClick={startVipCheckout}
              disabled={vipCheckoutLoading}
              className={buttonClass}
            >
              {vipCheckoutLoading
                ? "Đang tạo thanh toán..."
                : `Nâng cấp VIP (${vipPriceVnd.toLocaleString("vi-VN")}đ, +15 ngày)`}
            </button>
          </div>
        )}

        {actionError && (
          <p role="alert" className="mb-4 rounded-md border border-red-500 p-3 text-sm text-red-600">
            {actionError}
          </p>
        )}

        <label htmlFor="title" className="block text-sm font-medium">
          Tiêu đề
        </label>
        <input
          id="title"
          value={title}
          disabled={!isEditable}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />

        <label htmlFor="message" className="mt-4 block text-sm font-medium">
          Lời nhắn
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          disabled={!isEditable}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass}
        />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium">
              Giao diện
            </label>
            <select
              id="theme"
              value={themeId}
              disabled={!isEditable}
              onChange={(e) => setThemeId(e.target.value)}
              className={inputClass}
            >
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="effect" className="block text-sm font-medium">
              Hiệu ứng
            </label>
            <select
              id="effect"
              value={effectId}
              disabled={!isEditable}
              onChange={(e) => setEffectId(e.target.value)}
              className={inputClass}
            >
              {EFFECTS.map((effect) => (
                <option key={effect.id} value={effect.id}>
                  {effect.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-lg font-semibold">Nội dung</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {blocks.map((block, index) => (
            <li key={block.id} className="flex items-start justify-between gap-2 rounded-md border p-3">
              {block.type === "IMAGE" && block.content.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, not worth next/image config for V1
                <img
                  src={block.content.url}
                  alt="Ảnh trong quà"
                  className="h-24 w-24 flex-1 rounded object-cover"
                />
              ) : (
                <p className="flex-1 whitespace-pre-wrap text-sm">{block.content.text}</p>
              )}
              {isEditable && (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="Di chuyển lên"
                    disabled={index === 0}
                    onClick={() => moveBlock(index, -1)}
                    className={buttonClass}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Di chuyển xuống"
                    disabled={index === blocks.length - 1}
                    onClick={() => moveBlock(index, 1)}
                    className={buttonClass}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Xóa khối"
                    onClick={() => deleteBlock(block.id)}
                    className={buttonClass}
                  >
                    Xóa
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {isEditable && (
          <div className="mt-3">
            <label htmlFor="newBlock" className="block text-sm font-medium">
              Thêm đoạn văn bản
            </label>
            <textarea
              id="newBlock"
              rows={2}
              value={newBlockText}
              onChange={(e) => setNewBlockText(e.target.value)}
              className={inputClass}
            />
            <button type="button" onClick={addTextBlock} className={`${buttonClass} mt-2`}>
              + Thêm
            </button>

            <label htmlFor="imageUpload" className="mt-4 block text-sm font-medium">
              Thêm ảnh (JPEG/PNG/WebP/GIF, tối đa 10MB)
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file);
                e.target.value = "";
              }}
              className="mt-1"
            />
            {uploading && <p className="mt-1 text-xs text-muted-foreground">Đang tải ảnh lên...</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              Album nhiều ảnh sẽ có ở bản cập nhật sau.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {status === "DRAFT" && (
            <>
              <button type="button" onClick={publish} className={buttonClass}>
                Xuất bản
              </button>
              <button type="button" onClick={deleteGift} className={buttonClass}>
                Xóa quà nháp
              </button>
            </>
          )}
        </div>

        {status !== "DRAFT" && (
          <div className="mt-6 rounded-md border p-3">
            <p className="text-sm font-medium">Link chia sẻ</p>
            <p className="break-all text-sm text-muted-foreground">{shareUrl}</p>
            {shareQrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- small server-generated data URL, not worth next/image's overhead
              <img
                src={shareQrDataUrl}
                alt={`Mã QR dẫn đến ${shareUrl}`}
                width={160}
                height={160}
                className="mt-3"
              />
            )}
          </div>
        )}
      </section>

      <section
        aria-label="Xem trước"
        className={`rounded-md border p-4 ${getTheme(themeId).containerClassName}`}
      >
        <h2 className="mb-3 text-lg font-semibold">Xem trước</h2>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 whitespace-pre-wrap">{message}</p>
        <div className="mt-4 flex flex-col gap-3">
          {blocks.map((block) =>
            block.type === "IMAGE" && block.content.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, not worth next/image config for V1
              <img
                key={block.id}
                src={block.content.url}
                alt="Ảnh trong quà"
                className="w-full rounded object-cover"
              />
            ) : (
              <p key={block.id} className="whitespace-pre-wrap">
                {block.content.text}
              </p>
            ),
          )}
        </div>
        {effectId !== "none" && (
          <p className="mt-4 text-xs opacity-70">
            {`Hiệu ứng “${EFFECTS.find((e) => e.id === effectId)?.name}” sẽ hiện khi người nhận mở quà.`}
          </p>
        )}
      </section>
    </div>
  );
}
