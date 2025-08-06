/* eslint-disable camelcase */

const up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'CHAR(22)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
    },
    album_id: {
      type: 'CHAR(22)',
      references: '"albums"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    updated_at: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

const down = (pgm) => {
  pgm.dropTable('songs');
};

module.exports = { up, down };