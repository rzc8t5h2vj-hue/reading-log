// GET /api/cover?u=<표지 주소>  ->  이미지 바이트
// 브라우저가 표지를 내려받아 책등 색을 뽑고 작게 줄여 저장할 수 있도록 서버가 대신 가져와요.
// 카카오/다음 이미지 서버 외에는 가져오지 않고, 리다이렉트도 한 단계씩 확인해요.
const { allowedCoverHost } = require('./_books');

module.exports = async (req, res) => {
  const bad = (status, error, code) => res.status(status).json({ error, code });
  try {
    let u;
    try { u = new URL(String((req.query && req.query.u) || '')); } catch (e) { return bad(400, '주소가 올바르지 않아요.', 'bad_request'); }

    let r;
    for (let hop = 0; hop < 4; hop++) {
      if (u.protocol !== 'https:' || !allowedCoverHost(u.hostname)) return bad(400, '허용되지 않은 주소예요.', 'bad_request');
      r = await fetch(u.href, { redirect: 'manual' });
      if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
        u = new URL(r.headers.get('location'), u);
        continue;
      }
      break;
    }
    const type = (r && r.headers.get('content-type')) || '';
    if (!r || !r.ok || type.indexOf('image/') !== 0) return bad(502, '표지를 가져오지 못했어요.', 'bad_response');

    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 3 * 1024 * 1024) return bad(502, '표지 파일이 너무 커요.', 'too_large');
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, s-maxage=604800, max-age=86400');
    res.status(200).send(buf);
  } catch (e) {
    bad(502, '표지를 가져오지 못했어요.', 'server_error');
  }
};
