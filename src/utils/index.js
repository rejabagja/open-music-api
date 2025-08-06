const mapDBToModelAlbum = (dbPayload) => {
  const album = {
    id: dbPayload.id,
    name: dbPayload.name,
    year: dbPayload.year
  };
  album.createdAt = dbPayload['created_at'];
  album.updatedAt = dbPayload['updated_at'];
  return album;
};

const mapDBToModelSong = (dbPayload) => {
  const song = {
    id: dbPayload.id,
    title: dbPayload.title,
    year: dbPayload.year,
    genre: dbPayload.genre,
    performer: dbPayload.performer,
    duration: dbPayload.duration,
    albumId: dbPayload.album_id
  };
  song.createdAt = dbPayload['created_at'];
  song.updatedAt = dbPayload['updated_at'];
  return song;
};

module.exports = { mapDBToModelAlbum, mapDBToModelSong };
