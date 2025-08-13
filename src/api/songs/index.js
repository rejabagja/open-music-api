const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { songsService, albumsService, validator }) => {
    const songsHandler = new SongsHandler(songsService, albumsService, validator);
    server.route(routes(songsHandler));
  },
};
