# DESIGN SYSTEM & INTERNATIONALIZATION

## Product character
Simple, trustworthy, fast, mobile-first, and full Amharic-first multilingual support.

## Default Language & Locales
- **Default Public & User Experience:** 🇪🇹 **Amharic (`am` / `am-ET`)**
- **Secondary Supported Language:** 🇬🇧 **English (`en` / `en-US`)**
- **Text Direction:** LTR (`direction = ltr`) for both Amharic and English.
- **Typography:** `Noto Sans Ethiopic` + `Plus Jakarta Sans` for high-fidelity Ge'ez Unicode rendering.

## Main visual concept
The 01–80 board is the primary interaction.

### Number states
- AVAILABLE — ክፍት
- SELECTED — የተመረጠ
- RESERVED — የተያዘ
- PAYMENT_PENDING — ክፍያ በሂደት ላይ
- CONFIRMED — የተረጋገጠ (የተያዘ)
- WINNER — አሸናፊ ቁጥር
- DISABLED — የማይሰራ

## Currency Format
- Amharic: `150 ብር`
- English: `150 ETB`

## Website layout
### Public
- Header with Language Selector (`🌐 አማርኛ / English`)
- Hero/current draw (`የአሁኑ ዕጣ`)
- Number board (`01–80`)
- How it works (`እንዴት ይሰራል?`)
- Previous results (`ውጤቶች`)
- FAQ
- Footer

### Player
- Dashboard (`የተጫዋች ዳሽቦርድ`)
- Active draw (`የአሁኑ ዕጣ`)
- My selections (`የእኔ ምርጫዎች`)
- Payment status (`የክፍያ ሁኔታ`)
- Results (`ውጤቶች`)
- Profile (`መገለጫ`)

### Admin
- Sidebar navigation
- Dashboard cards
- Active round panel
- Number board
- Pending payments queue
- Recent activity
- Reports
- Audit logs

## Mobile
The number board must remain easy to tap on a phone. Avoid tiny controls. Responsive grid (8x10 mobile, 10x8 desktop).
