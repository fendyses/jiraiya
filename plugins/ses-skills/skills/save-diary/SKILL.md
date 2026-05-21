---
name: save-diary
description: 'Save session to daily diary. Use when user says: "save diary", "log this session", "document this", "save to diary". Also auto-triggered after every successful code change. Appends structured entry to daily-diary/current/YYYY-MM-DD.md with monthly auto-archival. Always writes diary to the JIRAIYA repo regardless of which repo the user is currently working in.'
---

# Save Diary System

Automated daily session documentation with monthly archival.

**Penting**: Diari **sentiasa ditulis ke JIRAIYA repo** (`/Applications/ServBay/www/jiraiya/daily-diary/`) tidak kira dari repo mana skill ini dipanggil. Ini memastikan semua kerja harian terpusat di satu tempat.

## Trigger

### Auto (WAJIB)
Aktifkan **AUTOMATIK** selepas SETIAP perubahan kod yang berjaya (bug fix, feature, optimization, refactor). Tidak perlu user minta. Urutan: Verify fix → Save diary → Learn → Report to user.

### Manual
Aktifkan juga bila pengguna kata: "save diary", "log this session", "document this", "save to diary".

## Direktori

```
/Applications/ServBay/www/jiraiya/daily-diary/
├── current/                     # Entry bulan semasa
│   ├── 2026-03-17.md
│   └── 2026-03-30.md
├── archived/                    # Bulan-bulan lepas
│   ├── 2026-02/
│   │   └── 2026-02-27.md
│   └── 2025-03/
│       └── 2025-03-02.md
└── daily-diary-protocol.md      # Rujukan format entry
```

## Protokol

### Langkah 0: Kesan Repo Semasa + Kumpul Kerja Semua Repo

**SEBELUM** menulis entry, kumpul semua kerja dari semua repo yang ada aktiviti hari ini:

#### A. Semak repo semasa (di mana user sedang bekerja)

1. Jalankan `git rev-parse --show-toplevel` untuk dapatkan root repo semasa
2. Jika root repo **bukan** `/Applications/ServBay/www/jiraiya`, ini bermakna user bekerja di repo lain
3. Jalankan git log untuk repo semasa:
   ```bash
   TODAY=$(date +%Y-%m-%d)
   git -C "$(git rev-parse --show-toplevel)" log --after="${TODAY} 00:00:00" --before="${TODAY} 23:59:59" --oneline --no-merges --format="%h %s"
   ```
4. Simpan hasil sebagai "repo semasa" untuk entry diary

#### B. Scan repo dari senarai projek

1. Baca `/Applications/ServBay/www/jiraiya/projects/project-list.md` (jika wujud)
2. Untuk setiap projek aktif dalam senarai:
   - Buka `/Applications/ServBay/www/jiraiya/projects/active/[name].md`
   - Cari field `**Repository**:` di bawah **Technical Notes**
   - Jika path lokal (bermula dengan `/`), jalankan:
     ```bash
     TODAY=$(date +%Y-%m-%d)
     git -C "/path/to/repo" log --after="${TODAY} 00:00:00" --before="${TODAY} 23:59:59" --oneline --no-merges --format="%h %s"
     ```
   - Jika ada commit, simpan hasil dengan nama projek
3. Jika `project-list.md` tidak wujud, skip bahagian ini

#### C. Consolidate

Gabungkan semua hasil dari A dan B — ini akan dimasukkan ke bahagian **"Kerja di repo lain"** dalam entry diary.

> **Nota**: Hanya log commit dari hari **semasa** (midnight to now).

### Langkah 1: Auto-Archive Bulan Lepas

**SEBELUM** menulis entry baru, semak jika ada fail bulan lama dalam `/Applications/ServBay/www/jiraiya/daily-diary/current/`:

1. Baca semua fail dalam `daily-diary/current/`
2. Jika ada fail dengan bulan **berbeza** dari bulan semasa:
   - Cipta `daily-diary/archived/YYYY-MM/` untuk bulan fail tersebut
   - Pindah fail ke folder arkib yang betul
3. Teruskan ke Langkah 2

### Langkah 2: Tulis Entry

Append satu entry ke `/Applications/ServBay/www/jiraiya/daily-diary/current/YYYY-MM-DD.md` (cipta fail jika perlu).

### Struktur Entry

Setiap entry MESTI ada:

1. **Timestamp** — ISO 8601 (contoh: `2026-03-30T14:30:00+08:00`)
2. **Session summary** — 1–3 ayat: apa yang dibincang/dilakukan
3. **Key decisions** — Keputusan yang dibuat (bullet list)
4. **Fail yang diubah** — Senarai fail dalam repo semasa + ringkasan perubahan
5. **Kerja di repo lain** — Commit dari repo lain hari ini (dari Langkah 0)
6. **Follow-ups** — Item terbuka atau langkah seterusnya
7. **Tags** — `#topic` untuk carian (contoh: `#bug-fix #performance`)

### Format Entry

```markdown
---

## YYYY-MM-DD (Time of Day - HH:mm) - Session Title

### Session summary
1-3 ayat ringkasan.

### Key decisions
- Keputusan 1
- Keputusan 2

### Fail yang diubah
<!-- Fail dalam repo semasa (atau jiraiya repo jika tiada repo lain) -->
- `path/to/file.php` — Apa yang diubah

### Kerja di repo lain
<!-- Sertakan bahagian ini apabila ada kerja di repo selain jiraiya -->
- **mystudentvue** (`/Applications/ServBay/www/mystudentvue`):
  - `abc1234` Fix login redirect bug
  - `def5678` Update student dashboard layout
- **weightloss** (`/Applications/ServBay/www/weightloss`):
  - `ghi9012` Add calorie tracking feature

### Follow-ups
- Item terbuka atau langkah seterusnya

### Tags
#tag1 #tag2
```

### Format Fail Harian

- **Satu fail sehari:** `daily-diary/current/YYYY-MM-DD.md`
- **Append-only:** Entry baru ditambah di hujung; jangan tulis semula entry sebelum
- **Pemisah:** Setiap entry dipisah dengan `---`
- **Tajuk fail (entry pertama sahaja):** `# JIRAIYA Session Diary - Month DD, YYYY`

### Auto-Archive Overflow

Bila fail melebihi **1000 baris**, arkibkan ke `daily-diary/archived/YYYY-MM/` dan mulakan fail baru.

### Langkah 3: Kemaskini Session Memory

Selepas tulis entry, kemaskini `main/current-session.md` dengan **recap** ringkas:
- Topik terakhir
- Keputusan terakhir
- Fail terakhir diubah
- Repo yang ada aktiviti hari ini

Supaya turn seterusnya boleh rujuk tanpa baca semula diari penuh.

## Peraturan

- **JANGAN** tulis semula entry sebelum — append sahaja
- **JANGAN** reka fakta — log hanya apa yang sebenar berlaku dalam sesi
- **SENTIASA tulis ke jiraiya repo** walaupun dipanggil dari repo lain
- Entry ringkas: 50–150 baris per sesi
- Guna Bahasa Melayu dengan istilah teknikal Inggeris
- Cipta fail/folder automatik jika belum wujud
- Jika tiada commit ditemui di repo lain, **abaikan** bahagian "Kerja di repo lain"
