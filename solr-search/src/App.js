import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import SearchBar from './searchbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';

function App() {
  const [results, setResults] = useState([]);
  const [numTotal, setNumTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [jobType, setJobType] = useState('All');
  const [maxSalary, setMaxSalary] = useState(null);
  const [minSalary, setMinSalary] = useState(0);
  const resultsPerPage = 10;

  const resetFilters = () => {
    setJobType('All');
    setMaxSalary(null);
    setMinSalary(0);
    setPage(1);
  }
  
  const handleSearch = (searchTerm) => {
    if(searchTerm !== query) resetFilters();
    setQuery(searchTerm);
    let start = (page - 1) * resultsPerPage;
    axios.get(`http://localhost:8983/solr/jobs/select`, {
      params: {
        q: 'title:' + searchTerm+ ' OR '  + 'description:'+searchTerm,
        fq: jobType === 'All' ? '' : 'job_type:' + jobType + ' AND '  + 'salary:[0' + ' TO ' + (maxSalary ? maxSalary : 999999999999999999) + ']'  ,
        start: start,
        rows: resultsPerPage,
        stats: true,
        'stats.field': 'yearly_salary', 
      }
    })
      .then(response => {
        setNumTotal(response.data.response.numFound);
        setResults(response.data.response.docs);
        setMaxSalary(response.data.stats.stats_fields.yearly_salary.max);
        setMinSalary(response.data.stats.stats_fields.yearly_salary.min);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    handleSearch(query);
  };

  return (
    
    <Container sx={{padding: 10}}>
      <Stack justifyContent="center" alignItems="center" spacing={2}>
        <Typography variant="h2">Job Offers</Typography>
        <SearchBar onSearch={handleSearch} />
          <Grid container spacing={2}>
            <Grid item xs={1.5}>
              <Select
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
                fullWidth
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="full-time">Full Time</MenuItem>
                <MenuItem value="part-time">Part Time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
              </Select>
            </Grid>  
            <Grid item xs={1.5}>
              <Slider defaultValue={minSalary} max={maxSalary} valueLabelDisplay="auto" onChange={(event) => setMinSalary(event.target.value)}/>
            </Grid> 
          </Grid>  

            
        <List>
          {results.map((result, index) => (
            <ListItem key={index} sx={{px: 0, mx: 0}}>
              <Card sx={{ width: '100%', padding: 2 }}>
                <Typography variant="h6">{result.title}</Typography>
                <Typography variant="body2">{result.description.length < 300 ? result.description : result.description.substring(0, 300) + '...'}</Typography>           
              </Card>  
            </ListItem>
          ))}
        </List>
        {numTotal > 0 && (
          <Pagination count={Math.ceil(numTotal / resultsPerPage)} page={page} onChange={handlePageChange} />
        )}
      </Stack>
    </Container>
  );
}

export default App;