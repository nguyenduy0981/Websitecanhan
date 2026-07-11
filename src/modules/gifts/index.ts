// Public API of the `gifts` module.
// Other modules must import only from this file — never reach into
// `src/modules/gifts/*` internals directly.

export {
  createGift,
  listGiftsForOwner,
  updateGift,
  deleteGift,
  publishGift,
} from "./service";

export { getGiftForOwner, assertEditable } from "./authorization";

export {
  getGiftForAdmin,
  listBlocksForAdmin,
  setGiftStatusForAdmin,
  countGiftsByStatus,
  type AdminStatusUpdate,
} from "./admin";

export { listBlocks, addBlock, updateBlock, deleteBlock, reorderBlocks } from "./blocks";

export {
  getGiftBySlug,
  listBlocksPublic,
  recordGiftView,
  classifyGiftForViewer,
  type ViewerDecision,
} from "./public";

export {
  createGiftSchema,
  updateGiftSchema,
  createBlockSchema,
  updateBlockSchema,
  reorderBlocksSchema,
  type CreateGiftInput,
  type UpdateGiftInput,
  type CreateBlockInput,
  type UpdateBlockInput,
  type ReorderBlocksInput,
} from "./schemas";
