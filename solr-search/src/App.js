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
import Checkbox from '@mui/material/Checkbox';



function App() {
  const [results, setResults] = useState([]);
  const [numTotal, setNumTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [jobType, setJobType] = useState('All');
  const [maxSalary, setMaxSalary] = useState(999999999);
  const [minSalary, setMinSalary] = useState(0);
  const [allowNegotiable, setAllowNegotiable] = useState(false);
  const resultsPerPage = 10;

  const resetFilters = () => {
    setPage(1);
    setJobType('All');
    setMinSalary(0);
  }

  const getSnippet = (description) => {
    const termIndex = description.toLowerCase().indexOf(query.toLowerCase());
    if (termIndex === -1) return description.substring(0, 300) + '...';
    let snippet = '';
    const start = Math.max(0, termIndex - 50);
    if (start > 0) snippet += '...';
    const end = Math.min(description.length, termIndex + 250);
    snippet += description.substring(start, end);
    if (end < description.length) snippet += '...';
    return snippet;
  }

  const BoldedTypography = ({text}) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
    return (
      <Typography>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? <strong key={i}>{part}</strong> : part
        )}
      </Typography>
    );
  };
  
  const keywordSearch = (searchTerm) => {
    if(searchTerm !== query) resetFilters();
    setQuery(searchTerm);
    
    const start = (page - 1) * resultsPerPage;
    axios.get(`http://localhost:8983/solr/jobs/select`, {
      params: {
        q: searchTerm,
        start: start,
        rows: resultsPerPage,
        defType: 'edismax',
        qf: 'title^5 description^3',
        pf: 'title^5 description^3',
        fq: (jobType === 'All' ? '' : ('work-type:' + jobType + ' AND '))  + '(yearly_salary:['+ minSalary + ' TO ' + maxSalary + ']' + (allowNegotiable ?  'OR yearly_salary:NaN)' : ')'),
        stats: true,
        'stats.field': 'yearly_salary', 
      }
    })
      .then(response => {
        if (response.data.response.numFound === 0) {
          setResults([]);
          setNumTotal(0);
        } else {
          setNumTotal(response.data.response.numFound);
          setMaxSalary(response.data.stats.stats_fields.yearly_salary.max);
          response.data.response.docs.forEach(doc => {
            doc.snippet = getSnippet(doc.description);
          });
          setResults(response.data.response.docs);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
  
  useEffect(() => {
    keywordSearch(query);
  }, [page,query,jobType,minSalary,allowNegotiable]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    
    <Container sx={{padding: 10}}>
      <Stack justifyContent="center" alignItems="center" spacing={2}>
        <Typography variant="h2">Job Offers</Typography>
        <SearchBar onSearch={keywordSearch} />
          <Grid container spacing={2}>
            <Grid item xs={1.5}>
              <Select
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
                fullWidth
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Full-time">Full Time</MenuItem>
                <MenuItem value="Part-time">Part Time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
                <MenuItem value="Temporary">Temporary</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </Grid>  
            <Grid item xs={5}>
              <Typography variant="body3">Min Salary</Typography>
              <Slider
                defaultValue={minSalary}
                min={0}
                max={maxSalary}
                step={5000}
                valueLabelDisplay="auto"
                onChange={(event) => setMinSalary(event.target.value)}
              />
              <Checkbox
                checked={allowNegotiable}
                onChange={(event) => setAllowNegotiable(event.target.checked)}
                inputProps={{ 'aria-label': 'controlled' }} 
              />
            </Grid> 
          </Grid>  

            
        <List>
          {results.map((result, index) => (
            <ListItem key={index} sx={{px: 0, mx: 0}}>
              <Card sx={{ width: '100%', padding: 2 }}>
                <Typography variant="h6">{result.title}</Typography>
                <BoldedTypography text={result.snippet} />
                <Typography variant="body3">Type: {result['work-type']}   </Typography> 
                <Typography variant="body3">Salary: {result.salary!=="NaN" ? result.salary+"/"+result.pay_period : "Negotiable"}</Typography>
              </Card>  
            </ListItem>
          ))}
        </List>
        {
        /*numTotal > 0 && (*/
          <Pagination count={Math.ceil(numTotal / resultsPerPage)} page={page} onChange={handlePageChange} />
        //)
        }
      </Stack>
    </Container>
  );
}

export default App;