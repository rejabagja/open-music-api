class AlbumLikesHandler {
  constructor(albumLikesService, albumsService) {
    this._albumLikesService = albumLikesService;
    this._albumsService = albumsService;
  }

  async postAlbumLikeHandler(request, h) {
    const userId = request.auth.credentials.id;
    const { id: albumId } = request.params;
    await this._albumsService.verifyAlbumId(albumId);

    await this._albumLikesService.addAlbumLike({ albumId, userId });

    const response = h.response({
      status: 'success',
      message: 'Album like berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const userId = request.auth.credentials.id;
    const { id: albumId } = request.params;
    await this._albumsService.verifyAlbumId(albumId);

    await this._albumLikesService.deleteAlbumLike({ albumId, userId });

    return {
      status: 'success',
      message: 'Album like berhasil dihapus',
    };
  }

  async getAlbumLikesHandler(request) {
    const { id: albumId } = request.params;
    const likes = await this._albumLikesService.getAlbumLikes(albumId);
    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }
}

module.exports = AlbumLikesHandler;