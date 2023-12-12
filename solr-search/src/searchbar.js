import PropTypes from 'prop-types';
import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";

import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = forwardRef(({ onSearch }, ref) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef();

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current.focus();
    },
  }));

  return (
    <TextField
      label="Search"
      variant="outlined"
      fullWidth
      value={searchTerm}
      onChange={handleInputChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      onKeyDown={handleKeyPress}
      inputRef={inputRef}
    />
  );
});

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;