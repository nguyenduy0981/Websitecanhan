// Public API of the `media` module.
// Other modules must import only from this file — never reach into
// `src/modules/media/*` internals directly.

export {
  uploadImageForGift,
  assertMediaOwned,
  assertMediaListOwned,
  deleteMediaAsset,
  getMediaUrlsByIds,
  type UploadedMedia,
} from "./service";

export { publicUrlFor } from "./storage";
