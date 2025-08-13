const up = (pgm) => {
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

const down = (pgm) => {
  pgm.dropTable('authentications');
};

module.exports = { up, down };
