# CORE WORKFLOW

OPEN DRAW
  ↓
PLAYER SELECTS NUMBER
  ↓
TEMPORARY RESERVATION
  ↓
PLAYER PAYS OPERATOR
  ↓
PLAYER SUBMITS PAYMENT REFERENCE
  ↓
ADMIN REVIEWS
  ├── REJECT → RELEASE NUMBER
  └── APPROVE → CONFIRM NUMBER
                    ↓
              DRAW CLOSES
                    ↓
              ELIGIBLE NUMBERS LOCKED
                    ↓
              RANDOM DRAW
                    ↓
              RESULT RECORDED
                    ↓
              WINNER NOTIFIED
                    ↓
              ROUND ARCHIVED

Important: the draw engine must operate on the server, not in the browser or Telegram client.
