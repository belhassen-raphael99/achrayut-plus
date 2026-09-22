"""
אחריות+ · המסמכים של נתוני הדוגמה (שלב 8, 22/09/2026).

מריצים אחרי supabase/seed/demo.sql:
    python3 supabase/seed/demo_documents.py

מה הסקריפט עושה:
1. מצייר 6 מסמכים (חשבוניות ותעודות אחריות, מסומנים «מסמך לדוגמה») ב־Chrome בלי ממשק.
2. מתחבר כ־noa@example.com (חשבון הדוגמה) ומעלה אותם לדלי הפרטי, דרך אותן הרשאות כמו האפליקציה.
3. יוצר את השורות בטבלה documents.

רק המפתח הציבורי נקרא מ־.env.local. אין כאן סוד: הסיסמה היא של חשבון הדוגמה, והיא כתובה ב־TASK-PLAN.md.
"""

import json
import subprocess
import tempfile
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
DEMO_EMAIL = 'noa@example.com'
DEMO_PASSWORD = 'Warranty2026'


def read_env():
    env = {}
    for line in (ROOT / '.env.local').read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            key, value = line.split('=', 1)
            env[key.strip()] = value.strip()
    return env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_PUBLISHABLE_KEY']


URL, KEY = read_env()

CSS = '''*{box-sizing:border-box;margin:0}body{background:#e9ecf4;font-family:"Assistant","Arial Hebrew",Arial,sans-serif;color:#1b1f2e;padding:36px}
.paper{background:#fff;border-radius:6px;padding:36px 34px;box-shadow:0 10px 30px -12px rgba(3,14,68,.25);position:relative;overflow:hidden}
h1{font-size:26px;margin-bottom:4px}.sub{color:#5a5f73;font-size:15px}.row{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px dashed #c6c5d1;font-size:17px}
.meta{display:flex;justify-content:space-between;margin:18px 0 8px;font-size:15px;color:#3a3f52}.total{font-weight:700;font-size:20px;border-bottom:0}
.ltr{direction:ltr;unicode-bidi:isolate;font-family:Menlo,monospace;font-size:15px}.foot{margin-top:18px;font-size:14px;color:#5a5f73;line-height:1.6}
.bar{margin-top:22px;height:44px;background:repeating-linear-gradient(90deg,#1b1f2e 0 2px,transparent 2px 5px,#1b1f2e 5px 6px,transparent 6px 9px)}
.stamp{position:absolute;inset-inline-end:28px;top:40px;border:2px solid #1b2559;color:#1b2559;border-radius:8px;padding:4px 10px;font-weight:700;font-size:13px;transform:rotate(-6deg)}
.seal{margin-top:20px;display:inline-block;border:2px solid #2e7d32;color:#2e7d32;border-radius:50%;width:86px;height:86px;text-align:center;line-height:1.2;padding-top:24px;font-weight:700;font-size:14px}
.demo{position:absolute;bottom:14px;inset-inline-end:18px;font-size:12px;color:#8a8ea0}'''


def page(body):
    return (f'<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>{CSS}</style></head>'
            f'<body><div class="paper">{body}<p class="demo">מסמך לדוגמה · אחריות+</p></div></body></html>')


def invoice(number, date, item, model, price, warranty, extra=''):
    return page(f'''<span class="stamp">שולם</span><h1>מחסני חשמל</h1><p class="sub">סניף רעננה · עוסק מורשה <span class="ltr">514000000</span></p>
<div class="meta"><span>חשבונית מס / קבלה מס' <span class="ltr">{number}</span></span><span class="ltr">{date}</span></div>
<div class="row"><span>{item}<br><span class="ltr">{model}</span>{extra}</span><span class="ltr">{price} ₪</span></div>
<div class="row"><span>מע"מ 18%</span><span>כלול</span></div>
<div class="row total"><span>סה"כ לתשלום</span><span class="ltr">{price} ₪</span></div>
<p class="foot">{warranty}<br>יש לשמור את החשבונית לצורך מימוש האחריות.</p><div class="bar"></div>''')


def certificate(issuer, item, model, serial, bought, until, months):
    return page(f'''<h1>תעודת אחריות</h1><p class="sub">{issuer} · יבואן רשמי</p>
<div class="meta"><span>{item}</span><span class="ltr">{model}</span></div>
<div class="row"><span>מספר סידורי</span><span class="ltr">{serial}</span></div>
<div class="row"><span>תאריך רכישה</span><span class="ltr">{bought}</span></div>
<div class="row"><span>משך האחריות</span><span>{months} חודשים</span></div>
<div class="row total"><span>בתוקף עד</span><span class="ltr">{until}</span></div>
<p class="foot">האחריות כוללת חלקים ועבודה במעבדה מורשית. יש להציג תעודה זו עם החשבונית.</p><span class="seal">אחריות<br>מקורית</span>''')


