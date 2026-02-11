export const shorthands = undefined;

export const up = (pgm) => {
    pgm.createTable('playlist_song_activities', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            references: 'playlist(id)'
        },
        song_id: {
            type: 'VARCHAR(50)',
        },
        user_id: {
            type: 'VARCHAR(50)',
        },
        action: {
            type: 'VARCHAR(50)',
        },
        time:{
            type: 'TIMESTAMPTZ',
        }
    })
};

export const down = (pgm) => {
    pgm.dropTable('playlist_song_activities');
};
