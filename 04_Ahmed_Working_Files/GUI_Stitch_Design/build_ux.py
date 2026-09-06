# -*- coding: utf-8 -*-
"""build_ux.py - post-process the 14 Stitch HTML pages:
   - real dark mode (M3 dark tokens via CSS vars, class strategy, toggle, persisted)
   - accessibility: real alt text, aria-hidden on decorative icons,
     aria-label on icon-only buttons, labeled search, focus-visible, reduced-motion
   - interaction: replace active:scale-95 transforms with opacity
   - tokenize hardcoded hex colors
   - wire avatar -> edit-profile.html, settings Edit Profile -> link, login polish
   - build signup.html (create account) and edit-profile.html (edit profile)
"""
import os, re

BASE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(BASE, "code")

FILES = ["login.html", "dashboard.html", "drug-catalogue.html", "drug-detail.html",
         "otc-inventory.html", "inventory-record-edit.html", "new-inventory-record.html",
         "interaction-knowledge-base.html", "interaction-checker.html",
         "ai-pharmacovigilance-analyzer.html", "pv-reports.html", "live-sensors.html",
         "alerts.html", "settings.html"]

# ------------------------------------------------------------------ dark palette
DARK = {
    "outline-variant": "#3f4946", "surface-dim": "#101413", "secondary-container": "#384a48",
    "primary": "#64dac4", "on-tertiary-fixed": "#021d32", "on-primary-fixed": "#00201b",
    "on-tertiary-fixed-variant": "#324960", "on-secondary-fixed-variant": "#384a48",
    "tertiary": "#b1c9e4", "surface-tint": "#64dac4", "inverse-primary": "#00685b",
    "primary-fixed-dim": "#64dac4", "outline": "#88928f", "error": "#ffb4ab",
    "on-secondary-fixed": "#0c1f1c", "surface-container-lowest": "#0b0f0e",
    "on-background": "#e1e3e0", "on-primary-fixed-variant": "#005046",
    "surface-bright": "#363b39", "surface-variant": "#3f4946", "on-tertiary": "#1c3349",
    "surface": "#101413", "secondary-fixed": "#d2e7e3", "surface-container-low": "#191d1c",
    "on-primary": "#003731", "on-secondary-container": "#d2e7e3",
    "on-primary-container": "#82f6e0", "tertiary-container": "#324960",
    "on-error-container": "#ffdad6", "tertiary-fixed-dim": "#b1c9e4",
    "secondary-fixed-dim": "#b6cbc7", "on-surface": "#e1e3e0",
    "on-tertiary-container": "#cfe5ff", "on-secondary": "#223633", "background": "#101413",
    "surface-container": "#1d211f", "tertiary-fixed": "#cfe5ff",
    "surface-container-high": "#272b2a", "inverse-surface": "#e1e3e0",
    "surface-container-highest": "#323634", "inverse-on-surface": "#2f3130",
    "on-error": "#690005", "primary-container": "#005046", "primary-fixed": "#82f6e0",
    "secondary": "#b6cbc7", "error-container": "#93000a", "on-surface-variant": "#bec9c5",
}
DARK["success"] = "#34d399"
DARK["warning"] = "#7a5c00"
DARK["on-warning"] = "#ffdf8a"

ICON_LABELS = {
    "menu": "Menu", "search": "Search", "sensors": "Live sensors",
    "notifications": "Notifications", "settings": "Settings", "edit": "Edit profile",
    "help": "Help Center", "close": "Close", "logout": "Sign out",
    "arrow_back": "Go back", "add": "Add", "dark_mode": "Toggle dark mode",
    "light_mode": "Toggle light mode", "more_vert": "More options",
    "notifications_active": "Notifications", "pharmacy": "Pharmacy",
    "calendar": "Calendar", "file_download": "Download",
}


