class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    await this._validator.validateCollaborationPayload(request.payload);

    const currentUserId = request.auth.credentials.id;
    const { playlistId, userId } = request.payload;
    await this._playlistsService.verifyPlaylistAccess(playlistId, currentUserId);
    await this._usersService.verifyUserId(userId);

    const collaborationId = await this._collaborationsService.addCollaboration({
      playlistId,
      userId,
    });
    const response = h.response({
      status: 'success',
      message: 'Playlist collaboration berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    await this._validator.validateCollaborationPayload(request.payload);

    const currentUserId = request.auth.credentials.id;
    const { playlistId, userId } = request.payload;
    await this._playlistsService.verifyPlaylistAccess(playlistId, currentUserId);
    await this._usersService.verifyUserId(userId);

    await this._collaborationsService.deleteCollaboration({
      playlistId,
      userId,
    });
    return {
      status: 'success',
      message: 'Playlist collaboration berhasil dihapus'
    };
  }
}

module.exports = CollaborationsHandler;