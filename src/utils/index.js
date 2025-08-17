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

const mapRecordDBToModelSong = ({ id, title, performer }) => ({
  id,
  title,
  performer
});

module.exports = { mapDBToModelSong, mapRecordDBToModelSong };
