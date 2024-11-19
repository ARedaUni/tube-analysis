// import type { Config } from "tailwindcss";

// export default {
//     darkMode: ["class"],
//     content: [
//     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//   	extend: {
// 		screens:{
// 			'xs': '475px',
// 		},
// 		fontSize: {
// 			'2xs': '0.625rem', // Even smaller than xs for mobile
// 		  },
// 		  spacing: {
// 			'2xs': '0.125rem',
// 		  },
//   		colors: {
//   			background: 'hsl(var(--background))',
//   			foreground: 'hsl(var(--foreground))',
//   			card: {
//   				DEFAULT: 'hsl(var(--card))',
//   				foreground: 'hsl(var(--card-foreground))'
//   			},
//   			popover: {
//   				DEFAULT: 'hsl(var(--popover))',
//   				foreground: 'hsl(var(--popover-foreground))'
//   			},
//   			primary: {
//   				DEFAULT: 'hsl(var(--primary))',
//   				foreground: 'hsl(var(--primary-foreground))'
//   			},
//   			secondary: {
//   				DEFAULT: 'hsl(var(--secondary))',
//   				foreground: 'hsl(var(--secondary-foreground))'
//   			},
//   			muted: {
//   				DEFAULT: 'hsl(var(--muted))',
//   				foreground: 'hsl(var(--muted-foreground))'
//   			},
//   			accent: {
//   				DEFAULT: 'hsl(var(--accent))',
//   				foreground: 'hsl(var(--accent-foreground))'
//   			},
//   			destructive: {
//   				DEFAULT: 'hsl(var(--destructive))',
//   				foreground: 'hsl(var(--destructive-foreground))'
//   			},
//   			border: 'hsl(var(--border))',
//   			input: 'hsl(var(--input))',
//   			ring: 'hsl(var(--ring))',
//   			chart: {
//   				'1': 'hsl(var(--chart-1))',
//   				'2': 'hsl(var(--chart-2))',
//   				'3': 'hsl(var(--chart-3))',
//   				'4': 'hsl(var(--chart-4))',
//   				'5': 'hsl(var(--chart-5))'
//   			},
//   			sidebar: {
//   				DEFAULT: 'hsl(var(--sidebar-background))',
//   				foreground: 'hsl(var(--sidebar-foreground))',
//   				primary: 'hsl(var(--sidebar-primary))',
//   				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
//   				accent: 'hsl(var(--sidebar-accent))',
//   				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
//   				border: 'hsl(var(--sidebar-border))',
//   				ring: 'hsl(var(--sidebar-ring))'
//   			}
//   		},
//   		borderRadius: {
//   			lg: 'var(--radius)',
//   			md: 'calc(var(--radius) - 2px)',
//   			sm: 'calc(var(--radius) - 4px)'
//   		},
//   		keyframes: {
//   			'accordion-down': {
//   				from: {
//   					height: '0'
//   				},
//   				to: {
//   					height: 'var(--radix-accordion-content-height)'
//   				}
//   			},
//   			'accordion-up': {
//   				from: {
//   					height: 'var(--radix-accordion-content-height)'
//   				},
//   				to: {
//   					height: '0'
//   				}
//   			}
//   		},
//   		animation: {
//   			'accordion-down': 'accordion-down 0.2s ease-out',
//   			'accordion-up': 'accordion-up 0.2s ease-out'
//   		}
//   	}
//   },
//   plugins: [require("tailwindcss-animate")],
// } satisfies Config;



import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      fontSize: {
        "2xs": "0.625rem", // Smaller than xs for mobile
        "3xs": "0.5rem",   // Extra small for subtle text
      },
      spacing: {
        "2xs": "0.125rem",
        "3xs": "0.0625rem", // Very fine spacing
        "max": "max-content", // Maximum content fit
        "min": "min-content", // Minimum content fit
      },
      colors: {
        background: "hsl(var(--background, 0, 0%, 100%))", // Default white background
        foreground: "hsl(var(--foreground, 0, 0%, 0%))",   // Default black text
        card: {
          DEFAULT: "hsl(var(--card, 0, 0%, 98%))",
          foreground: "hsl(var(--card-foreground, 0, 0%, 10%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0, 0%, 95%))",
          foreground: "hsl(var(--popover-foreground, 0, 0%, 10%))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary, 210, 70%, 50%))",
          foreground: "hsl(var(--primary-foreground, 210, 70%, 95%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 160, 50%, 50%))",
          foreground: "hsl(var(--secondary-foreground, 160, 50%, 95%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 0, 0%, 80%))",
          foreground: "hsl(var(--muted-foreground, 0, 0%, 20%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 50, 100%, 50%))",
          foreground: "hsl(var(--accent-foreground, 50, 100%, 10%))",
        },
		
			success: {
			  DEFAULT: "hsl(var(--success, 120, 40%, 45%))", // Green
			  light: "hsl(var(--success-light, 120, 40%, 60%))",
			  dark: "hsl(var(--success-dark, 120, 40%, 30%))",
			},
			warning: {
			  DEFAULT: "hsl(var(--warning, 50, 100%, 50%))", // Yellow
			  light: "hsl(var(--warning-light, 50, 100%, 60%))",
			  dark: "hsl(var(--warning-dark, 50, 100%, 40%))",
			},
			destructive: {
			  DEFAULT: "hsl(var(--destructive, 0, 70%, 50%))", // Red
			  light: "hsl(var(--destructive-light, 0, 70%, 60%))",
			  dark: "hsl(var(--destructive-dark, 0, 70%, 40%))",
			},
			info: {
			  DEFAULT: "hsl(var(--info, 210, 70%, 50%))", // Blue
			  light: "hsl(var(--info-light, 210, 70%, 60%))",
			  dark: "hsl(var(--info-dark, 210, 70%, 40%))",
			},
		
        border: "hsl(var(--border, 0, 0%, 90%))",
        input: "hsl(var(--input, 0, 0%, 98%))",
        ring: "hsl(var(--ring, 210, 70%, 50%))",
        chart: {
          "1": "hsl(var(--chart-1, 120, 40%, 45%))", // Green
          "2": "hsl(var(--chart-2, 50, 100%, 50%))", // Yellow
          "3": "hsl(var(--chart-3, 0, 70%, 50%))",   // Red
          "4": "hsl(var(--chart-4, 210, 60%, 50%))", // Blue
          "5": "hsl(var(--chart-5, 280, 60%, 50%))", // Purple
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background, 0, 0%, 95%))",
          foreground: "hsl(var(--sidebar-foreground, 0, 0%, 20%))",
          primary: "hsl(var(--sidebar-primary, 210, 70%, 50%))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground, 210, 70%, 95%))",
          accent: "hsl(var(--sidebar-accent, 50, 100%, 50%))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground, 50, 100%, 10%))",
          border: "hsl(var(--sidebar-border, 0, 0%, 80%))",
          ring: "hsl(var(--sidebar-ring, 210, 70%, 50%))",
        },
      },
      borderRadius: {
        lg: "var(--radius, 0.5rem)",
        md: "calc(var(--radius, 0.5rem) - 2px)",
        sm: "calc(var(--radius, 0.5rem) - 4px)",
      },
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
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in",
        "fade-out": "fade-out 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
