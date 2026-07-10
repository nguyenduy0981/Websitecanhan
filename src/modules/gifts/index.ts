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

export { getGiftForOwner } from "./authorization";

export { listBlocks, addBlock, updateBlock, deleteBlock, reorderBlocks } from "./blocks";

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
