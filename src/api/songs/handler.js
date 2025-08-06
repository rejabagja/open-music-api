class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    await this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumId } =
    request.payload;
    const songId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

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

    if (title && performer) {
      const query = 'SELECT * FROM songs WHERE title ILIKE $1 OR performer ILIKE $2';
      const values = [`%${title}%`, `%${performer}%`];
      const result = await this._service.getSongsByQuery(query, values);
      return {
        status: 'success',
        message: `songs with title "${title}" or performer "${performer}"`,
        data: {
          songs: result,
        },
      };
    } else if (title) {
      const query = 'SELECT * FROM songs WHERE title ILIKE $1';
      const values = [`%${title}%`];
      const result = await this._service.getSongsByQuery(query, values);
      return {
        status: 'success',
        message: `songs with title "${title}"`,
        data: {
          songs: result,
        },
      };
    } else if (performer) {
      const query = 'SELECT * FROM songs WHERE performer ILIKE $1';
      const values = [`%${performer}%`];
      const result = await this._service.getSongsByQuery(query, values);
      return {
        status: 'success',
        message: `songs with performer "${performer}"`,
        data: {
          songs: result,
        },
      };
    }

    const songs = await this._service.getSongs();

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    await this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const { title, year, genre, performer, duration, albumId } =
      request.payload;
    await this._service.editSongById(id, {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
