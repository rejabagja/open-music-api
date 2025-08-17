const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService, playlistActivitiesService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._playlistActivitiesService = playlistActivitiesService;
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
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
            WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
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

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
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

  async addPlaylistSong({ playlistId, songId, userId }) {
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

      await this._playlistActivitiesService.addActivity({
        playlistId,
        songId,
        userId,
        action: 'add',
      });

      return result.rows[0].id;
    } catch (error) {
      if (error.message.includes('violates unique constraint')) {
        throw new InvariantError('Song sudah ada di dalam playlist');
      }

      throw error;
    }
  }

  async getPlaylistSongs(playlistId, userId) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username 
            FROM playlists
            LEFT JOIN users ON users.id = playlists.owner
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
            WHERE (playlists.owner = $1 OR collaborations.user_id = $1) AND playlists.id = $2`,
      values: [userId, playlistId],
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
      values: [playlistId],
    };
    const songs = await this._pool.query(querySongs);
    playlist.songs = songs.rows;

    return playlist;
  }

  async deletePlaylistSong({ playlistId, songId, userId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(
        'Gagal menghapus song dari playlist. Song tidak ditemukan di dalam playlist'
      );
    }

    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: 'delete',
    });
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }

  async getPlaylistActivities(playlistId) {
    return await this._playlistActivitiesService.getActivities(playlistId);
  }
}

module.exports = PlaylistsService;