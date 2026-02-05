export const shorthands = undefined;

export const up = (pgm) => {
    pgm.createTable('playlist', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        name: {
            type: 'VARCHAR(50)',
            notNull: true
        },
        owner: {
            type: 'VARCHAR(50)',
            references: 'users(id)'
        }
    })
};

export const down = (pgm) => {
    pgm.dropTable('playlist');
};
