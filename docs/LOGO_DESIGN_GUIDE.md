# ShikshanAI Logo Design Guide

## Brand Overview

**Brand Name:** ShikshanAI (शिक्षण AI)
**Meaning:** "Shikshan" (शिक्षण) means "Education/Teaching" in Hindi/Sanskrit
**Tagline:** "Learn Smarter, Not Harder"
**Target Audience:** Indian K-12 students (Class 9-10), parents, and educators

---

## Brand Personality

| Attribute | Description |
|-----------|-------------|
| **Friendly** | Approachable for young students |
| **Intelligent** | AI-powered, smart learning |
| **Trustworthy** | Parents trust us with their children's education |
| **Modern** | Contemporary design, not outdated |
| **Indian** | Rooted in Indian education system (CBSE/NCERT) |
| **Playful** | Gamified learning experience |

---

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Indigo** | `#4F46E5` | Primary brand color, CTAs, headers |
| **Purple** | `#7C3AED` | Gradient accent, premium features |
| **White** | `#FFFFFF` | Backgrounds, text on dark |

### Secondary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Amber/Gold** | `#F59E0B` | XP, achievements, rewards |
| **Emerald** | `#10B981` | Success states, correct answers |
| **Orange** | `#F97316` | Streaks, energy, motivation |
| **Cyan** | `#06B6D4` | Science subject accent |
| **Rose** | `#F43F5E` | Errors, hearts/lives |

### Gradient

```css
/* Primary Gradient */
background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);

/* Alternative Gradient */
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);
```

---

## Logo Concepts

### Concept 1: "Enlightened Mind" (Recommended)

**Description:** A stylized lamp/diya (traditional Indian oil lamp) combined with a brain or lightbulb, representing the illumination of knowledge through AI.

**Elements:**
- Diya flame forming an abstract "S" shape
- Subtle circuit/neural network pattern in the flame
- Clean, modern typography for "ShikshanAI"

**Symbolism:**
- Diya = Traditional Indian education, wisdom
- Flame = Enlightenment, knowledge
- Circuit pattern = AI, technology
- "S" shape = ShikshanAI initial

**Visual Description:**
```
     🔥 (flame with circuit pattern)
    ╱  ╲
   ╱    ╲
  ╱______╲ (diya base)
  
  ShikshanAI
```

---

### Concept 2: "Knowledge Owl"

**Description:** A friendly, modern owl mascot with graduation cap, representing wisdom and learning.

**Elements:**
- Geometric/minimal owl face
- Graduation cap with indigo tassel
- Large, friendly eyes (one could have a subtle AI circuit pattern)
- Can be used as app icon and mascot

