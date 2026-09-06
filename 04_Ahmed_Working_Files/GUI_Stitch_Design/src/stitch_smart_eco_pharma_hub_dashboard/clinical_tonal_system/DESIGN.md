---
name: Clinical Tonal System
colors:
  surface: '#f9f9f8'
  surface-dim: '#d9dad9'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f2'
  surface-container: '#edeeec'
  surface-container-high: '#e8e8e7'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#3d4946'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f0f1ef'
  outline: '#6d7a76'
  outline-variant: '#bcc9c5'
  surface-tint: '#006b5d'
  primary: '#00685b'
  on-primary: '#ffffff'
  primary-container: '#008373'
  on-primary-container: '#f4fffb'
  inverse-primary: '#64dac4'
  secondary: '#4f625f'
  on-secondary: '#ffffff'
  secondary-container: '#d2e7e3'
  on-secondary-container: '#556865'
  tertiary: '#475e76'
  on-tertiary: '#ffffff'
  tertiary-container: '#607790'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#82f6e0'
  primary-fixed-dim: '#64dac4'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#005046'
  secondary-fixed: '#d2e7e3'
  secondary-fixed-dim: '#b6cbc7'
  on-secondary-fixed: '#0c1f1c'
  on-secondary-fixed-variant: '#384a48'
  tertiary-fixed: '#cfe5ff'
  tertiary-fixed-dim: '#b1c9e4'
  on-tertiary-fixed: '#021d32'
  on-tertiary-fixed-variant: '#324960'
  background: '#f9f9f8'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 57px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0.15px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.5px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.25px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
  compact-padding: 8px
  default-padding: 16px
---

## Brand & Style
The design system establishes a high-trust, systematic environment tailored for pharmacy operations. It adopts the **Corporate / Modern** aesthetic of Material 3, focusing on "Material You" logic where color is derived from a central seed to ensure harmonic tonal relationships.

The personality is clinical, precise, and efficient. It minimizes visual noise to reduce cognitive load in high-stakes medical environments. The interface uses tonal layering rather than heavy shadows to denote hierarchy, creating a "breathable" but information-dense workspace. The emotional response is one of calm reliability and technical proficiency.

## Colors
The palette is anchored by a medical Teal (#0B9D8A), providing a sense of hygiene and vitality. 

- **Primary Tones:** Used for key actions and active states. 
- **Tonal Containers:** Use low-chroma versions of the primary color for large surface areas (e.g., card backgrounds or sidebar highlights).
- **Slate Neutrals:** All non-tonal surfaces utilize a Slate-based neutral palette to maintain a cool, professional temperature.
- **Tonal Spots:** Use vibrant Primary spots for status indicators (e.g., "Ready for Pickup") to draw the eye without disrupting the layout flow.

## Typography
The system utilizes **Plus Jakarta Sans** for headlines (as a modern, approachable alternative to Google Sans) and **Inter** for functional UI and body text to ensure maximum legibility at high densities.

- **Headlines:** Reserved for page titles and major section headers.
- **Titles:** Used for card headers and modal titles.
- **Body:** Standard for patient notes, descriptions, and clinical data.
- **Labels:** Essential for form fields, button text, and small metadata. All labels use the "Inter" font with medium weight to ensure they remain legible even when small.

## Layout & Spacing
This design system employs a **Fluid Grid** model optimized for high-density pharmacy dashboards. It uses a base 4px increment system.

- **Desktop:** 12-column grid, 24px margins, 16px gutters.
- **Tablet:** 8-column grid, 16px margins, 16px gutters.
- **Mobile:** 4-column grid, 16px margins, 12px gutters.

The layout philosophy prioritizes "Information Density Level 1" for patient lists (compact rows) and "Level 2" for patient profiles (expanded cards). Vertical spacing between related components should be tight (8-12px) to keep clinical context visible on one screen.

## Elevation & Depth
Elevation is expressed through **Tonal Layers** and color shifts rather than traditional drop shadows.

- **Level 0 (Surface):** The background layer, using a very light Slate neutral.
- **Level 1 (Surface Container Low):** Standard container for sidebar or background navigation elements.
- **Level 2 (Surface Container):** Default card elevation. Uses a subtle tonal shift or a 1px border in a slightly darker neutral.
- **Level 3 (Surface Container High):** Used for active dialogs or elements that require immediate attention (e.g., prescription alerts).

Shadows, if used, are extremely soft (blur 8px, opacity 4%) and tinted with the Primary Teal color to integrate them into the tonal system.

## Shapes
The shape language follows Material 3's "Extra Rounded" philosophy to soften the clinical nature of the app.

- **Containers/Cards:** 12px corner radius (Rounded-LG).
- **Buttons/Chips:** Fully pill-shaped (Maximum radius).
- **Input Fields:** 8px corner radius to provide a structural distinction from action-oriented pill shapes.
- **Data Tables:** Outer containers should have 12px rounding, while internal row selections remain square to indicate continuity.

## Components
- **Buttons:** Primary buttons are pill-shaped, filled with the Primary color. Secondary buttons use an outlined pill shape with a 1px stroke.
- **Chips:** Used for medication categories or patient statuses. These are always pill-shaped with a "Tonal" background (a desaturated, lighter version of the category color).
- **Lists:** High-density rows with 8px internal padding. Use a subtle divider (1px, Slate-100) between items.
- **Input Fields:** Filled style with a bottom-line indicator or fully outlined. Labels should float on focus as per Material 3 standards.
- **Cards:** 12px rounded corners. Use a "Tonal Container" color for the card background to distinguish between different types of information (e.g., "Active Prescriptions" card might have a very light teal tint).
- **Checkboxes/Radios:** Circular containers for radio buttons; 4px rounded squares for checkboxes. 
- **Prescription Badges:** Distinct, high-contrast "Tonal Spots" used for urgent alerts, utilizing the Tertiary color (Slate-Blue) to differentiate from standard Primary actions.