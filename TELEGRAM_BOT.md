# TELEGRAM BOT

## Player commands
/start
/help
/draws
/my
/results
/support

## Example flow

/start
→ Welcome
→ Active draw
→ Select numbers
→ Confirm selection
→ Show amount
→ Show official payment instructions
→ Player submits payment reference
→ Pending verification
→ Admin approves/rejects
→ Bot sends status

## Inline keyboard
01 02 03 04 05
06 07 08 09 10
...
76 77 78 79 80

Buttons must reflect the current backend state.

## Security
Never trust Telegram callback data as proof of payment or ownership. Re-check authorization and current number state on the server.
