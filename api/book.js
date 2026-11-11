// GET /api/book?isbn=9788936434120  ->  { pages: 188 }
// 카카오 검색 결과에는 쪽수가 없어서 Google Books에서 ISBN으로 보충해요. 없으면 0이에요.
const { googlePages, fail, sendError } = require('./_books');

module.exports = async (req, res) => {
  try {
    const isbn = String((req.query && req.query.isbn) || '').replace(/[^0-9Xx]/g, '');
    if (isbn.length !== 10 && isbn.length !== 13) throw fail('ISBN 형식이 올바르지 않아요.', 'bad_request');
    const pages = await googlePages(isbn).catch(() => 0);
    res.setHeader('Cache-Control', 'public, s-maxage=86400');
    res.status(200).json({ pages });
  } catch (e) {
    sendError(res, e);
  }
};