def request(method, path, token=None, body=None, content_type='application/json', headers=None):
    data = body if isinstance(body, (bytes, type(None))) else json.dumps(body).encode()
    req = urllib.request.Request(f'{URL}{path}', data=data, method=method)
    req.add_header('apikey', KEY)
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    if data is not None:
        req.add_header('Content-Type', content_type)
    for key, value in (headers or {}).items():
        req.add_header(key, value)
    with urllib.request.urlopen(req) as response:
        text = response.read().decode() or 'null'
        return json.loads(text)


def date_he(iso):
    year, month, day = iso.split('-')
    return f'{day}/{month}/{year}'


def main():
    token = request('POST', '/auth/v1/token?grant_type=password', body={'email': DEMO_EMAIL, 'password': DEMO_PASSWORD})['access_token']
    names = ['מכונת כביסה LG', 'מקרר סמסונג', 'תנור בוש', 'מזגן סלון', 'טלוויזיה LG']
    names_filter = urllib.parse.quote('in.(' + ','.join(f'"{name}"' for name in names) + ')')
    rows = request('GET', f'/rest/v1/appliances?select=id,space_id,name,purchase_date,warranty_months&name={names_filter}', token)
    by_name = {row['name']: row for row in rows}

    def until(row):
        year, month, day = map(int, row['purchase_date'].split('-'))
        month += row['warranty_months']
        year += (month - 1) // 12
        month = (month - 1) % 12 + 1
        return f'{day:02d}/{month:02d}/{year}'

    washer, fridge, oven, ac, tv = (by_name[name] for name in names)
    documents = [
        (washer, 'invoice', 'חשבונית-מכונת-כביסה.png', 520,
         invoice('10452', date_he(washer['purchase_date']), 'מכונת כביסה LG', 'F4WV709S1E', '3,490', 'אחריות יבואן: 12 חודשים · LG ישראל')),
        (fridge, 'invoice', 'חשבונית-מקרר.png', 520,
         invoice('09817', date_he(fridge['purchase_date']), 'מקרר סמסונג', 'RB38T602DWW', '4,290', 'אחריות יבואן: 24 חודשים · סמסונג ישראל')),
        (oven, 'warranty', 'תעודת-אחריות-תנור.png', 548,
         certificate('BSH ישראל', 'תנור בוש', 'HBG635BS1', 'BS4471190028', date_he(oven['purchase_date']), until(oven), 24)),
        (ac, 'invoice', 'חשבונית-מזגן.png', 520,
         invoice('07731', date_he(ac['purchase_date']), 'מזגן תדיראן', 'Alpha Pro 140', '6,900', 'אחריות יבואן: 36 חודשים · תדיראן',
                 '<br><span class="sub">כולל התקנה</span>')),
        (tv, 'invoice', 'חשבונית-טלוויזיה.png', 520,
         invoice('08826', date_he(tv['purchase_date']), 'טלוויזיה LG', 'OLED55C4', '5,990', 'אחריות יבואן: 24 חודשים · LG ישראל')),
        (tv, 'warranty', 'תעודת-אחריות-טלוויזיה.png', 548,
         certificate('LG ישראל', 'טלוויזיה LG', 'OLED55C4', '410RMXX77231', date_he(tv['purchase_date']), until(tv), 24)),
    ]

    with tempfile.TemporaryDirectory() as folder:
        for appliance, kind, file_name, height, html in documents:
            source = Path(folder) / 'doc.html'
            image = Path(folder) / 'doc.png'
            source.write_text(html, encoding='utf-8')
            subprocess.run([CHROME, '--headless=new', '--hide-scrollbars', '--force-device-scale-factor=2',
                            f'--window-size=640,{height}', f'--screenshot={image}', f'file://{source}'],
                           check=True, capture_output=True, timeout=60)
            content = image.read_bytes()
            doc_id = str(uuid.uuid4())
            path = f"{appliance['space_id']}/{appliance['id']}/{doc_id}"
            request('POST', f'/storage/v1/object/documents/{path}', token, content, 'image/png')
            request('POST', '/rest/v1/documents', token, {
                'id': doc_id, 'appliance_id': appliance['id'], 'type': kind, 'storage_path': path,
                'file_name': file_name, 'mime_type': 'image/png', 'size_bytes': len(content),
            }, headers={'Prefer': 'return=minimal'})
            print(f'✓ {file_name}')


if __name__ == '__main__':
    main()
