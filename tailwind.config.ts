import type { Config } from "tailwindcss";

// VÔ TRI theme tokens live entirely under the `vt` namespace (colors,
// fontFamily, borderRadius, boxShadow, backdropBlur). Values read from
// src/vo-tri/design-system/tokens.css custom properties — see that file
// for the palette + verified contrast notes.
function vtColor(varName: string) {
  return `rgb(var(--vt-${varName}) / <alpha-value>)`;
}

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        vt: {
          bg: vtColor("bg"),
          surface: vtColor("surface"),
          card: vtColor("card"),
          border: vtColor("border"),
          divider: vtColor("divider"),
          "text-primary": vtColor("text-primary"),
          "text-secondary": vtColor("text-secondary"),
          "text-muted": vtColor("text-muted"),
          "on-accent": vtColor("on-accent"),
          primary: vtColor("primary"),
          secondary: vtColor("secondary"),
          success: vtColor("success"),
          warning: vtColor("warning"),
          danger: vtColor("danger"),
          info: vtColor("info"),
          reward: vtColor("reward"),
          xp: vtColor("xp"),
          vip: vtColor("vip"),
          // Already fully-resolved rgb()/alpha values (not R-G-B triplets),
          // unlike every color above — see tokens.css for why glass is a
          // one-off recipe rather than an opacity-composable token.
          glass: "var(--vt-glass-bg)",
          "glass-border": "var(--vt-glass-border)",
        },
      },
      fontFamily: {
        "vt-display": ["var(--vt-font-display)"],
        "vt-body": ["var(--vt-font-body)"],
      },
      borderRadius: {
        "vt-sm": "var(--vt-radius-sm)",
        "vt-md": "var(--vt-radius-md)",
        "vt-lg": "var(--vt-radius-lg)",
        "vt-xl": "var(--vt-radius-xl)",
        "vt-full": "var(--vt-radius-full)",
      },
      boxShadow: {
        "vt-1": "var(--vt-shadow-1)",
        "vt-2": "var(--vt-shadow-2)",
        "vt-3": "var(--vt-shadow-3)",
        "vt-4": "var(--vt-shadow-4)",
        "vt-glow-primary": "var(--vt-glow-primary)",
        "vt-glow-secondary": "var(--vt-glow-secondary)",
        "vt-glow-vip": "var(--vt-glow-vip)",
      },
      backdropBlur: {
        "vt-sm": "var(--vt-blur-sm)",
        "vt-md": "var(--vt-blur-md)",
        "vt-lg": "var(--vt-blur-lg)",
      },
      backgroundImage: {
        "vt-gradient-brand": "var(--vt-gradient-brand)",
        "vt-gradient-vip": "var(--vt-gradient-vip)",
      },
      // Motion-audit fix (Prompt 10): several components previously used
      // Tailwind's built-in duration-150/200/500/700 + ease-out utilities
      // for one-off transitions — the durations were close-but-not-equal
      // to the real tokens, and Tailwind's default `ease-out` bezier is a
      // *different* curve than our branded --vt-ease-out. These utilities
      // make the real tokens reachable as plain classes (duration-vt-fast
      // ease-vt-out) so every transition, not just keyframe animations,
      // shares one motion language.
      transitionDuration: {
        "vt-instant": "var(--vt-duration-instant)",
        "vt-fast": "var(--vt-duration-fast)",
        "vt-base": "var(--vt-duration-base)",
        "vt-slow": "var(--vt-duration-slow)",
        "vt-lazy": "var(--vt-duration-lazy)",
      },
      transitionTimingFunction: {
        "vt-out": "var(--vt-ease-out)",
        "vt-in-out": "var(--vt-ease-in-out)",
        "vt-spring": "var(--vt-ease-spring)",
        "vt-mischief": "var(--vt-ease-mischief)",
      },
    },
  },
  plugins: [],
};

export default config;
