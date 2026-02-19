export const shorthands = undefined;

export const up = (pgm) => {
    pgm.addColumn('albums', {
        cover: {
            type: 'TEXT',
            default: null
        }
    })
};

export const down = (pgm) => {
    pgm.dropColumn('albums', 'cover');
};
