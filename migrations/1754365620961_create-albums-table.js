const up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'CHAR(22)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
    'created_at': {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    'updated_at': {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

const down = (pgm) => {
  pgm.dropTable('albums');
};

module.exports = { up, down };