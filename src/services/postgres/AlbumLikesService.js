const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('./../../exceptions/InvariantError');
const NotFoundError = require('./../../exceptions/NotFoundError');

class AlbumLikesService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbumLike({ userId, albumId }) {
    try {
      const id = `albumlike-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };

      const result = await this._pool.query(query);
      if (!result.rows[0].id) {
        throw new InvariantError('Album like gagal ditambahkan');
      }

      return result.rows[0].id;
    } catch (error) {
      if (error.message.includes('violates unique constraint')) {
        throw new InvariantError('Anda sudah menyukai album ini');
      }

      throw error;
    }
  }

  async deleteAlbumLike({ userId, albumId }) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album like gagal dihapus. Id tidak ditemukan');
    }
  }

  async getAlbumLikes(albumId) {
    const query = {
      text: 'SELECT COUNT(*)::int AS likes FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    return result.rows[0].likes;
  }
}

module.exports = AlbumLikesService;
