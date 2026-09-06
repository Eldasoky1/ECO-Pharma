import os
import re
import urllib.request

ROOT = r"C:\Users\engAh\OneDrive\Desktop\ECO PHARMA\04_Ahmed_Working_Files\GUI_Stitch_Design"
SRC = os.path.join(ROOT, "src", "stitch_smart_eco_pharma_hub_dashboard")
OUT = os.path.join(ROOT, "code")
IMG = os.path.join(OUT, "assets", "img")
os.makedirs(IMG, exist_ok=True)

FILES = {
    "1._login_material_3": "login.html",
    "2._dashboard_material_3": "dashboard.html",
    "3._drug_catalogue_material_3": "drug-catalogue.html",
    "4._drug_detail_material_3": "drug-detail.html",
    "5._otc_inventory_material_3": "otc-inventory.html",
    "6._inventory_record_edit_material_3": "inventory-record-edit.html",
    "7._new_inventory_record_material_3": "new-inventory-record.html",
    "8._interaction_knowledge_base_material_3": "interaction-knowledge-base.html",
    "9._interaction_checker_material_3": "interaction-checker.html",
    "10._ai_pharmacovigilance_analyzer_material_3": "ai-pharmacovigilance-analyzer.html",
    "11._pv_reports_material_3": "pv-reports.html",
    "12._live_sensors_material_3": "live-sensors.html",
    "13._alerts_material_3": "alerts.html",
    "14._settings_material_3": "settings.html",
}

TITLES = {
    "1._login_material_3": "Login - Smart Eco-Pharma Hub",
    "2._dashboard_material_3": "Dashboard - Smart Eco-Pharma Hub",
    "3._drug_catalogue_material_3": "Drug Catalogue - Smart Eco-Pharma Hub",
    "4._drug_detail_material_3": "Drug Detail - Smart Eco-Pharma Hub",
    "5._otc_inventory_material_3": "OTC Inventory - Smart Eco-Pharma Hub",
    "6._inventory_record_edit_material_3": "Inventory Record Edit - Smart Eco-Pharma Hub",
    "7._new_inventory_record_material_3": "New Inventory Record - Smart Eco-Pharma Hub",
    "8._interaction_knowledge_base_material_3": "Interaction Knowledge Base - Smart Eco-Pharma Hub",
    "9._interaction_checker_material_3": "Interaction Checker - Smart Eco-Pharma Hub",
    "10._ai_pharmacovigilance_analyzer_material_3": "AI Pharmacovigilance Analyzer - Smart Eco-Pharma Hub",
    "11._pv_reports_material_3": "Pharmacovigilance Reports - Smart Eco-Pharma Hub",
    "12._live_sensors_material_3": "Live Sensors - Smart Eco-Pharma Hub",
    "13._alerts_material_3": "Alerts - Smart Eco-Pharma Hub",
    "14._settings_material_3": "Settings - Smart Eco-Pharma Hub",
}

EXTRA_FIXES = {
    "inventory-record-edit.html": [
        ('<a class="hover:text-primary transition-colors" href="#">Inventory</a>',
         '<a class="hover:text-primary transition-colors" href="drug-catalogue.html">Inventory</a>'),
        ('<a class="hover:text-primary transition-colors" href="#">Amoxicillin 500mg</a>',
         '<a class="hover:text-primary transition-colors" href="drug-detail.html">Amoxicillin 500mg</a>'),
    ],
    "drug-detail.html": [
        ('<a class="hover:text-primary transition-colors flex items-center gap-1" href="#">',
         '<a class="hover:text-primary transition-colors flex items-center gap-1" href="drug-catalogue.html">'),
        ('<a class="text-primary hover:text-primary-container font-label-md text-label-md transition-colors flex items-center" href="#">',
         '<a class="text-primary hover:text-primary-container font-label-md text-label-md transition-colors flex items-center" href="drug-catalogue.html">'),
    ],
    "new-inventory-record.html": [
        ('<a class="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-variant p-2 rounded-full inline-flex" href="#">',
         '<a class="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-variant p-2 rounded-full inline-flex" href="drug-catalogue.html">'),
    ],
}

NAV_MAP = {
    "dashboard": "dashboard.html",
    "inventory": "drug-catalogue.html",
    "prescriptions": "interaction-checker.html",
    "patients": "interaction-knowledge-base.html",
    "analytics": "pv-reports.html",
    "alerts": "alerts.html",
    "settings": "settings.html",
    "help center": "settings.html",
    "sign out": "login.html",
    "live sensors": "live-sensors.html",
    "rx": "interaction-checker.html",
}

IBM_FONT_LINK = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">'

# ---------------------------------------------------------------- images
img_urls = []
for folder in FILES:
    with open(os.path.join(SRC, folder, "code.html"), encoding="utf-8") as fh:
        html = fh.read()
    for m in re.findall(r"https://lh3\.googleusercontent\.com/aida-public/[^\"')]+", html):
        if m not in img_urls:
            img_urls.append(m)

