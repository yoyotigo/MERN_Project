import React from "react";
import axios from "axios";
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import { lighten } from '@material-ui/core/styles/colorManipulator';

 const desc=(a, b, orderBy)=>{
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

const stableSort=(array, cmp)=> {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

const getSorting=(order, orderBy)=>{
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const rows = [
  { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
  { id: 'name', numeric: true, disablePadding: false, label: 'User' },
  { id: 'message', numeric: true, disablePadding: false, label: 'Message' },
  { id: 'room', numeric: true, disablePadding: false, label: 'Room' },
  { id: 'date', numeric: true, disablePadding: false, label: 'Date' },
  { id: 'time', numeric: true, disablePadding: false, label: 'Time' },
];

class HistoryHeader extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {rows.map(
            row => (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this,
          )}
        </TableRow>
      </TableHead>
    );
  }
}
HistoryHeader.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let EnhancedTableToolbar = props => {
  const { numSelected, classes } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="h6" id="tableTitle">
            History Table
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton aria-label="Filter list">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};
EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);
////////////////////////////////////////////////////////////////////////////////////////////////////////////
class History extends React.Component{
  constructor(props) {
    super(props);
    this.load=this.load.bind(this)
    
}    
  state = {
    order: 'asc',
    orderBy: 'id',
    selected: [],
    data: [],
    page: 0,
    rowsPerPage: 5,
  };
  createData(uuid,index, name, message, room, date, time) {
    return {uuid, index, name, message, room, date, time};
  }
  id=0
  rows= []
  date=''
  time=''
  load(){
    axios.get("http://localhost:5000/api/history")
    .then(hist => {
      this.setState({data: hist.data})
    })
    this.state.data.map(item=>{
      this.id+=1
      this.date=item['created'].substring(0,10)
      this.time=item['created'].substring(11,16)
      return this.rows.push(this.createData(item['_id'],this.id, item['nick'], item['msg'], item['room'], this.date, this.time))
    })
    console.log(this.rows)
  }
  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState(state => ({ selected: state.data.map(n => n.index) }));
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render(){
    const {order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.rows.length - page * rowsPerPage);

    return(
      <Paper>
        <button onClick={this.load}>Load Data</button>
        <EnhancedTableToolbar numSelected={selected.length} />
        <div >
          <Table aria-labelledby="tableTitle">
            <HistoryHeader
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={this.rows.length}
            />
            <TableBody>
              {stableSort(this.rows, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const isSelected = this.isSelected(n.index);
                  return (
                    <TableRow
                      hover
                      onClick={event => this.handleClick(event, n.index)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={n.index}
                      selected={isSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} />
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        {n.index}
                      </TableCell>
                      <TableCell align="right">{n.name}</TableCell>
                      <TableCell align="right">{n.message}</TableCell>
                      <TableCell align="right">{n.room}</TableCell>
                      <TableCell align="right">{n.date}</TableCell>
                      <TableCell align="right">{n.time}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={this.rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    )
  } 
}

export default History;

 /*<table><button onClick={this.add}>Add</button>
                      <tbody>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Message</th>
                        <th>Room</th>
                        <th>Created</th>
                      </tr>
                      <tr>
                        <td></td>
                      </tr>
                      </tbody>
                  </table>/
      /*constructor(props) {
        super(props);
    
        this.state={
            history:[],
            name:'',
            message:'',
            id:'',
            room:''
        }
        this.load=this.load.bind(this)
        
    }    
      
    createData(id, name, message, room, date) {
      return { id, name, message, room, date};
    }
      id=0
      rows= []   
    load(){
      axios.get("http://localhost:5000/api/history")
      .then(hist => {
        this.setState({history: hist.data})
      })
      this.state.history.map(item=>{
        this.id+=1
        this.rows.push(this.createData(this.id, item['nick'], item['msg'], item['room'], item['created']))
      })
    }
    render() { 
        return (
          
          <Paper >
             <button onClick={this.load}>Load Table</button>
          <Table >
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell align="right">Name</TableCell>
                <TableCell align="right">Message</TableCell>
                <TableCell align="right">Room</TableCell>
                <TableCell align="right">Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.rows.map(row => (
                <TableRow >
                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell align="right">{row.name}</TableCell>
                  <TableCell align="right">{row.message}</TableCell>
                  <TableCell align="right">{row.room}</TableCell>
                  <TableCell align="right">{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
          );
    }
}*/





/////////////////////////////////
/* counter = 0;
  desc=(a, b, orderBy)=> {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  stableSort=(array, cmp)=>{
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = cmp(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  }
  getSorting=(order, orderBy)=>{
    return order === 'desc' ? (a, b) => this.desc(a, b, orderBy) : (a, b) => -this.desc(a, b, orderBy);
  }
  constructor(props){
    super(props);

    this.state={
        history:[],
    }
    this.load=this.load.bind(this)
  }
  rows= []   
  createData(name, message, room, date){
    this.counter += 1;
    return { id: this.counter,  name, message, room, date};
  }
  load(){
    axios.get("http://localhost:5000/api/history")
    .then(hist => {
      this.setState({history: hist.data})
    })
    this.state.history.map(item=>{
      this.id+=1
      this.rows.push(this.createData(this.id, item['nick'], item['msg'], item['room'], item['created']))
    })
  }
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

render(){
  const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;
  return(
    <div>
    <button onClick={this.load}>Load Data</button>
<TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {this.rows.map(
            row => (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this,
          )}
        </TableRow>
      </TableHead></div>
    );
  }
}
*/