class SongsHandler {
  constructor(songsService, albumsService, validator) {
    this._songsService = songsService;
    this._albumsService = albumsService;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    await this._validator.validateSongPayload(request.payload);
    if (request.payload.albumId) {
      await this._albumsService.verifyAlbumId(request.payload.albumId);
    }
    const songId = await this._songsService.addSong(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const { title = '', performer = '' } = request.query;
    this._validator.validateSongQuery({ title, performer });

    const songs = await this._songsService.getSongs(title, performer);

    let message = '';
    if (title && performer) {
      message = `Song with title "${title}" and performer "${performer}"`;
    } else if (title) {
      message = `Song with title "${title}"`;
    } else if (performer) {
      message = `Song with performer "${performer}"`;
    }

    return {
      status: 'success',
      ...(message && { message }),
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._songsService.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    await this._validator.validateSongPayload(request.payload);
    if (request.payload.albumId) {
      await this._albumsService.verifyAlbumId(request.payload.albumId);
    }

    const { id } = request.params;
    await this._songsService.editSongById(id, request.payload);
    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._songsService.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
