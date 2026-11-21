const { send, route, cookie } = require('../../lib/common');
module.exports = route(['POST'], async (req, res) => {
  res.setHeader('Set-Cookie', cookie(req, '', 0));
  send(res, 200, { ok: true });
});
