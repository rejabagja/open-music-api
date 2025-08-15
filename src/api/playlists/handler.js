class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    await this._validator.validatePostPlaylistPayload(request.payload);
    const owner = request.auth.credentials.id;

    const playlistId = await this._playlistsService.addPlaylist({ name: request.payload.name, owner });
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
    const userId = request.auth.credentials.id;
    const playlists = await this._playlistsService.getPlaylists(userId);

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
    await this._playlistsService.verifyPlaylistOwner(id, currentUserId);

    await this._playlistsService.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    const { id: playlistId } = request.params;
    const currentUserId = request.auth.credentials.id;
    await this._validator.validatePostPlaylistSongPayload(request.payload);
    await this._songsService.verifySong(request.payload.songId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, currentUserId);

    const { songId } = request.payload;
    await this._playlistsService.addPlaylistSong({ playlistId, songId });
    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: playlistId } = request.params;
    const currentUserId = request.auth.credentials.id;
    await this._playlistsService.verifyPlaylistAccess(playlistId, currentUserId);

    const playlist = await this._playlistsService.getPlaylistSongs(playlistId, currentUserId);
    return {
      status: 'success',
      data: {
        playlist
      }
    };
  }

  async deletePlaylistSongHandler(request) {
    await this._validator.validateDeletePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const currentUserId = request.auth.credentials.id;
    await this._playlistsService.verifyPlaylistAccess(playlistId, currentUserId);

    const { songId } = request.payload;
    await this._playlistsService.deletePlaylistSong({ playlistId, songId });
    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;