import type { Metadata } from "next";
import { ExploreFooter, ExploreHero, ExploreInteractive } from "@/vo-tri/explore";
import { Container } from "@/vo-tri/shell";

export const metadata: Metadata = {
  title: "Khám Phá — VÔ TRI",
  description: "Một góc nhỏ toàn trò vô nghĩa nhưng vui.",
};

export default function ExplorePage() {
  return (
    <Container className="flex flex-col gap-10 py-8">
      <ExploreHero />
      <ExploreInteractive />
      <ExploreFooter />
    </Container>
  );
}
