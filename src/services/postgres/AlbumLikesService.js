const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('./../../exceptions/InvariantError');
const NotFoundError = require('./../../exceptions/NotFoundError');

class AlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
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

      await this._cacheService.delete(`albumLikes:${albumId}`);
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

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`albumLikes:${albumId}`);
      return {
        likes: JSON.parse(result),
        isCached: true,
      };
    } catch (error) {
      console.error(error.message);
      const query = {
        text: 'SELECT COUNT(*)::int AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(
        `albumLikes:${albumId}`,
        JSON.stringify(result.rows[0].likes),
        1800
      );

      return {
        likes: result.rows[0].likes,
        isCached: false,
      };
    }
  }
}

module.exports = AlbumLikesService;
