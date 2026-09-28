# UnITS — UiTM Aduan ICT Knowledge Base
*Reference data for a future "answer UnITS tickets" skill*

UnITS (University IT Services) is UiTM's ICT complaint system. Fendy handles tickets as
**HEAD OF IT SERVICES** (A0300 - Jabatan Digital). This folder holds one `.md` file per
UnITS category with real complaint → answer pairs, so a skill can match a new ticket to a
known answer.

## Structure

```
units/
├── README.md                          ← system access, form fields, procedure (this file)
└── <category-slug>/                   ← one folder per UnITS category
    └── answer-patterns.md             ← answer patterns + ticket log for that category
```

Folder name = the UnITS category name in lowercase, with spaces and ` - ` turned into `-`
(e.g. `MOBILE APPS - MYSTUDENT` → `mobile-apps-mystudent`, `OPERASI - EMEL GOOGLE` → `operasi-emel-google`).

| Folder | Category in UnITS | Category ID |
|--------|-------------------|-------------|
| [mobile-apps-mystudent/](mobile-apps-mystudent/answer-patterns.md) | MOBILE APPS - MYSTUDENT | `39` |
| [sistem-hep/](sistem-hep/answer-patterns.md) | SISTEM - HEP | `31` |
| [sistem-hep-kebajikan/](sistem-hep-kebajikan/answer-patterns.md) | SISTEM - HEP (KEBAJIKAN) | `74` |
| [sistem-hep-nr-non-resident/](sistem-hep-nr-non-resident/answer-patterns.md) | SISTEM - HEP (NR-NON RESIDENT) | `84` |
| [sistem-hep-tatatertib/](sistem-hep-tatatertib/answer-patterns.md) | SISTEM - HEP (TATATERTIB) | `85` |
| [sistem-hep-zakat/](sistem-hep-zakat/answer-patterns.md) | SISTEM - HEP (ZAKAT) | `83` |
| [sistem-masmed2u/](sistem-masmed2u/answer-patterns.md) | SISTEM - MASMED2U | `113` |
| [sistem-nilams/](sistem-nilams/answer-patterns.md) | SISTEM - NILAMS | `64` |
| [sistem-myhep/](sistem-myhep/answer-patterns.md) | SISTEM - MYHEP (E-AKTIVITI) | `117` |

Source: 1,016 tickets answered by SAIFUL EFFENDY, 01/01/2026–30/09/2026.
The list page only shows open tickets by default. To see closed ones, search by Status
(Completed `110` / Verified `111` / Closed `112`).

Add a new folder per category as other systems are handled.

## System Access

- URL: `https://units.uitm.edu.my/` → Staff → **Google** sign-in (Fendy signs in himself; Claude never signs in)
- Aduan list: `https://units.uitm.edu.my/admin/index.cfm?modul=19&skrinID=1`
  - Filters: Ticket No, Complainant ID, Campus, Zone, Date Reported (range, required), Status, Role (required: `HEAD OF IT SERVICES`)
  - DataTable — set "records per page" to **All** to see every ticket
  - Columns: Bil, Ticket, Complainant (ID), Category, Sub Category, Campus/Zone, Details Aduan, Staf on Duty, Status, Action (Update / View)
- Update page (direct URL per ticket):
  `https://units.uitm.edu.my/admin/index.cfm?modul=19&skrinID=3&action=head2&tic=<TICKET_NO>`
- After submit, page reloads with `&a=u` and shows "Done! Data successfully saved."
  Verify via the **Aduan Status** and **Aduan Type** fields plus the new row in the Summary table.

## Update Form ("Head of IT Services Feedback")

| Label | Element id | Notes |
|-------|-----------|-------|
| Status* | `#newStatus` | select — see values below |
| Category* | `#a_kategori` | select2, pre-filled with ticket's category. Change only to rechannel |
| Remark* | `#cannedResponse` | select2 canned response; choosing one fills the textarea |
| (remark text) | `#remarkHeadZone` | textarea, max 1500 chars. This is the answer the student sees |
| Aduan Type* | `#aduantype` | select |
| Attachment | `#ADU_DOCUMENT` | optional, PDF/image ≤ 1MB |
| Submit | `#head2nd_btn` | submits and navigates |

