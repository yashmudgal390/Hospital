import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Healing Teal Design System ──────────────────────────────
      colors: {
        // CSS var bridging for shadcn/ui compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── Brand tokens (used directly as Tailwind classes) ──
        teal: {
          50: "#f0fdfc",
          100: "#ccfbf7",
          200: "#99f6f0",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#12B5A0", // secondary / bright teal
          600: "#0B7B8A", // primary / deep teal
          700: "#0e7490",
          800: "#155e75",
          900: "#1A2E35", // text dark
          950: "#0c1a20",
        },
        brand: {
          primary: "#0B7B8A",
          secondary: "#12B5A0",
          amber: "#F59E0B",
          emergency: "#DC2626",
          bg: "#F8FFFE",
          surface: "#FFFFFF",
          text: "#1A2E35",
          muted: "#64748B",
          border: "#E0F2F1",
          success: "#16A34A",
        },
      },

      // ── Typography ──────────────────────────────────────────────
      fontFamily: {
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },

      // ── Border Radius ───────────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "12px",
        pill: "999px",
        input: "8px",
      },

      // ── Box Shadow ──────────────────────────────────────────────
      boxShadow: {
        card: "0 4px 24px rgba(11,123,138,0.10)",
        "card-hover": "0 8px 40px rgba(11,123,138,0.18)",
        button: "0 4px 14px rgba(18,181,160,0.35)",
        "button-hover": "0 6px 20px rgba(18,181,160,0.5)",
        dropdown: "0 8px 30px rgba(11,123,138,0.12)",
      },

      // ── Gradients ───────────────────────────────────────────────
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #0B7B8A, #12B5A0)",
        "gradient-brand-reverse": "linear-gradient(135deg, #12B5A0, #0B7B8A)",
        "gradient-hero": "linear-gradient(135deg, #0B7B8A 0%, #12B5A0 60%, #F8FFFE 100%)",
        "gradient-subtle": "linear-gradient(180deg, #F8FFFE 0%, #FFFFFF 100%)",
      },

      // ── Transition ──────────────────────────────────────────────
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        DEFAULT: "250ms",
      },

      // ── Animation ───────────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
