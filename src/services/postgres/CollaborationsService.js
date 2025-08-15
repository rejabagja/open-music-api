const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration({ playlistId, userId }) {
    try {
      const playlistOwner = (
        await this._pool.query({
          text: 'SELECT owner FROM playlists WHERE id = $1',
          values: [playlistId],
        })
      ).rows[0].owner;

      if (playlistOwner && playlistOwner === userId) {
        throw new InvariantError(
          'Playlist owner tidak bisa menjadi collaborator'
        );
      }

      const id = `collab-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
        values: [id, playlistId, userId],
      };

      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Collaboration playlist gagal ditambahkan');
      }
      return result.rows[0].id;
    } catch (error) {
      if (error.message.includes('violates unique constraint')) {
        throw new InvariantError(
          'User sudah menjadi collaborator di playlist target'
        );
      }
      throw error;
    }
  }

  async deleteCollaboration({ playlistId, userId }) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(
        'Collaboration playlist gagal dihapus. playlistId atau userId tidak ditemukan'
      );
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;