const { SongPayloadSchema, SongQuerySchema } = require('./schema');
const AlbumsService = require('../../services/postgres/AlbumsService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

const SongsValidator = {
  validateSongQuery: (query) => {
    const validationResult = SongQuerySchema.validate(query);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
    return validationResult.value;
  },
  validateSongPayload: async (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
    if (typeof payload.albumId === 'string' && payload.albumId.length > 0) {
      try {
        const albumService = new AlbumsService();
        await albumService.getAlbumById(payload.albumId);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new InvariantError('albumId tidak ditemukan');
        }
        throw error;
      }
    }
  },
};

module.exports = SongsValidator;
