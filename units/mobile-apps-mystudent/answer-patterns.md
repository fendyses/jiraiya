# MOBILE APPS - MYSTUDENT
*UnITS category ID `39` · Owner: Fendy (MyStudent developer, repo `/Applications/Sites/mystudentvue`)*

**Automation Answer:** YES

Known sub categories: `TIDAK DAPAT AKSES`, `LUPA KATALALUAN`, `OTHERS`.
Sub category is chosen by the student and is often wrong. **Classify by the Details text, not the sub category.**

Default submit settings for every answer below:
**Status** `110` Aduan Completed · **Remark** `Lain-lain.` (textarea replaced) · **Aduan Type** `122` Suggestion

---

## Answer Patterns

### A. `login-official-email` — cannot log in / account not found / wrong password
**Signals:** "tidak dapat akses", "tidak berjaya log masuk", "wrong password", "akaun tidak dapat dijumpai",
"tidak dapat mendaftar my student", mentions a Gmail/personal email, "student email", new UiTM Gmail not working.

**Answer:**
> Semakan mendapati data pelajar tersebut telah wujud didalam apps mystudent. Untuk login ke mystudent, mohon untuk menggunakan email rasmi uitm. Sekiranya menghadapi masalah untuk berhubung dengan email tersebut, mohon untuk membuat laporan kepada kategori - emel google.

**Why:** MyStudent logs in with the official UiTM Google account (`<studentid>@student.uitm.edu.my`).
The student's record already exists, so login problems come from the email account, which the
**OPERASI - EMEL GOOGLE** category handles.

**Before answering:** the answer claims the student's data exists. Ideally confirm the student ID in MyStudent
(Firestore `pelajar` / `mystudentlog`) first. On 2026-09-28 Fendy approved sending it without a per-ticket check.

### B. `timetable-local-network` — class timetable / class list / attendance not showing
**Signals:** "jadual kelas tidak muncul/dipaparkan", "nama tiada dalam class list", "attendance tidak dipaparkan",
"sudah daftar kursus tapi jadual tiada", "jadual rakan dah keluar tapi saya belum".

**Answer:**
> Setelah semakan dibuat, didapati jadual kelas berfungsi seperti biasa. Mohon untuk enablekan Local Network permission di browser untuk mystudent. Rujuk url https://support.cardintegrators.com/support/solutions/articles/72000654186-allowing-local-network-access-in-chrome untuk rujukan. Alternatifnya, boleh muat turun app Appswarga untuk melihat jadual waktu.

**Why:** Chrome's Local Network Access permission blocks the timetable request in the browser. The Appswarga app works as an alternative.

### C. `semester-display-only` — MyStudent shows the old semester
**Signals:** "mystudent tidak update bagi sem baru", semester shown is outdated.

**Answer:**
> Semester di mystudent adalah paparan sahaja. Data akan auto update setelah pihak HEA membuat penukaran semester semasa.

### D. `borang-c-old-semester` — cannot upload Borang C (older semester / deferred student)
**Signals:** "tiada laman untuk muat naik Borang C", penangguhan semester, cuti sakit, older intake.

**Answer:**
> Borang C mula diguna pakai sejak semester 20262. Bagi semester bawah dari itu, mohon untuk berhubung terus dengan pihak Pusat Kesihatan untuk submit borang C tersebut.

**Why:** The Borang C feature (`src/views/kesihatan/`) only exists for semester 20262 onwards.

*Patterns E–M below come from 854 past MyStudent tickets (Jan–Sep 2026) answered by Fendy.*

### E. `borang-c-token` — cannot upload/submit the health form (Borang C) · ~100 tickets
**Signals:** "tidak dapat upload/hantar borang kesihatan / borang C / medical checkup", "token expired".
**Action first:** renew the upload token, then reply.
> Token telah diperbaharui. Mohon utk login ke mystudent dan membuat penghantaran borang kesihatan semula.

If the database shows it was already submitted: `Semakan mendapati borang kesihatan telah berjaya dihantar`
If the Local Network permission is blocking it: use pattern B's wording with "borang pemeriksaan kesihatan" instead of "jadual kelas".

### F. `borang-c-new-intake-only` — no health form menu
**Signals:** "tiada menu/ikon borang kesihatan", "e-Health tidak dipaparkan", not a new student.
> Borang Kesihatan (Borang C) hanya diwajibkan untuk pelajar baharu (ambilan semester 20262).

Height rejected → `Mohon semak semula. Tinggi adalah didalam unit meter.`

### G. `uhid-asnb` — no field for the ASNB UHID number · ~75 tickets
**Signals:** "ruang isi UHID tiada", "no ASNB", "Celik Madani".
> No UHID ASNB hanya diwajibkan diisi oleh pelajar peringkat ijazah dan mempunyai study mode : Sepenuh Masa (tidak wajib bagi Sepenuh Masa Lebih Tempoh). Untuk mengisi, klik pada side button my student - Pendapatan & Penaja. Sekiranya tiada kolum No UHID ASNB tersebut, bermakna anda tidak diwajibkan untuk mengisi.