### Status values (`#newStatus`)
| Value | Label |
|-------|-------|
| 103 | 2nd Level Maintenance |
| 104 | Vendor Maintenance |
| 107 | Aduan In Progress - by 2nd Level Support |
| 108 | Aduan forward to Branch / Campus / Zone |
| 113 | Aduan Rechannel to New Category for 1st Level Support |
| 109 | Aduan Rechannel to New Category for 2nd Level Support |
| 112 | Aduan Closed (Incomplete Information / Wrong Channel) |
| **110** | **Aduan Completed** ← used for answered tickets |

### Aduan Type values (`#aduantype`)
| Value | Label |
|-------|-------|
| 121 | Question |
| 120 | Services - Perkhidmatan |
| **122** | **Suggestion** ← Fendy's default when answering |
| 123 | Complaint - Aduan |
| 124 | None ICT Complaint |
| 125 | Change Request |

### Canned responses (`#cannedResponse`, value = full text)
1. `Lain-lain.` ← **pick this, then replace the textarea with the custom answer**
2. Mohon bantuan tuan/puan untuk tindakan selanjutnya.
3. Aduan telah diselesaikan… (asks the complainant to Verify under "Status Aduan ICT")
4. Aduan salah kategori. Mohon semakan kategori aduan semula.
5. Not ICT related → aduan.uitm.edu.my / fms.uitm.edu.my/eAduan
6. Maklumat tidak lengkap — mohon sertakan No. Pelajar / No. Pekerja
7. / 15. Log out via sidebar → log in with the new student ID; clear cache / change browser
8. New student account activation → Student Portal istudent.uitm.edu.my/index_isp.htm
9. No UHID ASNB — only for degree full-time students (Pendapatan & Penaja)
10. Past exam results closed → apply for a mini transcript at iStudent Portal
11. Semakan telah dibuat dan tindakan pembetulan telah dilaksanakan, mohon semak semula
12. Log out and log in with the new student number
13. Clear the app cache (Android/iPhone YouTube guides)
14. Token telah diperbaharui — log in and resubmit the health form (borang kesihatan)
16. Aduan tidak jelas — resubmit with details and a screenshot

## Automation Gate (check before answering anything)

Each category file carries, under its title:

```
**Automation Answer:** YES | NO
**Automation Scope:** E-AKTIVITI        ← optional; comma-separated sub categories
```

- `NO`, a missing line, or no category folder → **AI must not answer** tickets in that category. List them for Fendy instead.
- `YES` with no Scope line → every sub category may be answered.
- `YES` with a Scope line → only tickets whose Sub Category is listed may be answered. Hand the rest to Fendy.
- Toggle it from the dashboard: UNITS signboard → select a category → **AUTO** button.

## Standard Answer Procedure (as done 2026-09-28)

1. Open the Aduan list with Role = HEAD OF IT SERVICES and show All records
2. Filter rows by the target **Category** (e.g. MOBILE APPS - MYSTUDENT). **Apply the Automation Gate** and drop every ticket it doesn't allow
3. **Read each ticket's Details and match it to an answer pattern.** Never mass-apply one
   answer to a whole category — tickets in the same category ask different things
4. Tickets that match no known pattern → list them for Fendy and wait for his answer
5. Per ticket: Status `110` → Remark `Lain-lain.` → replace textarea with the answer →
   Aduan Type `122` → verify every field + ticket number → Submit
6. After submit, confirm Aduan Status = ADUAN COMPLETED and Aduan Type = SUGGESTION
7. Report: tickets closed, tickets skipped (with reason)

> Note: `form_input`/jQuery `.val().trigger('change')` works on the select2 fields.
> Clicking Submit navigates away. Trigger it via `setTimeout` so the JS call returns first.

## Privacy

The examples store ticket numbers, sub category and complaint text only. Names, emails,
phone numbers and student IDs are redacted (`<STUDENT_ID>` etc.).
