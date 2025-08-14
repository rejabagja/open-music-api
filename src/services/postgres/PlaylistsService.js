const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    try {
      const id = `playlist-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
        values: [id, name, owner],
      };

      const result = await this._pool.query(query);
      if (!result.rows[0].id) {
        throw new InvariantError('Playlist gagal ditambahkan');
      }

      return result.rows[0].id;
    } catch (error) {
      console.log('HALLO');
      throw error;
    }
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            LEFT JOIN users ON users.id = playlists.owner
            WHERE playlists.owner = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addPlaylistSong({ playlistId, songId }) {
    try {
      const id = `pls-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
        values: [id, playlistId, songId],
      };

      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Song gagal ditambahkan ke dalam playlist');
      }

      return result.rows[0].id;
    } catch (error) {
      if (
        error.message.includes('violates unique constraint')
      ) {
        throw new InvariantError('Song sudah ada di dalam playlist');
      }

      throw error;
    }
  }

  async getPlaylistSongs(playlistId, userId) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username
            FROM playlists
            INNER JOIN users ON users.id = playlists.owner
            WHERE playlists.id = $1 AND users.id = $2`,
      values: [playlistId, userId]
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);
    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = resultPlaylist.rows[0];

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
            FROM songs
            INNER JOIN playlist_songs ON playlist_songs.song_id = songs.id
            WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId]
    };
    const songs = await this._pool.query(querySongs);
    playlist.songs = songs.rows;

    return playlist;
  }

  async deletePlaylistSong({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus song dari playlist. playlistId atau songId tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;