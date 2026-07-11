// Public API of the `analytics` module.
// Other modules must import only from this file — never reach into
// `src/modules/analytics/*` internals directly.

export { getGiftViewStats, recordAnalyticsEvent, type GiftViewStats } from "./stats";
