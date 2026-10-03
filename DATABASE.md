# DATABASE SCHEMAS & MODELS

## 1. Draw Model (`IDraw`)
```ts
{
  _id: string;
  tenantId: string;
  name: string;
  description?: string;
  capacity: number; // Configurable by Admin: Integer between 1 and 1000
  pricePerNumber: number; // Configured by Admin (ETB)
  currency: string; // Default "ETB"
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'DRAWING' | 'COMPLETED';
  prizes: [
    {
      position: number; // 1, 2, 3...
      label: string; // e.g. "1st Winner (🥇 1ኛ አሸናፊ)"
      amount: number; // Prize amount in ETB
      currency: string;
    }
  ];
  startAt: string;
  closeAt: string;
  drawAt?: string;
  serverSeedHash: string;
  serverSeed: string;
  winnerNumbers?: [
    { position: number; number: number; prizeAmount: number }
  ];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

## 2. Player Membership Model (`IPlayerMembership`)
```ts
{
  _id: string;
  playerId: string;
  tenantId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  assignedBy?: string;
  joinedAt: string;
  updatedAt: string;
}
```

## 3. Payment & Selection Record (`IPayment`)
```ts
{
  _id: string;
  playerId: string;
  playerName: string;
  tenantId: string;
  drawId: string;
  numbers: number[];
  unitPrice: number; // Price snapshot at time of selection
  amount: number; // Recalculated server-side: quantity * unitPrice
  method: 'TELEBIRR' | 'CBE_BIRR' | 'BANK_TRANSFER' | 'CHAPA' | 'CASH';
  transactionReference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verifiedBy?: string;
  createdAt: string;
}
```

## 4. Winner Model (`IWinner`)
```ts
{
  _id: string;
  tenantId: string;
  drawId: string;
  position: number; // 1st, 2nd, 3rd Winner
  label: string;
  number: number;
  formattedNumber: string; // Zero-padded e.g. "047", "0001"
  playerId: string;
  playerName: string;
  prizeAmount: number;
  currency: string;
  status: 'CLAIMED' | 'PAID';
  drawnAt: string;
}
```
