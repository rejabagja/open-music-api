const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: (request, h) => handler.postAlbumHandler(request, h),
    options: {
      auth: 'open_music_jwt'
    }
  },
  {
    method: 'GET',
    path: '/albums',
    handler: () => handler.getAlbumsHandler(),
    options: {
      auth: 'open_music_jwt'
    }
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: (request) => handler.getAlbumByIdHandler(request),
    options: {
      auth: 'open_music_jwt'
    }
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: (request) => handler.putAlbumByIdHandler(request),
    options: {
      auth: 'open_music_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: (request) => handler.deleteAlbumByIdHandler(request),
    options: {
      auth: 'open_music_jwt'
    }
  },
];

module.exports = routes;
