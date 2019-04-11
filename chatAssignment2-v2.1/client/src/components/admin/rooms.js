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

import Tooltip from '@material-ui/core/Tooltip';
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
  { id: 'room', numeric: true, disablePadding: false, label: 'Room' },
  { id: 'created', numeric: true, disablePadding: false, label: 'created' },
  { id: 'edited', numeric: true, disablePadding: false, label: 'edited' },
  { id: 'status', numeric: true, disablePadding: false, label: 'status' },
  { id: 'Edit', numeric: true, disablePadding: false, button: 'Edit' },
];

class RoomHeader extends React.Component {
  createSortHandler = property => room => {
    this.props.onRequestSort(room, property);
  };

  render() {
    const {order, orderBy} = this.props;

    return (
      <TableHead>
        <TableRow>
          {rows.map(
            row => (
              <TableCell
                key={row.id}
                align='right'
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
RoomHeader.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
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
      <Typography variant="h6" id="tableTitle">
            Rooms Table
      </Typography>
      <div className={classes.spacer} />
      
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};
EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);
////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Room extends React.Component{
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
  createData(id,room, created, edited, status) {
    return {id,room, created, edited, status};
  }
  id=0
  rows= []
  date=''
  time=''
  load(){
    axios.get("http://localhost:5000/api/rooms")
    .then(hist => {
      this.setState({data: hist.data})
    })
    this.state.data.map(item=>{
      this.id+=1
      this.date=item['created'].substring(0,10)
      this.time=item['created'].substring(11,16)
      return this.rows.push(this.createData(this.id, item['room'],this.date, this.time, item['status']))
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


  

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render(){
    const {order, orderBy, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.rows.length - page * rowsPerPage);

    return(
      <Paper>
        <button onClick={this.load}>Load Data</button>
        <EnhancedTableToolbar  />
        <div >
          <Table aria-labelledby="tableTitle">
            <RoomHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={this.rows.length}
            />
            <TableBody>
              {stableSort(this.rows, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={n.id}
                    >
                      <TableCell align="right" component="th" scope="row" padding="none">
                        {n.id}
                      </TableCell>
                      <TableCell align="right">{n.room}</TableCell>
                      <TableCell align="right">{n.date}</TableCell>
                      <TableCell align="right">{n.time}</TableCell>
                      <TableCell align="right">{n.status}</TableCell>
                      <TableCell align="right"><button >Edit</button></TableCell>
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

export default Room;

 