def hex_to_rgb(h):
    h = h.lstrip("#")
    return "%d %d %d" % (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def extract_light_colors(html):
    m = re.search(r'"colors"\s*:\s*\{(.*?)\}', html, re.S)
    colors = {}
    if m:
        for k, v in re.findall(r'"([\w-]+)"\s*:\s*"#([0-9a-fA-F]{6})"', m.group(1)):
            colors[k] = "#" + v
    return colors


def build_head_css(light):
    light = dict(light)
    light["success"] = "#34d399"
    light["warning"] = "#fef08a"
    light["on-warning"] = "#854d0e"
    root = ":root{" + ";".join("--c-%s:%s" % (k, hex_to_rgb(v)) for k, v in sorted(light.items())) + "}"
    dark = ".dark{" + ";".join("--c-%s:%s" % (k, hex_to_rgb(DARK[k])) for k, v in sorted(light.items())) + "}"
    return root + dark


def inject_head(html, head_css):
    boot = ("<script>(function(){try{var t=localStorage.getItem('theme');"
            "if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){"
            "document.documentElement.classList.add('dark')}}catch(e){}})();</script>")
    css = ("<style>" + head_css +
           ":focus-visible{outline:2px solid rgb(var(--c-primary));outline-offset:2px;border-radius:6px}"
           "@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;"
           "animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}"
           "</style>")
    return html.replace("</head>", boot + css + "</head>")


def config_transform(html):
    def repl_colors(m):
        block = m.group(2)
        block = re.sub(r'"([\w-]+)"\s*:\s*"#[0-9a-fA-F]{6}"',
                       r'"\1": "rgb(var(--c-\1) / <alpha-value>)"', block)
        block += (', "success": "rgb(var(--c-success) / <alpha-value>)",'
                  ' "warning": "rgb(var(--c-warning) / <alpha-value>)",'
                  ' "on-warning": "rgb(var(--c-on-warning) / <alpha-value>)"')
        return m.group(1) + block + m.group(3)

    html = re.sub(r'("colors"\s*:\s*\{)(.*?)(\})', repl_colors, html, count=1, flags=re.S)
    html = re.sub(r'tailwind\.config\s*=\s*\{', 'tailwind.config = { darkMode: "class",', html, count=1)
    return html


def fix_images(html):
    def repl(m):
        tag = m.group(0)
        alt = re.search(r'alt="([^"]*)"', tag)
        data = re.search(r'data-alt="([^"]*)"', tag)
        if alt:
            return tag.replace(data.group(0), "").strip() if data else tag
        if data:
            return tag.replace("data-alt=", "alt=", 1)
        return tag
    return re.sub(r"<img[^>]*>", repl, html)


def aria_hide_icons(html):
    return re.sub(r'<span class="material-symbols-outlined([^"]*)"',
                  r'<span aria-hidden="true" class="material-symbols-outlined\1"', html)


def label_icon_buttons(html):
    def repl(m):
        tag, inner = m.group(1), m.group(2)
        if "aria-label" in tag:
            return m.group(0)
        ic = re.search(r'data-icon="([^"]+)"', inner)
        if not ic:
            return m.group(0)
        text = re.sub(r"<[^>]+>", "", inner).strip()
        if text:
            return m.group(0)
        name = ic.group(1)
        label = ICON_LABELS.get(name, " ".join(w.capitalize() for w in name.replace("_", " ").split()))
        return '<button%s aria-label="%s">%s</button>' % (tag, label, inner)
    return re.sub(r"<button([^>]*)>((?:(?!</button>).)*?)</button>", repl, html, flags=re.S)


def fix_scale(html):
    return html.replace("active:scale-95", "active:opacity-80").replace("transition-transform", "transition-colors")


def label_search(html):
    def repl(m):
        tag = m.group(0)
        if "aria-label" in tag or "placeholder=\"Search" not in tag:
            return tag
        return tag.replace(">", ' aria-label="Search">', 1)
    return re.sub(r"<input[^>]*>", repl, html)


def fix_hex(html):
    return (html.replace("bg-[#34d399]", "bg-success")
                .replace("bg-[#fef08a]", "bg-warning")
                .replace("text-[#854d0e]", "text-on-warning")
                .replace("bg-[#00685b]", "bg-primary"))


TOGGLE = ('<button id="theme-toggle" type="button" aria-label="Toggle dark mode" aria-pressed="false" '
          'class="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-80">'
          '<span class="material-symbols-outlined block dark:hidden" aria-hidden="true">dark_mode</span>'
          '<span class="material-symbols-outlined hidden dark:block" aria-hidden="true">light_mode</span>'
          "</button>")

TOGGLE_JS = ("<script>(function(){var b=document.getElementById('theme-toggle');if(b){"
             "function s(){var d=document.documentElement.classList.contains('dark');"
             "b.setAttribute('aria-pressed',String(d));}"
             "b.addEventListener('click',function(){var d=document.documentElement.classList.toggle('dark');"
             "try{localStorage.setItem('theme',d?'dark':'light')}catch(e){}s();});s();}})();</script>")


def inject_toggle(html):
    if "</header>" in html:
        return html.replace("</header>", TOGGLE + "\n</header>", 1)
    m = re.search(r'<div class="bg-surface-container-low[^"]*">', html)
    if m:
        tag = m.group(0)
        new_tag = tag[:-1] + " relative>"
        return html.replace(tag, new_tag + '\n' + TOGGLE.replace("p-2", "absolute top-3 right-3 p-2"), 1)
    return html


def inject_toggle_js(html):
    return html.replace("</body>", TOGGLE_JS + "</body>", 1)


def avatar_to_link(html):
    def repl(m):
        rest, inner = m.group(1), m.group(2)
        cls = ("ml-2 w-8 h-8" + rest).replace("cursor-pointer", "").strip()
        return ('<a class="%s block" href="edit-profile.html" aria-label="Edit profile">%s</a>'
                % (cls, inner))
    return re.sub(r'<div class="ml-2 w-8 h-8([^"]*)"[^>]*>((?:(?!</div>).)*?)</div>',
                  repl, html, flags=re.S)


def settings_edit_link(html):
    old = ('<button class="mt-auto w-full py-2 px-4 bg-surface rounded-full border border-outline-variant '
           'font-label-md text-label-md text-primary hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">')
    new = ('<a class="mt-auto w-full py-2 px-4 bg-surface rounded-full border border-outline-variant '
           'font-label-md text-label-md text-primary hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 cursor-pointer" href="edit-profile.html">')
    html = html.replace(old, new, 1)
    html = html.replace('Edit Profile\n                    </button>', 'Edit Profile\n                    </a>', 1)
    return html


def process(html):
    light = extract_light_colors(html)
    html = config_transform(html)
    html = inject_head(html, build_head_css(light))
    html = fix_images(html)
    html = aria_hide_icons(html)
    html = label_icon_buttons(html)
    html = fix_scale(html)
    html = label_search(html)
    html = fix_hex(html)
    html = inject_toggle(html)
    html = inject_toggle_js(html)
    html = avatar_to_link(html)
    return html


def main():
    processed = {}
    for name in FILES:
        with open(os.path.join(CODE, name), encoding="utf-8") as fh:
            html = fh.read()
        html = process(html)
        if name == "login.html":
            html = (html.replace('required="" type="email">',
                                 'required="" type="email" autocomplete="email">')
                        .replace('required="" type="password">',
                                 'required="" type="password" autocomplete="current-password">')
                        .replace('<div class="h-px bg-outline-variant flex-grow"></div>\n<span class="font-label-md text-label-md text-on-surface-variant">Secure Login</span>',
                                 '<div class="h-px bg-outline-variant flex-grow"></div>\n<span class="font-label-md text-label-md text-on-surface-variant">Secure Login</span>'))
            html = html.replace(
                '<div class="h-px bg-outline-variant flex-grow"></div>\n<span class="font-label-md text-label-md text-on-surface-variant">Secure Login</span>',
                '<div class="h-px bg-outline-variant flex-grow"></div>\n<span class="font-label-md text-label-md text-on-surface-variant">Secure Login</span>')
            html = html.replace(
                "</form>",
                '<p class="mt-6 text-center font-body-md text-body-md text-on-surface-variant">'
                "Don't have an account? "
                '<a class="font-label-md text-label-md text-primary hover:text-primary-container transition-colors" '
                'href="signup.html">Create Account</a></p>\n</form>', 1)
        if name == "settings.html":
            html = settings_edit_link(html)
        with open(os.path.join(CODE, name), "w", encoding="utf-8", newline="") as fh:
            fh.write(html)
        processed[name] = html
        print("WROTE", name)
    build_signup(processed["login.html"])
    build_edit_profile(processed["dashboard.html"])


def build_signup(login_html):
    card_start = login_html.index('<div class="bg-surface-container-low')
    card_end = login_html.index("</div>\n</main>", card_start)
    head = login_html[:card_start]
    tail = login_html[card_end:]

    form = """
<!-- Brand Header -->
<div class="text-center mb-8">
<div class="flex justify-center mb-4 text-primary">
<span class="material-symbols-outlined" style="font-size: 48px; font-variation-settings: 'FILL' 1;">eco</span>
</div>
<h1 class="font-headline-sm text-headline-sm text-primary mb-2">Create Account</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Join the Smart Eco-Pharma Hub</p>
</div>
<!-- Signup Form -->
<form class="space-y-5" id="signup-form" novalidate>
<div id="error-summary" role="alert" tabindex="-1" class="hidden bg-error-container text-on-error-container rounded-lg p-3 font-body-md text-body-md mb-2"></div>
<!-- Full Name -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="name">Full Name</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="person">person</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" id="name" name="name" placeholder="e.g. Dr. Sarah Jenkins" required="" autocomplete="name" type="text">
<p class="hidden font-body-md text-body-md text-error mt-1 ml-4" id="name-error"></p>
</div>
</div>
<!-- Email -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="email">Email Address</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="mail">mail</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" id="email" name="email" placeholder="Enter your email" required="" autocomplete="email" type="email">
<p class="hidden font-body-md text-body-md text-error mt-1 ml-4" id="email-error"></p>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
<!-- Password -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="password">Password</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="lock">lock</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" id="password" name="password" placeholder="Min. 8 characters" required="" autocomplete="new-password" type="password">
<p class="hidden font-body-md text-body-md text-error mt-1 ml-4" id="password-error"></p>
</div>
</div>
<!-- Confirm Password -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="confirm">Confirm Password</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="lock">lock</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" id="confirm" name="confirm" placeholder="Repeat password" required="" autocomplete="new-password" type="password">
<p class="hidden font-body-md text-body-md text-error mt-1 ml-4" id="confirm-error"></p>
</div>
</div>
</div>
<!-- Role -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="role">Role</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="badge">badge</span>
<select class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none" id="role" name="role">
<option value="Pharmacist">Pharmacist</option>
<option value="Admin">Admin</option>
<option value="Manager">Manager</option>
</select>
</div>
</div>
<!-- Terms -->
<label class="flex items-center space-x-2 cursor-pointer px-2">
<input class="form-checkbox h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox" id="terms" name="terms">
<span class="font-body-md text-body-md text-on-surface-variant">I agree to the Terms of Service and Privacy Policy</span>
</label>
<p class="hidden font-body-md text-body-md text-error mt-1 ml-4" id="terms-error"></p>
<!-- Submit -->
<button class="w-full bg-primary text-on-primary font-label-lg text-label-lg rounded-full py-3 px-6 hover:bg-surface-tint active:opacity-80 transition-all duration-200 flex items-center justify-center space-x-2" type="submit">
<span>Create Account</span>
<span class="material-symbols-outlined" aria-hidden="true" data-icon="arrow_forward">arrow_forward</span>
</button>
</form>
<!-- Divider -->
<div class="mt-6 flex items-center justify-center space-x-4">
<div class="h-px bg-outline-variant flex-grow"></div>
<span class="font-label-md text-label-md text-on-surface-variant">Secure Signup</span>
<div class="h-px bg-outline-variant flex-grow"></div>
</div>
<p class="mt-4 text-center font-body-md text-body-md text-on-surface-variant">
Already have an account?
<a class="font-label-md text-label-md text-primary hover:text-primary-container transition-colors" href="login.html">Sign In</a></p>
"""
    html = head + '<div class="bg-surface-container-low rounded-xl p-8 w-full max-w-md shadow-sm border border-surface-container shadow-[0_4px_8px_rgba(0,104,91,0.04)] relative">' + "\n" + TOGGLE.replace("p-2", "absolute top-3 right-3 p-2") + "\n" + form + "</div>" + tail

    # replace the login submit script with signup validation JS (keep theme toggle script)
    m = re.search(r"<script>\s*// Simple form interaction prevention[\s\S]*?</script>", html)
    if m:
        html = html.replace(m.group(0), SIGNUP_JS)

    html = html.replace("<title>Login - Smart Eco-Pharma Hub</title>",
                        "<title>Create Account - Smart Eco-Pharma Hub</title>", 1)
    with open(os.path.join(CODE, "signup.html"), "w", encoding="utf-8", newline="") as fh:
        fh.write(html)
    print("WROTE signup.html")


SIGNUP_JS = """<script>
(function(){
  var form = document.getElementById('signup-form');
  var summary = document.getElementById('error-summary');
  function setErr(id, msg){
    var inp = document.getElementById(id);
    var err = document.getElementById(id + '-error');
    if (msg) {
      inp.setAttribute('aria-invalid', 'true');
      err.textContent = msg;
      err.classList.remove('hidden');
      inp.classList.add('border-error');
    } else {
      inp.removeAttribute('aria-invalid');
      err.textContent = '';
      err.classList.add('hidden');
      inp.classList.remove('border-error');
    }
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var pass = document.getElementById('password').value;
    var confirm = document.getElementById('confirm').value;
    var terms = document.getElementById('terms').checked;
    var errors = [];
    if (!name) { setErr('name', 'Enter your full name.'); errors.push(['name', 'name-error', 'Enter your full name.']); } else setErr('name', '');
    if (!email) { setErr('email', 'Enter your email address.'); errors.push(['email', 'email-error', 'Enter your email address.']); }
    else if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) { setErr('email', 'Enter a valid email address.'); errors.push(['email', 'email-error', 'Enter a valid email address.']); }
    else setErr('email', '');
    if (!pass) { setErr('password', 'Create a password (min 8 characters).'); errors.push(['password', 'password-error', 'Create a password (min 8 characters).']); }
    else if (pass.length < 8 || !/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) { setErr('password', 'Password must be at least 8 characters with a letter and a number.'); errors.push(['password', 'password-error', 'Password must be at least 8 characters with a letter and a number.']); }
    else setErr('password', '');
    if (!confirm) { setErr('confirm', 'Repeat your password.'); errors.push(['confirm', 'confirm-error', 'Repeat your password.']); }
    else if (confirm !== pass) { setErr('confirm', 'Passwords do not match.'); errors.push(['confirm', 'confirm-error', 'Passwords do not match.']); }
    else setErr('confirm', '');
    if (!terms) { setErr('terms', 'You must accept the Terms of Service.'); errors.push(['terms', 'terms-error', 'You must accept the Terms of Service.']); }
    if (errors.length) {
      summary.classList.remove('hidden');
      summary.innerHTML = '<p class="font-label-lg text-label-lg font-semibold mb-1">There is a problem</p><ul class="list-disc list-inside space-y-1">' +
        errors.map(function(e){ return '<li><a class="underline" href="#' + e[0] + '">' + e[1] + '</a></li>'; }).join('') + '</ul>';
      summary.focus();
      document.getElementById(errors[0][0]).focus();
      return;
    }
    summary.classList.add('hidden');
    form.reset();
    window.location.href = 'dashboard.html';
  });
})();
</script>
"""


def build_edit_profile(dashboard_html):
    # take everything through </header> (head + body open + nav + header)
    end = dashboard_html.index("</header>") + len("</header>")
    head = dashboard_html[:end]

    content = """
<div class="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
<div class="max-w-3xl mx-auto">
<!-- Page Header -->
<div class="mb-6">
<h2 class="font-headline-sm text-headline-sm text-on-background">Edit Profile</h2>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">Update your personal details, role, and contact information.</p>
</div>
<div class="bg-surface-container rounded-xl border border-outline-variant p-default-padding md:p-6" id="profile-card">
<div id="profile-summary" role="alert" tabindex="-1" class="hidden bg-error-container text-on-error-container rounded-lg p-3 font-body-md text-body-md mb-4"></div>
<form class="space-y-5" id="profile-form" novalidate>
<!-- Avatar -->
<div class="flex items-center gap-4 mb-2">
<div class="w-16 h-16 rounded-full bg-primary-container overflow-hidden border-2 border-primary-fixed">
<img class="w-full h-full object-cover" alt="Profile avatar" src="assets/img/img_23.jpg">
</div>
<div>
<p class="font-label-md text-label-md text-on-surface-variant mb-1">Profile photo</p>
<button type="button" class="font-label-md text-label-md text-primary hover:text-primary-container transition-colors cursor-pointer" onclick="alert('Photo upload is not wired in this prototype.')">Change photo</button>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
<!-- Full Name -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="full-name">Full Name</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="person">person</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" id="full-name" name="full-name" placeholder="Dr. Sarah Jenkins" value="Dr. Sarah Jenkins" autocomplete="name" type="text">
<p class="hidden font-body-md text-body-md text-error mt-1 ml-4" id="full-name-error"></p>
</div>
</div>
<!-- Role -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="role">Role</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="badge">badge</span>
<select class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none" id="role" name="role">
<option selected="">Lead Pharmacist</option>
<option>Pharmacist</option>
<option>Admin</option>
<option>Manager</option>
</select>
</div>
</div>
<!-- Email -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="email">Email Address</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="mail">mail</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" id="email" name="email" placeholder="sarah@example.com" value="sarah.jenkins@ecopharma.example" autocomplete="email" type="email">
<p class="hidden font-body-md text-body-md text-error mt-1 ml-4" id="email-error"></p>
</div>
</div>
<!-- Phone -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="phone">Phone</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" data-icon="call">call</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" id="phone" name="phone" placeholder="+20 100 000 0000" autocomplete="tel" type="tel">
<p class="hidden font-body-md text-body-md text-error mt-1 ml-4" id="phone-error"></p>
</div>
</div>
</div>
<!-- Bio -->
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1 ml-4" for="bio">Bio</label>
<textarea class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-2xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none" id="bio" name="bio" rows="3" placeholder="Short professional summary">Lead Pharmacist with 15+ years of experience in clinical and community pharmacy, managing inventory and pharmacovigilance at Main Branch.</textarea>
</div>
<!-- Save -->
<div class="flex items-center justify-end gap-3 pt-2">
<button type="button" class="px-6 h-10 rounded-full border border-outline-variant font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer" onclick="history.back()">Cancel</button>
<button type="submit" class="px-6 h-10 rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-surface-tint active:opacity-80 transition-all duration-200 cursor-pointer flex items-center gap-2">
<span>Save Changes</span>
<span class="material-symbols-outlined" aria-hidden="true" data-icon="save">save</span>
</button>
</div>
</form>
</div>
</div>
</div>
"""

    html = head + content + "</main>\n" + TOGGLE_JS + "</body></html>"

    html = html.replace("<title>Dashboard - Smart Eco-Pharma Hub</title>",
                        "<title>Edit Profile - Smart Eco-Pharma Hub</title>", 1)
    with open(os.path.join(CODE, "edit-profile.html"), "w", encoding="utf-8", newline="") as fh:
        fh.write(html)
    print("WROTE edit-profile.html")


PROFILE_JS = """<script>
(function(){
  var form = document.getElementById('profile-form');
  var summary = document.getElementById('profile-summary');
  function setErr(id, msg){
    var inp = document.getElementById(id);
    var err = document.getElementById(id + '-error');
    if (msg) {
      inp.setAttribute('aria-invalid', 'true');
      err.textContent = msg;
      err.classList.remove('hidden');
      inp.classList.add('border-error');
    } else {
      inp.removeAttribute('aria-invalid');
      err.textContent = '';
      err.classList.add('hidden');
      inp.classList.remove('border-error');
    }
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('full-name').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var errors = [];
    if (!name) { setErr('full-name', 'Enter your full name.'); errors.push('Enter your full name.'); } else setErr('full-name', '');
    if (!email) { setErr('email', 'Enter your email address.'); errors.push('Enter your email address.'); }
    else if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) { setErr('email', 'Enter a valid email address.'); errors.push('Enter a valid email address.'); }
    else setErr('email', '');
    if (phone && !/^[+0-9()\\-\\s]+$/.test(phone)) { setErr('phone', 'Enter a valid phone number.'); errors.push('Enter a valid phone number.'); } else setErr('phone', '');
    if (errors.length) {
      summary.classList.remove('hidden');
      summary.textContent = 'There is a problem: ' + errors.join(' ');
      summary.focus();
      return;
    }
    summary.classList.remove('hidden');
    summary.setAttribute('role', 'status');
    summary.classList.replace('bg-error-container', 'bg-primary-container');
    summary.classList.replace('text-on-error-container', 'text-on-primary-container');
    summary.textContent = 'Profile saved successfully.';
    window.setTimeout(function(){ window.location.href = 'settings.html'; }, 1200);
  });
})();
</script>
"""


if __name__ == "__main__":
    main()
