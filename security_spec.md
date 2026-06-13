# Security Specification: Wedding RSVP Firestore Rules

## 1. Data Invariants
- **No Reads**: The list of RSVPs is private to protect guests' PII. General public/unauthenticated users must not read or list other guests' RSVPs.
- **Append-Only Creation**: Guest RSVPs can only be written (`create`) and cannot be modified (`update`) or removed (`delete`) by general public users once submitted.
- **Exact Schema Enforcement**: RSVPs must contain a non-empty `fullName` of maximum length to prevent resource injection, a valid `attendance` enum value (`YES`, `NO`, or `VISA`), event attendance map, and correct timestamps.
- **Size Bounds**: `fullName` must be string under 150 characters, `songRequest` under 200 characters, and `selectedEvents` map keys must be of limited length.

---

## 2. The "Dirty Dozen" Payloads (Exploit Attempts)

1. **Mass-Scrape Exploit (Identity/PII Leak)**
   - *Payload*: `GET /rsvps/`
   - *Intent*: Attempting to list all guest RSVPs to obtain name databases.
   - *Verdict*: `PERMISSION_DENIED`

2. **Poisonous Unicode Infiltration (Resource Jamming)**
   - *Payload*: `id: "invalid_chars_!!!", fullName: "A".repeat(10000)`
   - *Intent*: Attempting to inject a multi-megabyte string into the database.
   - *Verdict*: `PERMISSION_DENIED`

3. **Injected Status/Privilege Theft (Field Injection)**
   - *Payload*: `fullName: "Alice", attendance: "YES", isAdmin: true, bypass: "yes"`
   - *Intent*: Sending shadow fields outside the schema.
   - *Verdict*: `PERMISSION_DENIED`

4. **Illegal Enum Tampering (State Pollution)**
   - *Payload*: `fullName: "Bob", attendance: "SURE"`
   - *Intent*: Polluting the database with invalid status options.
   - *Verdict*: `PERMISSION_DENIED`

5. **Missing Chronology Stamp**
   - *Payload*: `fullName: "Bob", attendance: "YES", selectedEvents: { sangeet: true }`
   - *Intent*: Omitting required fields like `createdAt`.
   - *Verdict*: `PERMISSION_DENIED`

6. **Forged Timestamp / Backdated Submission**
   - *Payload*: `fullName: "Charlie", attendance: "YES", createdAt: "1999-01-01T00:00:00Z"`
   - *Intent*: Using custom client time instead of server timestamp.
   - *Verdict*: `PERMISSION_DENIED`

7. **Malicious Sibling Deletion (Sabotage)**
   - *Payload*: `DELETE /rsvps/someGuestId`
   - *Intent*: Attempting to delete someone else's RSVP.
   - *Verdict*: `PERMISSION_DENIED`

8. **Malicious State Override (Voter Spoofing)**
   - *Payload*: `UPDATE /rsvps/someGuestId with { attendance: "NO" }`
   - *Intent*: Overwriting an existing RSVP to sabotage.
   - *Verdict*: `PERMISSION_DENIED`

9. **Zero-Byte Name Spam**
   - *Payload*: `fullName: "", attendance: "YES"`
   - *Intent*: Sending a blank name.
   - *Verdict*: `PERMISSION_DENIED`

10. **Huge Event Payload (Array Exhaustion)**
    - *Payload*: `{ selectedEvents: { "spamField_1": true, "spamField_2": true, ... x100 } }`
    - *Intent*: Writing a massive nested object map.
    - *Verdict*: `PERMISSION_DENIED`

11. **ID Injection Poisoning**
    - *Payload*: `id: "some/nested/path/hack"`
    - *Intent*: Forging subcollection paths in the ID.
    - *Verdict*: `PERMISSION_DENIED`

12. **Null Field Crash Attack**
    - *Payload*: `fullName: null, attendance: null`
    - *Intent*: Sending null types to crash validation filters.
    - *Verdict*: `PERMISSION_DENIED`

---

## 3. Test Runner Design Code

```typescript
// firestore.rules.test.ts
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

// Tests confirm that unauthorized general public creation follows correct size limits and shapes, 
// and that reads, updates, and deletes are entirely locked down.
```
