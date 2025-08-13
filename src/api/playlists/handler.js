class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    await this._validator.validatePlaylistPayload(request.payload);
    const owner = request.auth.credentials.id;

    const playlistId = await this._service.addPlaylist({ name: request.payload.name, owner });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const owner = request.auth.credentials.id;
    const playlists = await this._service.getPlaylists(owner);

    return {
      status: 'success',
      data: {
        playlists,
      }
    };
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    const currentUserId = request.auth.credentials.id;
    await this._service.verifyPlaylistOwner(id, currentUserId);

    await this._service.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;