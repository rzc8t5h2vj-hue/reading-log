// GET /api/search?q=제목  ->  { items: [{ title, author, publisher, pubYear, cover, coverHd, isbn }] }
const { kakaoKey, kakaoSearch, cleanTitle, pickIsbn, https, originalCover, fail, sendError } = require('./_books');

module.exports = async (req, res) => {
  try {
    if (!kakaoKey()) throw fail('KAKAO_REST_API_KEY 환경변수가 설정되지 않았어요.', 'no_key');
    const q = String((req.query && req.query.q) || '').trim().slice(0, 100);
    if (!q) throw fail('검색어가 비어 있어요.', 'bad_request');

    let data = await kakaoSearch({ query: q, target: 'title', size: '8', sort: 'accuracy' });
    if (!data.documents || !data.documents.length) {
      data = await kakaoSearch({ query: q, size: '8', sort: 'accuracy' }); // 저자명 등으로도 찾아봐요
    }
    const items = (data.documents || []).map((d) => ({
      title: cleanTitle(d.title),
      author: (d.authors || []).slice(0, 3).join(', '),
      publisher: d.publisher || '',
      pubYear: d.datetime ? Number(String(d.datetime).slice(0, 4)) || 0 : 0,
      cover: https(d.thumbnail),
      coverHd: originalCover(d.thumbnail),
      isbn: pickIsbn(d.isbn),
    })).filter((x) => x.title);

    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    res.status(200).json({ items });
  } catch (e) {
    sendError(res, e);
  }
};
