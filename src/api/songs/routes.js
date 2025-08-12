const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: (request, h) => handler.postSongHandler(request, h),
    options: {
      auth: 'open_music_jwt'
    }
  },
  {
    method: 'GET',
    path: '/songs',
    handler: (request) => handler.getSongsHandler(request),
    options: {
      auth: 'open_music_jwt'
    }
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: (request) => handler.getSongByIdHandler(request),
    options: {
      auth: 'open_music_jwt'
    }
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: (request) => handler.putSongByIdHandler(request),
    options: {
      auth: 'open_music_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: (request) => handler.deleteSongByIdHandler(request),
    options: {
      auth: 'open_music_jwt'
    }
  },
];

module.exports = routes;