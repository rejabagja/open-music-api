const mapDBToModelSong = (dbField) => {
  const song = {
    id: dbField.id,
    title: dbField.title,
    year: dbField.year,
    genre: dbField.genre,
    performer: dbField.performer,
    duration: dbField.duration,
  };
  song.albumId = dbField['album_id'];
  return song;
};

const mapDBToModelAlbum = (dbField) => {
  const album = {
    id: dbField.id,
    name: dbField.name,
    year: dbField.year,
    songs: dbField.songs,
  };
  album.coverName = dbField['cover_name'];
  return album;
};

module.exports = { mapDBToModelSong, mapDBToModelAlbum };
