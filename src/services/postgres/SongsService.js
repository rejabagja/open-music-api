const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelSong } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong(payload) {
    const { title, year, genre, performer, duration, albumId } = payload;
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title = '', performer = '') {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
      values: [`%${title}%`, `%${performer}%`],
    };

    const { rows } = await this._pool.query(query);
    return rows;
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

    return result.rows.map(mapDBToModelSong)[0];
  }

  async editSongById(id, payload) {
    const { title, year, genre, performer, duration, albumId } = payload;
    let updates = {
      title,
      year,
      genre,
      performer,
    };

    if (duration) updates.duration = duration;
    if (albumId) updates['album_id'] = albumId;

    updates = Object.fromEntries(
      Object.entries(updates).filter(
        ([key, value]) => key.length > 0 && value !== undefined
      )
    );
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

  async verifySong(id) {
    try {
      await this.getSongById(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw error;
    }
  }
}

module.exports = SongsService;
