export const shorthands = undefined;

export const up = (pgm) => {
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            references: 'playlist(id)'
        },
        user_id: {
            type: 'VARCHAR(50)',
            references: 'users(id)'
        },
    })
};

export const down = (pgm) => {
    pgm.dropTable('collaborations');
};
