# DESIGN SYSTEM

## Product character
Simple, trustworthy, fast, mobile-first.

## Main visual concept
The 01–80 board is the primary interaction.

### Number states
- AVAILABLE — selectable
- SELECTED — current player's selection
- RESERVED — temporarily held
- PAYMENT_PENDING — awaiting verification
- SOLD/CONFIRMED — successfully verified
- WINNER — winning number
- DISABLED — unavailable

## Website layout
### Public
- Header
- Hero/current draw
- Number board
- How it works
- Previous results
- FAQ
- Footer

### Player
- Dashboard
- Active draw
- My selections
- Payment status
- Results
- Profile

### Admin
- Sidebar navigation
- Dashboard cards
- Active round panel
- Number board
- Pending payments
- Recent activity
- Reports

## Mobile
The number board must remain easy to tap on a phone. Avoid tiny controls. Use a responsive grid rather than an image of the original physical board.

## Design rule
Do not copy the photographed board as a raster image. Rebuild it as real UI components so states can update live.
