// Cloudflare Worker — 가족 스케줄 저장 기능 (수정하지 않아도 됩니다)
// 월간 스케줄, 주간 픽업, 가족 메모, 픽업 완료를 KV(SCHEDULE)에 저장합니다.

const KEY = "state";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function load(env) {
  return (await env.SCHEDULE.get(KEY, "json")) || {};
}

function cleanEvent(e) {
  if (!e || typeof e !== "object") return null;
  const date = String(e.date || ""), who = String(e.who || "").slice(0, 10), title = String(e.title || "").trim().slice(0, 80);
  if (!DATE.test(date) || !who || !title) return null;
  const out = { date, who, title };
  if (e.time && TIME.test(String(e.time))) out.time = String(e.time);
  return out;
}
function cleanPickup(p) {
  if (!p || typeof p !== "object") return null;
  const day = String(p.day || ""), time = String(p.time || ""), who = String(p.who || "").slice(0, 10), place = String(p.place || "").trim().slice(0, 40);
  if (!DAYS.includes(day) || !TIME.test(time) || !who) return null;
  return { day, time, who, place };
}
function cleanNote(n) {
  const t = String(n ?? "").trim().slice(0, 200);
  return t || null;
}
const sameEvent = (a, b) => a.date === b.date && (a.time || "") === (b.time || "") && a.who === b.who && a.title === b.title;
const samePickup = (a, b) => a.day === b.day && a.time === b.time && a.who === b.who && (a.place || "") === (b.place || "");

function view(s, env) {
  return { events: s.events ?? null, pickups: s.pickups ?? null, notes: s.notes ?? null, done: s.done || {}, needCode: !!env.FAMILY_CODE };
}

// Apply add/update/delete to a list; returns an error string or null.
function applyOp(list, op, orig, next, clean, same, max) {
  if (op === "add") {
    const n = clean(next); if (!n) return "bad";
    if (list.length >= max) return "full";
    list.push(n); return null;
  }
  if (op === "update" || op === "delete") {
    const o = clean(orig); if (!o) return "bad";
    const i = list.findIndex((x) => same(x, o));
    if (i < 0) return "gone";
    if (op === "delete") { list.splice(i, 1); return null; }
    const n = clean(next); if (!n) return "bad";
    list[i] = n; return null;
  }
  return "bad";
}

async function onGet(env) {
  if (!env.SCHEDULE) return json({ error: "no_kv" }, 500);
  return json(view(await load(env), env));
}

async function onPost(request, env) {
  if (!env.SCHEDULE) return json({ error: "no_kv" }, 500);
  if (env.FAMILY_CODE && request.headers.get("x-family-code") !== env.FAMILY_CODE)
    return json({ error: "code" }, 401);

  let b;
  try { b = await request.json(); } catch { return json({ error: "bad" }, 400); }
  const seed = (b.seed && typeof b.seed === "object") ? b.seed : {};

  const s = await load(env);
  const events = Array.isArray(s.events) ? s.events : (Array.isArray(seed.events) ? seed.events.map(cleanEvent).filter(Boolean) : []);
  const pickups = Array.isArray(s.pickups) ? s.pickups : (Array.isArray(seed.pickups) ? seed.pickups.map(cleanPickup).filter(Boolean) : []);
  const notes = Array.isArray(s.notes) ? s.notes : (Array.isArray(seed.notes) ? seed.notes.map(cleanNote).filter(Boolean) : []);
  let done = s.done || {};
  const kind = b.kind || "event";
  let err = null;

  if (b.op === "done") {
    const date = String(b.date || ""), key = String(b.key || "").slice(0, 80);
    if (!DATE.test(date) || !key) return json({ error: "bad" }, 400);
    const day = { ...(done[date] || {}) };
    if (b.value) day[key] = true; else delete day[key];
    done = { [date]: day }; // 오늘 것만 보관
  } else if (kind === "event") {
    err = applyOp(events, b.op, b.orig, b.next, cleanEvent, sameEvent, 2000);
  } else if (kind === "pickup") {
    err = applyOp(pickups, b.op, b.orig, b.next, cleanPickup, samePickup, 100);
  } else if (kind === "note") {
    err = applyOp(notes, b.op, b.orig, b.next, cleanNote, (a, c) => a === c, 50);
  } else err = "bad";

  const state = { events, pickups, notes, done };
  if (err === "gone") return json({ error: "gone", ...view(state, env) }, 409);
  if (err) return json({ error: err }, 400);

  events.sort((a, c) => a.date.localeCompare(c.date) || (a.time || "").localeCompare(c.time || ""));
  pickups.sort((a, c) => DAYS.indexOf(a.day) - DAYS.indexOf(c.day) || a.time.localeCompare(c.time));
  await env.SCHEDULE.put(KEY, JSON.stringify(state));
  return json(view(state, env));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/state") {
      if (request.method === "GET") return onGet(env);
      if (request.method === "POST") return onPost(request, env);
      return new Response("Method not allowed", { status: 405 });
    }
    return env.ASSETS.fetch(request);
  },
};