### H. `timetable-cache` — timetable not showing (clear-cache variant) · ~35 tickets
Alternative to B when the Local Network permission isn't the suspected cause.
> Semakan mendapati modul jadual waktu di MyStudent berfungsi seperti biasa. Mohon semak semula. Sila clearkan cache browser dan cuba semula sekiranya masih gagal.

### I. `card-photo` — photo missing or old on the digital card/profile · ~30 tickets
**Signals:** "gambar kad digital tak dipaparkan", "masih gambar lama".
> Semakan telah dibuat dan tindakan pembetulan telah dilaksanakan, Mohon semak semula

If nothing needed fixing: after an upload at kad.uitm.edu.my, the photo takes a few days to reach other systems, so clear the cache. Photos must be uploaded at **kad.uitm.edu.my**, not in MyStudent.

### J. `local-network` — eGL / pendapatan / MyENT / forms won't load or save
**Signals:** "eGL tidak boleh dibuka", "tak boleh tekan 'sini' pendapatan", dropdown empty, loading forever.
> Semakan mendapati [modul] berfungsi seperti biasa. Mohon clearkan cache browser dan cuba semula. Sila enablekan access Local Network di site setting browser seperti dilampiran.

(Attach the Local Network screenshot. eGL can also be opened in **AppsWarga**.)

### K. `exam-result-blocked` — cannot see the exam result
- Fine/fee paid but still blocked: `Semakan mendapati status pembayaran masih sedang diproses. Setelah bayaran dilakukan, sila tunggu 3-5 hari bekerja untuk proses pengesahan selesai.`
- No block found: `Semakan mendapati tiada sekatan pada page result. Mohon semak semula`
- SUFO not done: `Mohon selesaikan SUFO dan tunggu selama 1 jam untuk sistem mengemaskini status.`
- Past semester result: canned response #10 (mini transcript at iStudent)

### L. `personal-data-hea` — change alternate email / name / address / phone
> Untuk penukaran email alternatif atau butiran peribadi yang lain, mohon untuk berhubung terus dengan pihak HEA kampus cawangan/fakulti masing-masing.

Address wording (used 2026-09-28, e.g. wrong address in UPTA): `Untuk penukaran alamat atau butiran peribadi yang lain, mohon untuk berhubung terus dengan pihak HEA kampus cawangan/fakulti masing-masing.`

### M. `unofficial-app` — student uses a third-party app or domain
> Login mystudent hanya dibenarkan didomain yang sah sahaja (mystudent.uitm.edu.my). Sebarang domain dari itu disekat penggunaannya. Penggunaan 3rd party software untuk mengakses mystudent (mendapatkan maklumat jadual waktu dsb) adalah dilarang.

### N. `reset-password-rechannel` — student asks to reset their password · Fendy 2026-09-28
**Signals:** "reset password", "lupa kata laluan" with no other MyStudent issue.
**Not a Completed answer — rechannel it:**
- **Status** `109` Aduan Rechannel to New Category for 2nd Level Support
- **Category** `24` OPERASI - EMEL GOOGLE → **Sub Categories** `91` FORGOT PASSWORD (`#a_skategori` loads after the category changes)
- **Remark** canned #2 `Mohon bantuan tuan/puan untuk tindakan selanjutnya.` (unchanged)
- No Aduan Type field for this status

Use this rather than pattern A when the only request is a password reset. MyStudent stores no passwords; Emel Google owns resets.

### O. `non-resident-ehep` — cannot open / update Non-Resident in MyStudent · Fendy 2026-09-30
**Signals:** "tidak dapat akses bahagian Non-Resident", "kemaskini maklumat Non-Resident", NR page won't load.
> Sila gunakan sistem ehep untuk mengemaskini maklumat Non Resident.

### P. `borang-c-local-network` — cannot upload/submit Borang C (health form) · Fendy 2026-09-30
**Signals:** "tidak dapat upload/hantar borang kesihatan / borang C", "bahagian 6 ms5", upload fails.
**Fendy's preferred Borang C answer (2026-09-30)** — use this before E's token renewal.
> Setelah semakan dibuat, didapati borang pemeriksaan kesihatan berfungsi seperti biasa. Mohon untuk enablekan Local Network permission di browser untuk mystudent. Rujuk url https://support.cardintegrators.com/support/solutions/articles/72000654186-allowing-local-network-access-in-chrome untuk rujukan. Setelah aktifkan, cuba semula.

### Q. `profile-exists-login` — "profile tiada" / profile missing · Fendy 2026-09-30
**Signals:** "masalah profile tiada", profile blank or not found, vague profile complaint.
> Semakan mendapati profil pelajar telah wujud. Mohon untuk login semula menggunakan emel rasmi uitm

### Misc
- Wrong system (BKA bank account, ufuture, etc.) → canned #4 `Aduan salah kategori…`
- Vague complaint, no student ID → canned #6 or #16
- Graduated student → cannot access MyStudent; sponsorship/income data is locked to their study period

---

## Ticket Log (answered 2026-09-28 — all rows)

