const up = (pgm) => {
  pgm.addColumn(
    'albums',
    {
      cover_name: {
        type: 'TEXT',
        notNull: false,
        default: null,
      },
    },
    {
      ifNotExists: true,
    }
  );
};

const down = (pgm) => {
  pgm.dropColumn('albums', 'cover_name');
};

module.exports = { up, down };