import UserRepositories from '../repositories/user-repositories.js';
import response from '../../../utils/response.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

export const createUser = async (req, res, next) => {
    const { username, password, fullname } = req.validated;

    const isUsernameExist = await UserRepositories.verifyNewUsername(username);
    if (isUsernameExist) {
        return next(new InvariantError('Gagal menambahkan user. Username sudah digunakan.'))
    }

    const user = await UserRepositories.createUser({
        username,
        password,
        fullname,
    });

    if (!user) {
        return next(new NotFoundError('User gagal ditambahkan'));
    }

    return response(res, 201, 'User berhasil ditambahkan', user);
}