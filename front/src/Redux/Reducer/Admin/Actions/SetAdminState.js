const { Types } = require('../../../Actions');

export default {
    type: Types.SetAdminState,
    do(state, payload) {
        return Object.assign({}, state, payload);
    }
};