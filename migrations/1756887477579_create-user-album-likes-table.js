const up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"albums"',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint(
    'user_album_likes',
    'unique_user_id_and_album_id',
    'UNIQUE(user_id, album_id)'
  );
};

const down = (pgm) => {
  pgm.dropTable('user_album_likes');
};

module.exports = { up, down };