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

  async getPlaylistsHandler(request, h) {
    const userId = request.auth.credentials.id;
    const { playlists, isCached } = await this._playlistsService.getPlaylists(userId);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    if (isCached) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    const currentUserId = request.auth.credentials.id;
    await this._playlistsService.verifyPlaylistOwner(id, currentUserId);

    await this._playlistsService.deletePlaylistById(id, currentUserId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    const { id: playlistId } = request.params;
    const currentUserId = request.auth.credentials.id;
    await this._playlistsService.verifyPlaylistAccess(playlistId, currentUserId);
    await this._validator.validatePostPlaylistSongPayload(request.payload);
    await this._songsService.verifySong(request.payload.songId);

    const { songId } = request.payload;
    await this._playlistsService.addPlaylistSong({ playlistId, songId, userId: currentUserId });
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
    const { id: playlistId } = request.params;
    const currentUserId = request.auth.credentials.id;
    await this._playlistsService.verifyPlaylistAccess(playlistId, currentUserId);
    await this._validator.validateDeletePlaylistSongPayload(request.payload);
    await this._songsService.verifySong(request.payload.songId);

    const { songId } = request.payload;
    await this._playlistsService.deletePlaylistSong({ playlistId, songId, userId: currentUserId });
    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const currentUserId = request.auth.credentials.id;
    await this._playlistsService.verifyPlaylistAccess(playlistId, currentUserId);

    const activities = await this._playlistsService.getPlaylistActivities(playlistId);
    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      }
    };
  }
}

module.exports = PlaylistsHandler;