| Ticket | Sub Category | Details (redacted) | Pattern |
|--------|-------------|--------------------|---------|
| A20260927443888 | TIDAK DAPAT AKSES | Tidak berjaya akses walaupun id dan password sudah dimasukkan dengan betul. | A |
| A20260927501016 | TIDAK DAPAT AKSES | Baru aktifkan akaun GMail UiTM, tetapi tidak dapat log masuk ke myStudent menggunakan e-mel tersebut (`<STUDENT_ID>@student.uitm.edu.my`). | A |
| A20260927041795 | TIDAK DAPAT AKSES | Kata laluan betul tetapi tidak dapat akses mystudent sahaja; email boleh guna di ufuture & myhep. Mahu kata laluan baharu untuk isi Borang C. | A |
| A20260926324443 | LUPA KATALALUAN | Cuba sign in beberapa kali, keluar "wrong password" walaupun tidak pernah tukar password. | A |
| A20260926485932 | TIDAK DAPAT AKSES | Tidak dapat mendaftar my student. | A |
| A20260925262465 | TIDAK DAPAT AKSES | Cuba sign in mystudent tetapi tertera "account anda tidak dapat dijumpai". | A |
| A20260925206282 | TIDAK DAPAT AKSES | "Rujuk attachment yang diberikan" (attachment not opened). | A |
| A20260925294425 | TIDAK DAPAT AKSES | Tidak boleh menggunakan student email untuk (log masuk) … | A |
| A20260928435646 | TIDAK DAPAT AKSES | Nama tiada dalam class list walaupun sudah daftar; jadual kelas tak dapat diakses; attendance tidak dipaparkan. | B |
| A20260928184653 | OTHERS | Jadual kelas di Mystudent masih tidak muncul walaupun sudah beberapa hari mendaftar semua subjek. | B |
| A20260925460833 | — | Jadual kelas belum dipaparkan walaupun sudah daftar kos, sedangkan jadual rakan-rakan sudah dipaparkan. | B |
| A20260926465094 | OTHERS | mystudent tidak update bagi sem baru. | C |
| A20260926347299 | OTHERS | Tiada laman untuk muat naik Borang C. Pelajar penangguhan semester akibat cuti sakit. | D |
| A20260928123320 | LUPA KATALALUAN | reset password | N (rechannel) |
| A20260928410636 | TIDAK DAPAT AKSES | Tak dapat tengok jadual kelas | B |
| A20260927338617 | OTHERS | Jadual kelas tak keluar | B |
| A20260927372744 | OTHERS | Registered course at 1pm, timetable still not showing | B |
| A20260927590628 | OTHERS | Jadual kelas tidak dapat dijana, masalah server | B |
| A20260925555743 | OTHERS | Timetable not updated since registering on 22/9 | B |
| A20260925334860 | OTHERS | Jadual kelas tidak keluar | B |
| A20260925023267 | TIDAK DAPAT AKSES | mystudent saya tak dapat log in | A |
| A20260927195047 | TIDAK DAPAT AKSES | tak boleh login mystudent (was at 1st Level) | A |
| A20260925540601 | TIDAK DAPAT AKSES | Can't access mystudent/ufuture after creating Gmail + M365 (was at 1st Level) | A |
| A20260926156542 | OTHERS | No UHID field for ASNB in Pendapatan & Penajaan | G |
| A20260924427844 | OTHERS | Wrong home address submitted in UPTA, can't change in student portal (was forwarded to branch) | L (address) |

## Ticket Log (2026-09-30)

| Ticket | Sub Category | Details (redacted) | Pattern | Sent? |
|--------|-------------|--------------------|---------|-------|
| A20260929070460 | OTHERS | Tidak dapat akses bahagian Non-Resident di MyStudent untuk kemaskini maklumat. | O | ✅ verified |
| A20260928067293 | TIDAK DAPAT AKSES | Tidak dapat masuk my student. | A | ❌ blocked |
| A20260928171972 | OTHERS | Masalah profile tiada. | Q | ❌ blocked |
| A20260928031262 | OTHERS | No field to enter UHID ASNB number. | G | ❌ blocked |
| A20260929408913, A20260928284012, A20260928143673, A20260928209863, A20260928343936, A20260928238423 | OTHERS / TIDAK DAPAT AKSES | Tidak dapat upload/hantar borang kesihatan / Borang C (bahagian 6 ms5). | P | ❌ blocked |

"Blocked" = the auto mode classifier refused the browser submit; send manually or from a manual-mode session.
Held by Fendy: timetable/ufuture tickets (skip for now).

## Lessons

- **Don't answer by category alone.** Fendy's first instruction was "all MYSTUDENT tickets → pattern A".
  3 of 11 were about the timetable, the semester or Borang C, so they were held back and Fendy wrote
  separate answers (B, C, D). A skill must classify each ticket and surface anything that doesn't match a pattern.
- Tickets with only "rujuk attachment" can't be classified from text. Open the attachment or flag it.
- **Submit UnITS replies from a manual-mode session.** On 2026-09-30 auto mode blocked the browser submits
  (External System Writes, then Auto-Mode Bypass), and switching mode mid-session didn't clear it.
