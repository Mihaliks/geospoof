// Manual Safari acceptance page. Foreground only; Ctrl-C stops the server.
import http from "node:http";
const port = Number(process.env.MILOCATION_TEST_PORT || 8478);
const html = `<!doctype html><html lang="ru"><meta charset="utf-8">
<title>MiLocation — проверка Safari</title>
<style>body{font:18px system-ui;max-width:900px;margin:40px auto;padding:20px}pre{white-space:pre-wrap;background:#eee;padding:24px;color:#111}button{font:inherit}</style>
<h1>MiLocation — локальная проверка Safari</h1>
<p>Эта страница не обращается к внешним серверам.</p>
<pre id="out">Проверка…</pre><button onclick="location.reload()">Повторить</button>
<script>
const first = Intl.DateTimeFormat().resolvedOptions().timeZone;
async function check(){
 const result={firstScriptTimezone:first,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
 offsetMinutes:new Date().getTimezoneOffset(),language:navigator.language,
 currentTime:new Date().toString()};
 document.getElementById('out').textContent=JSON.stringify(result,null,2)+'\\nГеолокация: ожидание…';
 navigator.geolocation.getCurrentPosition(p=>{
 result.latitude=p.coords.latitude;result.longitude=p.coords.longitude;
 document.getElementById('out').textContent=JSON.stringify(result,null,2);
 },e=>{result.geolocationError=e.message;document.getElementById('out').textContent=JSON.stringify(result,null,2)}, {timeout:5000});
}
setTimeout(check,500);
</script></html>`;
const server = http.createServer((request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(html);
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Safari acceptance page: http://127.0.0.1:${port}`)
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
