import React from "react";
import PropTypes from "prop-types";
import Dropdown from "react-bootstrap/lib/Dropdown";

class CustomToggle extends React.Component {
  render() {
    const { onKeywordChange, placeholder, ...otherProps } = this.props;

    return (
      <div className="input-group">
        <input
          {...otherProps}
          onKeyUp={onKeywordChange}
          type="text"
          className="form-control input-field"
          placeholder={placeholder}
          defaultValue=""
        />
        <div className="input-group-btn">
          {/* TODO: old, migrated code */}
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <button type="button" className="input-addon-btn">
            <span className="icon-search" />
          </button>
        </div>
      </div>
    );
  }
}

CustomToggle.propTypes = {
  placeholder: PropTypes.string.isRequired,
  onKeywordChange: PropTypes.func.isRequired,
};

function FilterSelect({ id, placeholder, children, onKeywordChange }) {
  return (
    <Dropdown id={id} className="input-group-btn">
      <CustomToggle placeholder={placeholder} onKeywordChange={onKeywordChange} />
      <Dropdown.Menu bsRole="menu">{children}</Dropdown.Menu>
    </Dropdown>
  );
}

FilterSelect.defaultProps = {
  children: null,
};

FilterSelect.propTypes = {
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onKeywordChange: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default FilterSelect;
