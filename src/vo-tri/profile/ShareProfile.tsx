import { ShareSheet } from "@/vo-tri/social/ShareSheet";

export function ShareProfile({ profileUrl }: { profileUrl: string }) {
  return <ShareSheet title="Khoe hồ sơ của bạn" description="Chia sẻ để bạn bè biết bạn vô tri cỡ nào." url={profileUrl} />;
}
