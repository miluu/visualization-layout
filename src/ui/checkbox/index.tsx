import * as React from 'react';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface IUiCheckboxState {
  checked: boolean;
}

interface IUiCheckboxProps {
  trueValue: any;
  falseValue: any;
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
}

export class UiCheckbox extends React.PureComponent<IUiCheckboxProps, IUiCheckboxState> {
  static getDerivedStateFromProps(nextProps: IUiCheckboxProps, prevState: IUiCheckboxState) {
    return {
      checked: nextProps.value === nextProps.trueValue,
    };
  }
  state: IUiCheckboxState = {
    checked: false,
  };
  render() {
    return (
      <Checkbox
        checked={this.state.checked}
        disabled={this.props.disabled}
        onChange={this.onChange}
      />
    );
  }
  private onChange = (e: CheckboxChangeEvent) => {
    const value = e.target.checked
      ? this.props.trueValue
      : this.props.falseValue;
    this.props.onChange(value);
  }
}