url_to_file = {}
for i, url in enumerate(img_urls):
    base = os.path.join(IMG, f"img_{i + 1}")
    existing = [f for f in os.listdir(IMG) if f.startswith(f"img_{i + 1}.")]
    if existing:
        url_to_file[url] = f"assets/img/{existing[0]}"
        print("SKIP ", url_to_file[url])
        continue
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
            ctype = r.headers.get("Content-Type", "")
        ext = ".png" if "png" in ctype else (".webp" if "webp" in ctype else ".jpg")
        with open(base + ext, "wb") as fh:
            fh.write(data)
        url_to_file[url] = f"assets/img/img_{i + 1}{ext}"
        print("OK  ", url_to_file[url])
    except Exception as exc:
        svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">'
               '<rect width="128" height="128" rx="16" fill="#d2e7e3"/>'
               '<text x="64" y="78" font-family="Arial" font-size="26" fill="#00685b" text-anchor="middle">ECO</text>'
               "</svg>")
        with open(base + ".svg", "w", encoding="utf-8") as fh:
            fh.write(svg)
        url_to_file[url] = f"assets/img/img_{i + 1}.svg"
        print("FALLBACK", url_to_file[url], exc)


# ---------------------------------------------------------------- transforms
def fix_nav(html):
    def repl(m):
        attrs_before, attrs_after, inner = m.group(1), m.group(2), m.group(3)
        if "material-symbols-outlined" not in inner:
            return m.group(0)
        label = ""
        msp = re.search(r"<span[^>]*font-label-(?:lg|md)[^>]*>(.*?)</span>", inner, re.S)
        if msp:
            label = re.sub(r"<[^>]+>", "", msp.group(1)).strip()
        else:
            label = re.sub(r'<span class="material-symbols-outlined[^"]*"[^>]*>.*?</span>', " ", inner, flags=re.S)
            label = re.sub(r"<[^>]+>", " ", label)
            label = re.sub(r"\s+", " ", label).strip()
        href = NAV_MAP.get(label.strip().lower())
        if not href:
            return m.group(0)
        return f'<a {attrs_before}href="{href}"{attrs_after}>{inner}</a>'

    return re.sub(r"<a\s+([^>]*?)href=\"#\"([^>]*)>((?:(?!</a>).)*?)</a>", repl, html, flags=re.S)


def fix_cta(html):
    def repl(m):
        attrs, inner = m.group(1), m.group(2)
        if "New Prescription" in inner:
            return f'<a href="new-inventory-record.html"{attrs}>{inner}</a>'
        return m.group(0)

    return re.sub(r"<button([^>]*)>((?:(?!</button>).)*?)</button>", repl, html, flags=re.S)


def fix_images(html):
    return re.sub(r"https://lh3\.googleusercontent\.com/aida-public/[^\"')]+",
                  lambda m: url_to_file[m.group(0)], html)


def fix_login(html, out_name):
    if out_name != "login.html":
        return html
    html = html.replace(
        "document.querySelector('form').addEventListener('submit', (e) => {\n"
        "            e.preventDefault();",
        "document.querySelector('form').addEventListener('submit', (e) => {\n"
        "            e.preventDefault();\n"
        "            window.location.href = 'dashboard.html';",
    )
    return html


for folder, out_name in FILES.items():
    with open(os.path.join(SRC, folder, "code.html"), encoding="utf-8") as fh:
        html = fh.read()

    html = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=[^"]*(?:Plus\+Jakarta|Inter)[^"]*" rel="stylesheet">',
                  IBM_FONT_LINK, html)

    seen = {"m": False}

    def keep_first(m):
        if seen["m"]:
            return ""
        seen["m"] = True
        return m.group(0)

    html = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=Material\+Symbols[^"]*" rel="stylesheet">',
                  keep_first, html)

    html = re.sub(r"[ \t]*darkMode: \"class\",[ \t]*\r?\n", "", html)
    html = html.replace('<html class="light" lang="en">', '<html lang="en">')
    html = html.replace("rounded-DEFAULT", "rounded-lg").replace("rounded-t-DEFAULT", "rounded-t-lg")

    html = (html.replace('"Plus Jakarta Sans"', '"IBM Plex Sans"')
                .replace('"Inter"', '"IBM Plex Sans"')
                .replace("'Plus Jakarta Sans'", "'IBM Plex Sans'")
                .replace("'Inter'", "'IBM Plex Sans'"))

    html = re.sub(r"<title>[^<]*</title>", f"<title>{TITLES[folder]}</title>", html)

    html = fix_nav(html)
    html = fix_cta(html)
    html = fix_images(html)
    html = fix_login(html, out_name)

    for old, new in EXTRA_FIXES.get(out_name, []):
        html = html.replace(old, new)

    with open(os.path.join(OUT, out_name), "w", encoding="utf-8", newline="") as fh:
        fh.write(html)
    print("WROTE", out_name)

print("done")
