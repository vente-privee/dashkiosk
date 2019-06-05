import React, { Component } from 'react';
import { Modal, Button, Container, Form, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Axios from 'axios';
import { IoIosSave } from 'react-icons/io';
import Swap from '../../Swap';
import DashboardSelection from './dashboardSelection';
import SavedDashboard from './savedDashboard';
import Store from '../../../Store';
import { connect } from 'react-redux';
import { Types, action } from '../../../Actions';
import ImportedImage from '../../uploadImage/importedImage';
import NewDashboard from './newDashboard';

class ModalDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      save: false,
      newDashboard: true,
      images: false,
      validated: false,
      Timeout: '',
      Viewport: '',
      Delay: '',
      Url: [''],
      Available: '',
      Description: '',
      delayTime: 'sec',
      timeoutTime: 'sec',
      templates: [],
      watermark: '',
      watermarkPosition: 'center',
      submitLoad: false,
      chosedTemplate: {
        name: 'None',
        url: 1
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.show && !prevProps.show)
      this.reinitialise();
  }

  componentDidMount() {
    Axios.get('/api/multi-dashboards')
      .then((res) => this.setState({ templates: res.data }))
      .catch((err) => toast.error(`Failed to get dashboard templates:\n${err.message}`));
  }

  setTime = (time, value) => {
    return (time === 'hour' ? (value * 60 * 60) : (value * 60));
  }

  reinitialise = () => {
    this.setState({
      Timeout: '',
      Viewport: '',
      Delay: '',
      Url: [''],
      Available: '',
      Description: '',
      delayTime: 'sec',
      timeoutTime: 'sec',
      watermark: '',
      watermarkPosition: 'center',
      templates: [],
      save: false,
      newDashboard: true,
      images: false,
      chosedTemplate: {
        name: 'None',
        url: 1
      }
    });
    this.componentDidMount();
  }

  shouldComponentUpdate(prevProps, prevState) {
    if (this.props.show !== prevProps.show || prevState !== this.state)
      return true;
    return false;
  }

  unassigned = () => {
    const body = {
      url: '/unassigned',
      description: 'Dashboard for unassigned display',
      timeout: null,
      delay: null,
      viewport: null,
      availability: null,
      template: {
        name: 'None',
        url: 1
      }
    };
    this.props.rest.addDashboard(body);
    this.closeModal();
  }

  isValidViewport = () => {
    var reg = new RegExp("^[1-9]\\d*[x][1-9]\\d*$");

    if (this.state.Viewport.length > 0) {
      return reg.test(this.state.Viewport);
    }
    return true;
  }

  handleInput = (inputName, inputValue, event, index) => {
    if ((inputName === 'Timeout' && inputValue <= 0) || (inputName === 'Delay' && inputValue <= 0))
      inputValue = '';
    if (inputName === 'setUrl') {
      this.setState({ 'Url': inputValue })
    } else if (inputName !== 'Url') {
      this.setState({ [inputName]: inputValue });
    } else {
      const urls = [...this.state.Url];
      urls[index] = inputValue;
      this.setState({ Url: urls });
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const delay = (this.state.delayTime === 'sec'
      ? this.state.Delay
      : this.setTime(this.state.delayTime, this.state.Delay));
    const timeout = (this.state.timeoutTime === 'sec'
      ? this.state.Timeout
      : this.setTime(this.state.timeoutTime, this.state.Timeout));
    const body = {
      url: this.state.Url.length <= 1 ? this.state.Url[0] : this.state.Url,
      template: this.state.chosedTemplate,
      description: this.state.Description,
      timeout: (timeout === 0 || timeout === '' ? null : timeout),
      delay: (delay === 0 || delay === '' ? null : delay),
      viewport: (this.state.Viewport === '' ? null : this.state.Viewport),
      availability: this.state.Available,
      watermark: this.state.watermark,
      watermarkPosition: this.state.watermarkPosition,
    };
    if (this.state.save)
      this.props.rest.saveDashboard(body);
    this.props.rest.addDashboard(body);
    this.reinitialise();
    this.closeModal();
  }

  validateImage = () => {
    if (this.state.images.name === 'Url') {
      const urls = [...this.state.Url];
      urls[this.state.images.index] = this.state.newImageUrl || '';
      this.setState({ Url: urls });
      this.setState({ images: false });
    } else {
      this.setState({[this.state.images.name]: this.state.newImageUrl || ''})
      this.setState({ images: false });
    }
  }

  closeModal = () => {
    Store.dispatch(action(Types.SetModal, {
      modal: {
        show: false
      }
    }));
  }

  render() {
    const importedImagesValue = 
    ((this.state.images.name === 'Url')
      ? this.state[this.state.images.name][this.state.images.index]
      : this.state[this.state.images.name]) 
    const template = this.state.chosedTemplate;
    return (
      <Modal
        rest={this.props.rest} group={this.props.group}
        show={this.props.show === 'addDashboard'} onHide={this.closeModal}
        className='onTop'
        size='lg'
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Form
          onSubmit={this.handleSubmit}
          noValidate
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              <Col sm={12}>
                Add a new dashboard to group
                </Col>
              <Col sm={12} className="font-italic text-muted">
                {this.props.group.name}
              </Col>
            </Modal.Title>
          </Modal.Header>
          <DashboardSelection handleInput={this.handleInput} newDashboard={this.state.newDashboard} />
          <Modal.Body>
            <Container>
              <Swap control={!this.state.newDashboard}>
                <SavedDashboard
                  handleInput={this.handleInput}
                  group={this.props.group}
                  submitLoad={this.state.submitLoad}
                />
                {this.state.images
                  ? <ImportedImage
                      handleInput={this.handleInput}
                      images={this.state.images}
                      value={importedImagesValue}
                      folder={this.state.images.folderName}
                    />
                  : <NewDashboard
                      isValidViewport={this.isValidViewport}
                      handleInput={this.handleInput}
                      validated={this.state.validated}
                      Timeout={this.state.Timeout}
                      Viewport={this.state.Viewport}
                      Delay={this.state.Delay}
                      Url={this.state.Url}
                      Available={this.state.Available}
                      Description={this.state.Description}
                      delayTime={this.state.delayTime}
                      timeoutTime={this.state.timeoutTime}
                      templates={this.state.templates}
                      watermark={this.state.watermark}
                      watermarkPosition={this.state.watermarkPosition}
                      chosedTemplate={template}
                    />}
              </Swap>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            {!this.state.newDashboard
              ? <Button onClick={() => { this.setState({ submitLoad: true }, () => this.closeModal()) }}>
                  Add dashboard
                </Button>
              : this.state.images
                ? 
                  <>
                    <Button 
                      variant='outline-primary'
                      onClick={() => this.setState({ images: false }) }
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => this.validateImage() }>
                      Add image
                    </Button>
                  </>
                : <Row className='w-100'>
                    <Col md={6} className='text-left pl-0'>
                      <Button
                        variant={this.state.save ? 'primary' : 'outline-primary'}
                        onClick={() => this.setState({ save: !this.state.save })}
                      >
                        <IoIosSave />
                      </Button>
                    </Col>
                    <Col md={6} className='text-right'>
                      <Button
                        className='mr-3'
                        variant="outline-primary"
                        onClick={this.unassigned}
                      >
                        Default dashboard
                      </Button>
                      <Button
                        className='mr-3'
                        disabled={this.isValidViewport() ? false : true}
                        type="submit">
                        {this.state.save ? 'Add & Save' : 'Add'}
                      </Button>
                    </Col>
                  </Row>
            }
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

function mapStateWithProps(state) {
  return {
    show: state.modal.show,
    group: state.modal.group,
    rest: state.modal.rest,
  };
}

export default connect(mapStateWithProps)(ModalDashboard);