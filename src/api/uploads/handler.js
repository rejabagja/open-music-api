class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;
  }

  async postUploadCoverAlbumHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);
    const albumId = request.params.id;
    await this._albumsService.verifyAlbumId(albumId);

    const newCover = await this._storageService.writeFile(cover, cover.hapi);
    const {
      coverName: oldCover,
    } = await this._albumsService.getAlbumById(albumId);
    const editedAlbum = await this._albumsService.editAlbumById(albumId, { coverName: newCover });

    if (!editedAlbum) {
      this._storageService.deleteFile(newCover);
    }
    if (oldCover) {
      this._storageService.deleteFile(oldCover);
    }


    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;