import Axios from 'axios';
import { toast } from 'react-toastify';
import localStorage from '../Receiver/localstorage';

class Rest {
    constructor(parent) {
        this.parent = parent;
        this.updateGroupName = this.updateGroupName.bind(this);
        this.updateGroupDescription = this.updateGroupDescription.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.reloadGroupDisplays = this.reloadGroupDisplays.bind(this);
        this.toggleOSD = this.toggleOSD.bind(this);
        this.preview = this.preview.bind(this);
        this.addDashboard = this.addDashboard.bind(this);
    }

    updateGroupName(newName) {
        Axios.put('/api/group/' + this.parent.props.group.id, { name: newName })
            .catch(() => toast.error('Failed to edit group\'s name'));
    }

    updateGroupDescription(newDescription) {
        Axios.put('/api/group/'+ this.parent.props.group.id, { description: newDescription })
            .catch(() => toast.error('Failed to edit group\'s description.'));
    }

    deleteGroup() {
        Axios.delete('/api/group/'+ this.parent.props.group.id)
            .catch(() => toast.error('Failed to delete the group.'));
    }

    reloadGroupDisplays() {
        const promises = Object.values(this.parent.props.group.displays).map((display) => {
            if (display.connected)
                return Axios.post('/api/display/'+ display.name +'/action', { action: 'reload' });
        });
        Promise.all(promises)
            .then(() => toast.success('Successfully reloaded all displays.'))
            .catch(() => toast.error('Failed to reload all displays.'));
    }

    toggleOSD() {
        const enable = !Object.values(this.parent.props.group.displays).every((display) => !display.connected || display.osd);
        const promises = Object.values(this.parent.props.group.displays).map((display) => {
            if (display.connected)
                return Axios.post('/api/display/'+ display.name +'/action',
                    { action: 'osd', text: enable || !display.osd ? display.name : null });
        });
        Promise.all(promises)
            .then(() => toast.success('Successfully set OSD on all displays.'))
            .catch(() => toast.error('Failed to set OSD on all displays.'));
    }

    preview() {
        Axios.post('/api/preview/group/' + this.parent.props.group.id, { blob: localStorage.getItem('register') })
            .catch(() => toast.error('Failed to preview group.'));
    }

    addDashboard(inputs) {
        Axios.post('/api/group/' + this.parent.props.group.id + "/dashboard", inputs)
            .then(() => toast.success('Successfully added dashboard.'))
            .catch(() => toast.error('Failed to add dashboard.'));
    }
}

export default Rest;