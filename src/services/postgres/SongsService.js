const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelSong } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT * FROM songs');
    return result.rows.map(mapDBToModelSong).map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows.map(mapDBToModelSong).map((song) => ({
      id: song.id,
      title: song.title,
      year: song.year,
      performer: song.performer,
      genre: song.genre,
      duration: song.duration,
      albumId: song.albumId,
    }))[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();
    const updates = {
      title,
      year,
      genre,
      performer,
      updated_at: updatedAt, // eslint-disable-line
    };

    if (duration !== undefined) updates.duration = duration;
    if (albumId !== undefined) updates.album_id = albumId; // eslint-disable-line

    const query = {
      text: `UPDATE songs SET ${Object.keys(updates)
        .map((key) => `${key} = $${Object.keys(updates).indexOf(key) + 1}`)
        .join(', ')} WHERE id = $${
        Object.keys(updates).length + 1
      } RETURNING id`,
      values: [...Object.values(updates), id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }

  async getSongsByQuery(query, values) {
    const result = await this._pool.query(query, values);
    return result.rows.map(mapDBToModelSong).map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));
  }
}

module.exports = SongsService;
