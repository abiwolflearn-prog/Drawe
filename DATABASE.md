# DATABASE DESIGN

## User
- _id
- name
- phone
- email
- telegramUserId
- role
- status
- language ("am" | "en", default "am")
- createdAt
- updatedAt

## Draw
- _id
- drawNumber
- title
- status
- numberFrom
- numberTo
- pricePerNumber
- maxSelectionsPerPlayer
- startAt
- closeAt
- winnerNumber
- resultPublishedAt
- createdAt
- updatedAt

## DrawNumber
- _id
- drawId
- number
- status
- selectedBy
- reservationExpiresAt
- confirmedAt

Unique constraint: drawId + number.

## Selection
- _id
- drawId
- playerId
- numbers[]
- totalAmount
- status
- paymentId
- createdAt
- updatedAt

## Payment
- _id
- playerId
- drawId
- selectionId
- amount
- method
- transactionReference
- screenshotUrl
- status
- verifiedBy
- verifiedAt
- rejectionReason
- createdAt

## Winner
- _id
- drawId
- number
- playerId
- prizeAmount
- status
- createdAt

## AuditLog
- _id
- actorId
- action
- entityType
- entityId
- metadata
- ip
- createdAt

Never delete financial/audit records silently.
