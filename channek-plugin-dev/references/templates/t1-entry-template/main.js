// 零依赖裸协议版（看懂协议用）。真写插件时用 @channek/sandbox-sdk——
// 它把下面这套 requestId/Promise 配对、主题应用、存储垫片都封好了，打进你的 bundle 即可。
let port = null;
let seq = 0;
const pending = new Map();

// 握手：插件先喊 ready（宿主无从知道 iframe 脚本何时就位，这是唯一可靠的时序信号），
// 宿主回 init 消息 + 一只 MessagePort，之后所有通信走 port。
window.addEventListener('message', event => {
  if (port || event.data?.type !== 'init' || event.ports.length !== 1) return;
  port = event.ports[0];
  port.onmessage = onMessage;
  port.start();
  applyTheme(event.data.theme);
  main();
});
window.parent.postMessage({ type: 'ready' }, '*');

function onMessage(event) {
  const msg = event.data;
  if (msg.type === 'suite:response' || msg.type === 'rpc:response' || msg.type === 'file:data') {
    const p = pending.get(msg.requestId);
    if (!p) return;
    pending.delete(msg.requestId);
    msg.ok ? p.resolve(msg.payload ?? msg.text) : p.reject(new Error(msg.error));
    return;
  }
  if (msg.type === 'theme:changed') applyTheme(msg.theme);
}

function request(message) {
  const requestId = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    port.postMessage({ ...message, requestId });
  });
}

function applyTheme(theme) {
  for (const [k, v] of Object.entries(theme ?? {}))
    if (k.startsWith('--')) document.documentElement.style.setProperty(k, v);
}

async function main() {
  // 读 op 需要 manifest 声明 workspace:read；op 全表见 ../../sandbox-bridge.md
  const data = await request({ type: 'suite:request', op: 'assets.overview' });
  document.querySelector('#out').textContent = JSON.stringify(data, null, 2);
}
