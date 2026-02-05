export const shorthands = undefined;

export const up = (pgm) => {
    pgm.createTable('songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        album_id: {
            type: 'VARCHAR(50)',
            references: 'albums(id)'
        },
        title: {
            type: 'TEXT',
            notNull: true
        },
        year: {
            type: 'INTEGER',
            notNull: true
        },
        genre: {
            type: 'TEXT',
            notNull: true
        },
        performer: {
            type: 'TEXT',
            notNull: true
        },
        duration: {
            type: 'INTEGER'
        },
    })
};

export const down = (pgm) => {
    pgm.dropTable('songs');
};
