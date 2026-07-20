/** Minimal shape the shell needs to render a logged-in state. No auth exists yet — every consumer today passes `undefined` and gets the guest header/nav. */
export interface VoTriUser {
  name: string;
  avatarUrl?: string;
  points: number;
}
