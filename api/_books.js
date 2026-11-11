// 책 검색 공통 도우미. 파일 이름이 _로 시작하면 Vercel이 API 주소로 열지 않아요.
// 검색과 표지는 카카오(Daum) 책 검색, 쪽수는 Google Books에서 가져와요.
const KAKAO_URL = 'https://dapi.kakao.com/v3/search/book';
const GOOGLE_URL = 'https://www.googleapis.com/books/v1/volumes';

function kakaoKey() {
  return process.env.KAKAO_REST_API_KEY || '';
}

function fail(message, code) {
  const e = new Error(message);
  e.code = code;
  return e;
}

async function kakaoSearch(params) {
  const r = await fetch(KAKAO_URL + '?' + new URLSearchParams(params), {
    headers: { Authorization: 'KakaoAK ' + kakaoKey() },
  });
  let json = {};
  try { json = await r.json(); } catch (e) { /* 아래에서 처리 */ }
  if (r.status === 401 || r.status === 403) throw fail('카카오 REST API 키가 올바르지 않거나 권한이 없어요.', 'bad_key');
  if (r.status === 429) throw fail('카카오 호출 한도를 넘었어요. 잠시 후 다시 시도해 주세요.', 'rate_limited');
  if (!r.ok) throw fail((json && json.message) || '카카오 책 검색 오류', 'upstream_error');
  return json;
}

// "채식주의자 - 2024 노벨문학상 수상작" 처럼 붙은 부제를 떼요.
function cleanTitle(t) {
  return String(t || '').split(' - ')[0].trim();
}

// 카카오 isbn은 "8936434128 9788936434120"처럼 10자리와 13자리가 함께 올 수 있어요.
function pickIsbn(raw) {
  const parts = String(raw || '').split(/\s+/).map((s) => s.replace(/[^0-9Xx]/g, '')).filter(Boolean);
  return parts.find((p) => p.length === 13) || parts.find((p) => p.length === 10) || '';
}

function https(u) {
  return String(u || '').replace(/^http:\/\//, 'https://');
}

// 카카오 썸네일 주소의 fname 값에는 더 큰 원본 이미지 주소가 들어 있어요.
function originalCover(thumb) {
  try {
    const f = new URL(thumb).searchParams.get('fname');
    return f ? https(f) : '';
  } catch (e) {
    return '';
  }
}

// 표지 프록시가 가져와도 되는 이미지 서버
function allowedCoverHost(h) {
  return /(^|\.)kakaocdn\.net$/.test(h) || /(^|\.)daumcdn\.net$/.test(h);
}

async function googlePages(isbn) {
  const params = { q: 'isbn:' + isbn, maxResults: '1', fields: 'items(volumeInfo/pageCount)' };
  if (process.env.GOOGLE_BOOKS_API_KEY) params.key = process.env.GOOGLE_BOOKS_API_KEY;
  const r = await fetch(GOOGLE_URL + '?' + new URLSearchParams(params));
  if (!r.ok) return 0;
  const j = await r.json().catch(() => ({}));
  const n = j.items && j.items[0] && j.items[0].volumeInfo && Number(j.items[0].volumeInfo.pageCount);
  return n > 0 ? n : 0;
}

function sendError(res, e) {
  const code = e && e.code ? e.code : 'server_error';
  const status = code === 'no_key' || code === 'bad_key' ? 500 : code === 'bad_request' ? 400 : code === 'rate_limited' ? 429 : 502;
  res.status(status).json({ error: e && e.message ? e.message : 'error', code });
}

module.exports = { kakaoKey, kakaoSearch, cleanTitle, pickIsbn, https, originalCover, allowedCoverHost, googlePages, fail, sendError };
