import React, { Component } from "react";
import Popover from "./Popover";

class Editable extends Component {
  state = {
    popoverOpen: false,
    value: "",
    editingValue: "",
    spinnerVisible: false
  };

  constructor(props) {
    super(props);
    this.state.value = props.initialValue;
  }

  // initialValue can change even after construction..
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.initialValue });
  }

  toggle = () => {
    const { popoverOpen, editingValue, value } = this.state;
    // reset editing value to value
    this.setState({
      editingValue: value,
      popoverOpen: !this.state.popoverOpen
    });
  };

  handleChange = event => {
    this.setState({ editingValue: event.target.value });
  };

  onAccept = () => {
    const { endpoint, fieldName } = this.props;
    const { value, editingValue } = this.state;
    if (value == editingValue) {
      this.toggle();
      return;
    }
    this.setState({ spinnerVisible: true });
    fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        [fieldName]: editingValue
      }),
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => res[fieldName])
      .then(value => {
        this.setState({ value, spinnerVisible: false });
        this.toggle();
      })
      .catch(err => {
        this.setState({ spinnerVisible: false });
        console.log(err);
        this.toggle();
      });
  };

  render() {
    const { popoverOpen, value, editingValue, spinnerVisible } = this.state;
    const {
      fieldName,
      title = `Edit ${fieldName}`,
      display,
      selectValues,
      inputType = "text"
    } = this.props;
    return (
      <span id={fieldName} className="editable-container">
        <a href="#" onClick={this.toggle}>
          {display(value)}
        </a>
        <Popover
          isOpen={popoverOpen}
          title={title}
          onAccept={this.onAccept}
          target={fieldName}
          toggle={this.toggle}
          spinnerVisible={spinnerVisible}
        >
          {" "}
          {inputType == "text" ? (
            <input
              type="text"
              value={editingValue}
              onChange={this.handleChange}
              className="form-control"
            />
          ) : (
            // default to select
            <select
              value={editingValue}
              onChange={this.handleChange}
              className="form-control"
            >
              {selectValues.map(val => (
                <option value={val} key={val}>
                  {val}
                </option>
              ))}
            </select>
          )}
        </Popover>
      </span>
    );
  }
}

export default Editable;