**Symbolism:**
- Owl = Wisdom, knowledge (also Lakshmi's vahana in Indian culture)
- Graduation cap = Academic achievement
- Friendly eyes = Approachable for children

**Visual Description:**
```
    ___
   /   \  (graduation cap)
  /_____\
   (◉)(◉)  (owl eyes - one with circuit)
     ▽
    /‾‾\
   
  ShikshanAI
```

---

### Concept 3: "Rising Star Student"

**Description:** An abstract student figure reaching for a star, with AI elements integrated.

**Elements:**
- Simplified human figure (student) in motion
- Star above representing goals/achievement
- Subtle book or device in hand
- Gradient from indigo to purple

**Symbolism:**
- Rising figure = Growth, aspiration
- Star = Goals, excellence
- Motion = Progress, journey

---

### Concept 4: "Neural Book"

**Description:** An open book with pages transforming into neural network connections.

**Elements:**
- Open book silhouette
- Pages flowing into connected nodes (neural network)
- Gradient colors flowing through connections
- Clean, tech-forward aesthetic

**Symbolism:**
- Book = Traditional learning, NCERT textbooks
- Neural network = AI-powered learning
- Flow = Knowledge transfer

---

## Typography

### Primary Font: Inter

**Usage:** Headlines, navigation, buttons
**Weights:** 600 (Semi-bold), 700 (Bold)

```css
font-family: 'Inter', sans-serif;
```

### Secondary Font: Plus Jakarta Sans

**Usage:** Body text, descriptions
**Weights:** 400 (Regular), 500 (Medium)

```css
font-family: 'Plus Jakarta Sans', sans-serif;
```

### Logo Typography

**"Shikshan"** - Bold, slightly rounded
**"AI"** - Same weight, different color (purple) or with tech styling

---

## Logo Variations

### 1. Full Logo (Horizontal)
- Icon + "ShikshanAI" text
- Use for: Website header, marketing materials
- Minimum width: 120px

### 2. Stacked Logo (Vertical)
- Icon above "ShikshanAI" text
- Use for: App splash screen, social media profile
- Minimum width: 80px

### 3. Icon Only (App Icon)
- Just the symbol/mascot
- Use for: App icon, favicon, small spaces
- Sizes needed: 16x16, 32x32, 48x48, 72x72, 96x96, 144x144, 192x192, 512x512

### 4. Wordmark Only
- Just "ShikshanAI" text
- Use for: When icon is already present, text-heavy contexts

---

## App Icon Specifications

### iOS Requirements
| Size | Scale | Pixels | Usage |
|------|-------|--------|-------|
| 20pt | @2x | 40x40 | Notification |
| 20pt | @3x | 60x60 | Notification |
| 29pt | @2x | 58x58 | Settings |
| 29pt | @3x | 87x87 | Settings |
| 40pt | @2x | 80x80 | Spotlight |
| 40pt | @3x | 120x120 | Spotlight |
| 60pt | @2x | 120x120 | App Icon |
| 60pt | @3x | 180x180 | App Icon |
| 1024pt | @1x | 1024x1024 | App Store |

### Android Requirements
| Size | Density | Usage |
|------|---------|-------|
| 48x48 | mdpi | Launcher |
| 72x72 | hdpi | Launcher |
| 96x96 | xhdpi | Launcher |
| 144x144 | xxhdpi | Launcher |
| 192x192 | xxxhdpi | Launcher |
| 512x512 | - | Play Store |

### PWA Requirements
- 192x192 (any)
- 512x512 (any)
- 192x192 (maskable - with safe zone padding)

---

## Logo Usage Guidelines

### Do's ✅
- Use on solid backgrounds (white, indigo, dark)
- Maintain aspect ratio when scaling
- Use provided color variations
- Keep minimum clear space (equal to height of "S" in logo)

### Don'ts ❌
- Don't stretch or distort
- Don't change colors outside brand palette
- Don't add effects (shadows, glows, 3D)
- Don't place on busy backgrounds
- Don't rotate the logo
- Don't use low-resolution versions

---

## Favicon Design

**Style:** Simplified version of main icon
**Colors:** Indigo (#4F46E5) on transparent or white background
**Format:** SVG (preferred), PNG, ICO

**Design:** Use the most recognizable element from the main logo:
- If using owl: Just the owl face
- If using diya: Just the flame
- If using abstract: The "S" mark

---

## Social Media Assets

### Profile Picture
- Square format (1:1)
- Icon-only version
- Works at small sizes (32x32 to 400x400)

### Cover/Banner
- Facebook: 820x312
- Twitter: 1500x500
- LinkedIn: 1128x191
- Full logo with tagline

### Story/Reel Format
- 1080x1920 (9:16)
- Centered logo with gradient background

---

## Competitive Analysis

| App | Logo Style | Colors | Notes |
|-----|-----------|--------|-------|
| BYJU'S | Wordmark | Purple/Pink | Bold, modern |
| Vedantu | Abstract V | Orange/Blue | Energetic |
| Unacademy | U symbol | Green | Simple, clean |
| Toppr | Abstract | Blue/Orange | Geometric |
| Duolingo | Owl mascot | Green | Friendly, memorable |
| Khan Academy | Leaf | Green | Educational, growth |

**Differentiation Strategy:**
- Use indigo/purple (less common in Indian edtech)
- Incorporate Indian cultural element (diya)
- Balance modern tech with traditional wisdom
- Friendly but not childish

---

## Implementation Checklist

### Immediate Needs
- [ ] App icon (all sizes)
- [ ] Favicon (16x16, 32x32, SVG)
- [ ] PWA icons (192x192, 512x512)
- [ ] Splash screen logo
- [ ] Header logo (horizontal)

### Marketing Needs
- [ ] Social media profile pictures
- [ ] Social media banners
- [ ] OG image for link previews (1200x630)
- [ ] Email signature logo
- [ ] Presentation template

### Future Needs
- [ ] Animated logo (for splash screen)
- [ ] Mascot character (if using owl concept)
- [ ] Merchandise designs
- [ ] Print materials

---

## Recommended Tools for Creation

1. **Figma** - Logo design, all variations
2. **Adobe Illustrator** - Vector logo, print-ready
3. **Canva** - Quick social media assets
4. **RealFaviconGenerator.net** - Generate all favicon sizes
5. **AppIcon.co** - Generate all app icon sizes

---

## File Deliverables

```
/brand/
├── logo/
│   ├── shikshanai-logo-full.svg
│   ├── shikshanai-logo-stacked.svg
│   ├── shikshanai-icon.svg
│   ├── shikshanai-wordmark.svg
│   └── png/
│       ├── logo-full-dark.png
│       ├── logo-full-light.png
│       └── ...
├── icons/
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   └── maskable-icon.png
├── social/
│   ├── og-image.png (1200x630)
│   ├── twitter-card.png
│   └── profile-picture.png
└── guidelines/
    └── brand-guidelines.pdf
```

---

## Next Steps

1. **Choose primary concept** (Recommend: Concept 1 "Enlightened Mind" or Concept 2 "Knowledge Owl")
2. **Create initial sketches** in Figma
3. **Refine chosen concept** with variations
4. **Generate all required sizes**
5. **Update app with new assets**
6. **Create brand guidelines PDF**

---

*Document Version: 1.0*
*Last Updated: December 2024*
