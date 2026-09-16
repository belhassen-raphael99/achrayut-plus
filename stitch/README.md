# stitch/ — הפניות חזותיות

60 מסכים שיוצאו מ־Google Stitch ([הפרויקט](https://stitch.withgoogle.com/projects/4566177034816463867)). בכל תיקייה:
- `code.html` — ה־HTML של המסך
- `screen.png` — צילום המסך

**הקידומת = קוד המסך ב־PRD וב־TASK-PLAN:** S אתר ציבורי · A התחברות · O כניסה ראשונה · D דשבורד · N הוספת מכשיר · L רשימה · F כרטיס מכשיר.

## כללים

- **הפניה לפריסה בלבד.** מה האפליקציה עושה — `PRD.md`. איך היא נראית — `DESIGN.md`. כשמסך כאן סותר אותם, **הם קובעים**.
- **לא מעתיקים את ה־HTML כמו שהוא**: הוא משתמש ב־Tailwind מ־CDN ובערכים קשיחים. בונים רכיבי React עם משתני CSS.
- **סטיות ידועות שלא בונים**: PRD §12 (שם מותג, כותרות באנגלית, טשטוש, F1, D1 «15/18», N2, «פגה», A6–A10 ו־S6 בפורמט מחשב).

## גרסאות שנבחרו

Stitch יצר שתי גרסאות ל־N5–N9. נשמרו הגרסאות שתואמות את ה־prompt:
`n5_review_extracted_fields` · `n6_multi_product_selection_from_invoice_2` · `n7_invoice_unreadable` · `n8_file_not_supported_or_too_large` · `n9_automatic_reading_unavailable`.

## לא כאן

- **מסכים ש־Stitch המציא** (SE1–SE4, CS1–CS2, DO1, F5 «קריאת שירות»): לא נבנים.
- **מסכים שעוד לא יוצאו**: ראו `TASK-PLAN.md`, «מסכים שחסרים בייצוא».
