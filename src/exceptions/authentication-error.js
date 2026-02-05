import ClientError from './client-error.js';

class Authenticationerror extends ClientError {
    constructor(message) {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

export default Authenticationerror;