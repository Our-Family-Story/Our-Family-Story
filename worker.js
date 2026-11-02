// Cloudflare Worker — 가족 스케줄 저장 기능 (수정하지 않아도 됩니다)
// 홈페이지 파일은 public/index.html, 저장 공간은 wrangler.jsonc의 SCHEDULE(KV)입니다.

const KEY = "state";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function load(env) {
  return (await env.SCHEDULE.get(KEY, "json")) || { events: null, done: {} };
}

function clean(e) {
  if (!e || typeof e !== "object") return null;
  const date = String(e.date || ""), who = String(e.who || "").slice(0, 10), title = String(e.title || "").trim().slice(0, 80);
  if (!DATE.test(date) || !who || !title) return null;
  const out = { date, who, title };
  if (e.time && TIME.test(String(e.time))) out.time = String(e.time);
  return out;
}
const same = (a, b) =>
  a.date === b.date && (a.time || "") === (b.time || "") && a.who === b.who && a.title === b.title;

async function onRequestGet({ env }) {
  if (!env.SCHEDULE) return json({ error: "no_kv" }, 500);
  const s = await load(env);
  return json({ events: s.events, done: s.done || {}, needCode: !!env.FAMILY_CODE });
}

async function onRequestPost({ request, env }) {
  if (!env.SCHEDULE) return json({ error: "no_kv" }, 500);
  if (env.FAMILY_CODE && request.headers.get("x-family-code") !== env.FAMILY_CODE)
    return json({ error: "code" }, 401);

  let b;
  try { b = await request.json(); } catch { return json({ error: "bad" }, 400); }

  const s = await load(env);
  let events = Array.isArray(s.events)
    ? s.events
    : (Array.isArray(b.seed) ? b.seed.map(clean).filter(Boolean) : []);
  let done = s.done || {};

  if (b.op === "add") {
    const n = clean(b.next); if (!n) return json({ error: "bad" }, 400);
    if (events.length >= 2000) return json({ error: "full" }, 400);
    events.push(n);
  } else if (b.op === "update" || b.op === "delete") {
    const o = clean(b.orig); if (!o) return json({ error: "bad" }, 400);
    const i = events.findIndex((e) => same(e, o));
    if (i < 0) return json({ error: "gone", events, done }, 409);
    if (b.op === "delete") events.splice(i, 1);
    else { const n = clean(b.next); if (!n) return json({ error: "bad" }, 400); events[i] = n; }
  } else if (b.op === "done") {
    const date = String(b.date || ""), key = String(b.key || "").slice(0, 60);
    if (!DATE.test(date) || !key) return json({ error: "bad" }, 400);
    const day = { ...(done[date] || {}) };
    if (b.value) day[key] = true; else delete day[key];
    done = { [date]: day }; // 오늘 것만 보관
  } else {
    return json({ error: "bad" }, 400);
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
  const next = { events, done };
  await env.SCHEDULE.put(KEY, JSON.stringify(next));
  return json(next);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/state") {
      if (request.method === "GET") return onRequestGet({ env });
      if (request.method === "POST") return onRequestPost({ request, env });
      return new Response("Method not allowed", { status: 405 });
    }
    return env.ASSETS.fetch(request);
  },
};
