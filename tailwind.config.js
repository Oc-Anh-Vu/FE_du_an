import defaultTheme from "tailwindcss/defaultTheme";

const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: { DEFAULT: token("card"), foreground: token("card-foreground") },
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
          hover: token("primary-hover"),
          strong: token("primary-strong"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
          hover: token("secondary-hover"),
        },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground") },
        highlight: { DEFAULT: token("highlight"), foreground: token("highlight-foreground") },
        "surface-dark": {
          DEFAULT: token("surface-dark"),
          foreground: token("surface-dark-foreground"),
        },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        success: {
          DEFAULT: token("success"),
          foreground: token("success-foreground"),
          soft: token("success-soft"),
          "soft-foreground": token("success-soft-foreground"),
        },
        warning: {
          DEFAULT: token("warning"),
          foreground: token("warning-foreground"),
          soft: token("warning-soft"),
          "soft-foreground": token("warning-soft-foreground"),
        },
        danger: {
          DEFAULT: token("danger"),
          foreground: token("danger-foreground"),
          hover: token("danger-hover"),
          soft: token("danger-soft"),
          "soft-foreground": token("danger-soft-foreground"),
        },
        info: {
          DEFAULT: token("info"),
          foreground: token("info-foreground"),
          soft: token("info-soft"),
          "soft-foreground": token("info-soft-foreground"),
        },
        avatar: {
          purple: token("avatar-purple"),
          blue: token("avatar-blue"),
          pink: token("avatar-pink"),
          emerald: token("avatar-emerald"),
          amber: token("avatar-amber"),
          indigo: token("avatar-indigo"),
          orange: token("avatar-orange"),
          teal: token("avatar-teal"),
        },
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "3.75rem", letterSpacing: "-0.02em", fontWeight: "800" }],
        display: ["2.5rem", { lineHeight: "3rem", letterSpacing: "-0.01em", fontWeight: "900" }],
        "title-lg": ["2rem", { lineHeight: "2.5rem", letterSpacing: "-0.01em", fontWeight: "800" }],
        title: ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.01em", fontWeight: "800" }],
        heading: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "700" }],
        "heading-sm": ["1.125rem", { lineHeight: "1.625rem", fontWeight: "700" }],
        "body-lg": ["1rem", { lineHeight: "1.5rem" }],
        body: ["0.9375rem", { lineHeight: "1.5rem" }],
        "body-sm": ["0.875rem", { lineHeight: "1.25rem" }],
        caption: ["0.8125rem", { lineHeight: "1.125rem" }],
        overline: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.08em", fontWeight: "700" }],
        micro: ["0.6875rem", { lineHeight: "0.875rem", fontWeight: "700" }],
      },
      borderRadius: {
        control: "0.75rem",
        card: "1rem",
        panel: "1.5rem",
        section: "2rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(var(--color-foreground) / 0.06)",
        raised: "0 12px 32px -8px rgb(var(--color-foreground) / 0.18)",
        nav: "0 -4px 20px 0 rgb(var(--color-foreground) / 0.05)",
        cta: "0 10px 24px -6px rgb(var(--color-primary) / 0.35)",
      },
      zIndex: {
        sticky: "30",
        nav: "40",
        modal: "50",
        toast: "60",
        effects: "70",
      },
    },
  },
  plugins: [],
};