import re, json, pathlib, sys
SRC = pathlib.Path('/home/claude/zestrea')
D = pathlib.Path('/home/claude/zestrea-app/dist')
VER = sys.argv[1] if len(sys.argv) > 1 else '1'

head = (SRC/'head.html').read_text()
engine = (SRC/'engine.js').read_text()
ui = (SRC/'ui.js').read_text()
shim = pathlib.Path('/home/claude/zestrea-app/src/fb-shim.js').read_text()

def R(s, a, b):
    assert a in s, a[:60]
    return s.replace(a, b)

# standalone wording
DENIED = 'Nu am acces la baza de date. Verifică regulile Firebase (vezi instrucțiunile).'
ui = R(ui, 'else if(e.code==="invalid_argument")toast("Nu ai drept de scriere aici. Cere-i gazdei acces de Editor la pagină.");',
          f'else if(e.code==="denied")toast("{DENIED}");')
ui = R(ui, 'toast(e.code==="invalid_argument"?"Nu ai drept de scriere aici. Cere-i gazdei acces de Editor la pagină.":"Jocul nu s-a putut crea. Mai încearcă.");',
          f'toast(e.code==="denied"?"{DENIED}":"Jocul nu s-a putut crea. Verifică internetul și mai încearcă.");')
ui = R(ui, '<h2>Jocul are nevoie de conexiune</h2><p>Zestrea păstrează mutările tuturor jucătorilor într-o bază de date comună. Deschide pagina din aplicația Claude, autentificat în contul tău, ca să poți juca.</p>',
          '<h2>Nu mă pot conecta</h2><p>Zestrea păstrează mutările tuturor jucătorilor într-o bază de date comună și are nevoie de internet. Verifică conexiunea și redeschide aplicația.</p><button class="btn primary" onclick="location.reload()">Încearcă din nou</button>')

FB = '10.12.2'
page = f'''<!doctype html>
<html lang="ro"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#22131f">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Zestrea">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" href="icon-192.png">
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0;font:14px system-ui,sans-serif;-webkit-text-size-adjust:100%;overscroll-behavior-y:none}}img{{max-width:100%}}*{{box-sizing:border-box}}</style>
</head><body>
{head}
<script src="https://www.gstatic.com/firebasejs/{FB}/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/{FB}/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/{FB}/firebase-firestore-compat.js"></script>
<script src="config.js"></script>
<script>{shim}</script>
<script>{engine}</script>
<script>{ui}
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{{}});</script>
</body></html>'''
(D/'index.html').write_text(page)

(D/'manifest.webmanifest').write_text(json.dumps({
  "name": "Zestrea", "short_name": "Zestrea", "lang": "ro",
  "start_url": "./", "scope": "./", "display": "standalone",
  "background_color": "#22131f", "theme_color": "#22131f",
  "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]
}, ensure_ascii=False, indent=1))

(D/'sw.js').write_text(f'''// Zestrea v{VER}: network first, so updates arrive at once; cached copy only when offline
const C="zestrea-v{VER}";
self.addEventListener("install",e=>{{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","config.js","manifest.webmanifest","apple-touch-icon.png","icon-192.png"])));}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));}});
self.addEventListener("fetch",e=>{{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))));
}});
''')

cfg = D/'config.js'
if not cfg.exists() or 'PUNE_AICI' in cfg.read_text():
    cfg.write_text('''// Configurația Firebase a jocului. Înlocuiește valorile cu cele din consola Firebase.
window.ZESTREA_FIREBASE = {
  apiKey: "PUNE_AICI",
  authDomain: "PUNE_AICI",
  projectId: "PUNE_AICI",
  appId: "PUNE_AICI"
};
''')

(D/'_headers').write_text('''/*
  Cache-Control: no-cache
''')
print('built', len(page))
