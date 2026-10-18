
import React from 'react'

const FormGroup = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text"
}) => {
  return (
    <div className="form-group">
      <label htmlFor={label}>{label}</label>

      <input
        type={type}
        id={label}
        name={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  )
}

export default FormGroup
