const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelAlbum } = require('./../../utils/index');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT albums.*,
              COALESCE(
                  json_agg(
                      json_build_object(
                          'id', songs.id,
                          'title', songs.title,
                          'performer', songs.performer
                      )
                  ) FILTER (WHERE songs.id IS NOT NULL),
                  '[]'::json
              ) AS songs
              FROM albums
              LEFT JOIN songs ON songs.album_id = albums.id
              WHERE albums.id = $1
              GROUP BY albums.id`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return mapDBToModelAlbum(result.rows[0]);
  }

  async editAlbumById(id, { name, year, coverName }) {
    let updates = {
      name,
      year,
    };

    if (coverName) updates['cover_name'] = coverName;
    updates = Object.fromEntries(Object.entries(updates).filter(([key, value]) => key.length > 0 && value !== undefined));
    const query = {
      text: `UPDATE albums SET ${Object.keys(updates)
        .map((key) => `${key} = $${Object.keys(updates).indexOf(key) + 1}`)
        .join(', ')} WHERE id = $${
        Object.keys(updates).length + 1
      } RETURNING id`,
      values: [...Object.values(updates), id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyAlbumId(id) {
    try {
      await this.getAlbumById(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new InvariantError('albumId tidak valid');
      }
      throw error;
    }
  }
}

module.exports = AlbumsService;
