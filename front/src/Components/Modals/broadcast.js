import React, { Component } from 'react';
import { Modal, Row, Col, Button, Container, InputGroup, Form, Collapse, Card } from 'react-bootstrap';
import { IoMdAddCircle, IoMdCloseCircle } from 'react-icons/io'
import FormInput from './formInput';
import Axios from 'axios';
import { toast } from 'react-toastify';

class ModalBroadcast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Groups: [{}],
      Timeout: '0',
      Delay: 0,
      Url: '',
      Viewport:'',
      validated: false,
      opened: false,
      enableAllGroup: true,
    }
  }

  componentDidMount () {
    var newGroups = [];

    Axios.get('/api/group').then((res) => {
      Object.keys(res.data).forEach(item => {
        console.log(item);
        newGroups.push({
          title: res.data[item].name,
          id: res.data[item].id,
          enabled: true
        })
      });
      this.setState({ Groups: newGroups });
    });
  }

  reinitialise = () => {
    this.setState({
      Timeout: '0',
      Viewport:'',
      Delay: 0,
      Url: '',
      Description: '',
    });
  }

  handleInput = (inputName, inputValue) => {
    var value = inputValue;
    this.setState({ [inputName]: value });
  }

  isValidUrl = () => {
    let url = this.state.Url;

    if (url.length < 7)
      return false;
    if (url.length > 0) {
      if (url.substring(0, 7) === "http://" || url.substring(0, 8) === "https://")
        return true;
    }
    return false;
  }

  isValidViewport = () => {
    let reg = new RegExp("^[1-9]\\d*[x][1-9]\\d*$");

    if (this.state.Viewport.length > 0)
      return reg.test(this.state.Viewport);
    return true;
  }

  isValidGroups = () => {
    for (var i = 0; i < this.state.Groups.length; i++) {
      if (this.state.Groups[i].enabled)
        return true;
    }
    return false;
  }

  handleError = () => {
    let url = this.state.Url;
    var ret = this.state.Delay < 0 || this.state.Timeout <= 0 || !this.isValidViewport() || !this.isValidGroups();

    if (url.length < 7)
      return true;
    if (ret === false) {
      if (url.substring(0, 7) === "http://" || url.substring(0, 8) === "https://")
        return false;
      else
        return true;
    }
    return ret;
  }

  restSendBroadcast = (inputs) => {
    Axios.post('/api/broadcast', inputs)
      .then(() => toast.success('Successfully broadcasted.'))
      .catch(() => toast.error('Failed to broadcast.'));
  }

  handleSubmit = () => {
    const dashboard = {
      timeout: this.state.Timeout,
      url: this.state.Url,
      description: this.state.Description,
      viewport: this.state.Viewport,
      delay: this.state.Delay
    }
    let groups = [];
    let body;

    this.state.Groups.forEach(item => {
      if (item.enabled)
        groups.push(item.id);
    });
    body = {
      groups: groups,
      dashboard: dashboard
    };
    this.restSendBroadcast(body);
    this.reinitialise();
    this.props.onHide();
  }

  toggleGroup = (i) => {
    let tmp = this.state.Groups;

    tmp[i].enabled = !tmp[i].enabled;
    this.setState({ Groups: tmp });
  }

  toggleAll= () => {
    let tmp = this.state.Groups;

    tmp.forEach((item, i) => {
      item.enabled = !this.state.enableAllGroup;
    });
    this.setState({ Group: tmp, enableAllGroup: !this.state.enableAllGroup });
  }

  toggleIcon = (isEnable) => {
    return (isEnable ? <IoMdAddCircle size="1.5em" /> : <IoMdCloseCircle size="1.5em" />) 
  }

  allGroups() {
    return <Card className="mb-3">
      <Card.Header onClick={() => this.setState({ opened: !this.state.opened })} style={{ cursor: 'pointer' }}>
        Display groups
      </Card.Header>
      <Collapse in={this.state.opened}>
        <Card.Body className="text-center">
          <Row className="mb-3">
            <Col>
              <Button className="text-left col-md-6 col-sm-6" style={{}} variant= {this.state.enableAllGroup ? "info" : "light"}
                onClick={() => {this.toggleAll()}}>
                {this.toggleIcon(this.state.enableAllGroup)}
                <span className="ml-3">
                {this.state.enableAllGroup ? 'Disable all' : 'Enable all'}
                </span>
              </Button>
            </Col>
          </Row>
          <Row>
            {this.state.Groups.map((item, i) =>
              <Col className="d-flex justify-content-around mb-3" md="3" sm="12">
                <Button className=" col-md-12 col-sm-12"  variant={item.enabled ? "info" : "light"}
                  onClick={() => this.toggleGroup(i)} >
                  {item.title}
                </Button>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Collapse>
    </Card>
  }

  render() {
    return (
      <Modal {...this.props} size='lg' aria-labelledby="contained-modal-title-vcenter">
        <Form
          noValidate
        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">
              Send a broadcast
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              {this.allGroups()}
              <Form.Row>
                <FormInput md={12} sm={12} required={true} isInvalid={!this.isValidUrl()}
                placeholder="Url" name='Url' updateValue={this.handleInput} onError='insert an URL' type="text" />
                <FormInput md={12} sm={12} required={false} value={this.state.Description}
                placeholder="Description" name='Description' updateValue={this.handleInput} type="text" />
                <FormInput md={12} sm={12} required={false} isInvalid={!this.isValidViewport()} value={this.state.Viewport} 
                placeholder="Viewport size (height x width)" name='Viewport' updateValue={this.handleInput} type="text" />
                <FormInput md={6} sm={12} required={false} isInvalid={this.state.Timeout <= 0}
                placeholder="Timeout (in second)" name='Timeout' updateValue={this.handleInput} type="number" />
                <FormInput md={6} sm={12} required={false} isInvalid={this.state.Delay < 0}
                placeholder="Delay (in second)" name='Delay' updateValue={this.handleInput} type="number" />
              </Form.Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={this.props.onHide}>Close</Button>
            <Button disabled={this.handleError()} type="submit" onClick={this.handleSubmit}>Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

export default ModalBroadcast;