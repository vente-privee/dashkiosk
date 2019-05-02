import Axios from 'axios';
import { toast } from 'react-toastify';
import Store from '../../Store';

class Rest {
    editRank(groupIndex) {
        const group = Store.getState().admin.groups[groupIndex];
        return new Promise((resolve, reject) => {
            Axios.put(`/api/group/rank/${group.id}`, { rank: groupIndex })
                .then(() => resolve())
                .catch(() => {
                    toast.error('Failed to edit group rank.')
                    reject();
                });
        });
    }
};

export default Rest;