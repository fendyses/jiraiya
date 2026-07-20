# CR Log Format
*Change Request entries for UiTM systems — appended after each diary save*

## File Naming
- Monthly file: `M-YYYY.md` (no zero-padding) e.g. `6-2026.md`, `12-2026.md`
- Location: `/Applications/Sites/jiraiya/CR/`

## Entry Format (append, never overwrite)

```markdown
## DD-MM-YYYY

Permohonan CR: https://bsm.uitm.edu.my/
1. System/Application : [value]
2. Module/SubModule : [value]
3. Clasification : [label only]
4. Justifications : [value]

---
```

Multiple CRs on the same date — repeat the `Permohonan CR:` block, separated by a blank line, under the same `## YYYY-MM-DD` header. If the date header already exists in the file, append the new block(s) under it.

## Language Rule
- **Justification** must be written in **Bahasa Melayu**
- IT/technical terms may stay in English (e.g. "upload", "button", "dropdown", "report", "module")
- Do not write full English sentences in the Justification field

## Classification Options
- Module Improvement
- Process Improvement
- Screen Improvement
- ISSUE/BUG/DEFECT
- Reporting

Write only the classification label in a CR entry. Never include its former option number or a numeric prefix.

Correct:
`3. Clasification : ISSUE/BUG/DEFECT`

Incorrect:
`3. Clasification : 4 - ISSUE/BUG/DEFECT`
