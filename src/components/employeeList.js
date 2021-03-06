import React, { useState, useEffect } from 'react'
import { tableData } from '../constants/table-constants.js';
import db from '../firebase';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { useStyles } from './employeeList.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { useHistory } from 'react-router-dom';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { IconButton } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import SearchIcon from '@material-ui/icons/Search';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';

function EmployeeList() {

    const classes = useStyles();
    const history = useHistory();

    const [rowData, setRowData] = useState([]);
    const [visibleRows, setVisibleRows] = useState({
        firstVisible: {},
        lastVisible: {},
    })
    const [firstRowId, setFirstRowId] = useState('');
    const [lastRowId, setLastRowId] = useState('');
    const [sortDetails, setSortDetails] = useState({
        sortValue: 'emp_id',
        sortType: 'asc'
    })

    const [searchValue, setSearchValue] = useState({
        emp_id: '',
        emp_name: '',
        emp_designation: '',
        contact: '',
        email: ''
    });

    const [searchField, setSearchField] = useState('');
    const [searchTracker, setSearchTracker] = useState(false);
    const ROW_LIMIT = 5;
    const LIMIT = 'limit';
    const LIMIT_TO_LAST = 'limitToLast';
    const PREVIOUS = 'prev';
    const NEXT = 'next';


    const fetchQuery = (limitLabel, limitValue = 5, from = 'others') => {

        var query = db.collection("employees");
        if (searchField && searchValue[searchField]) {
            query = query.where(searchField, '==', `${searchValue[searchField]}`)
        }
        query = query.orderBy(sortDetails.sortValue, sortDetails.sortType)

        return limitLabel === LIMIT_TO_LAST && from === PREVIOUS ?
            query.endBefore(visibleRows.firstVisible).limitToLast(limitValue) :
            limitLabel === LIMIT_TO_LAST ?
                query.limitToLast(limitValue) :
                limitLabel === LIMIT && from === NEXT ?
                    query.startAfter(visibleRows.lastVisible).limit(limitValue) :
                    query.limit(limitValue)

    }

    const getRowData = () => {
        const rows = [];
        var query = fetchQuery(LIMIT);
        query.get().then(querySnapshot => {
            if (querySnapshot.docs.length > 0) {
                querySnapshot.docs.map((item, index) => {
                    item.data() && rows.push({ ...item.data(), id: item.id, 'sno': index + 1 });
                })
                setRowData(rows);
                setVisibleRows({
                    firstVisible: {},
                    lastVisible: lastRowId !== querySnapshot.docs[querySnapshot.docs.length - 1].id ? querySnapshot.docs[querySnapshot.docs.length - 1] : {},
                })
            }
            else {
                setRowData([])
            }
        })
    }


    useEffect(() => {
        getRowData();
    }, [])


    useEffect(() => {

        setFirstRowId('');
        setLastRowId('');

        var firstQuery = fetchQuery(LIMIT, 1);
        firstQuery.get().then(querySnapshot => {
            querySnapshot.docs[0] && setFirstRowId(querySnapshot.docs[0].id)
        });

        var lastQuery = fetchQuery(LIMIT_TO_LAST, 1);
        lastQuery.get().then(querySnapshot => {
            querySnapshot.docs[0] && setLastRowId(querySnapshot.docs[0].id)
        });


        const rows = [];
        var resultQuery = fetchQuery(LIMIT);
        resultQuery.get().then((querySnapshot) => {
            if (querySnapshot.docs.length > 0) {
                querySnapshot.docs.map((item, index) => {
                    rows.push({ ...item.data(), id: item.id, 'sno': index + 1 });
                })
                setRowData(rows);
            }
            else {
                setRowData([]);
            }

        })


    }, [searchTracker, sortDetails])


    useEffect(() => {
        var query = fetchQuery(LIMIT);
        query.get().then((querySnapshot) => {
            setVisibleRows({
                firstVisible: {},
                lastVisible: querySnapshot.docs.length > 0 && lastRowId !== querySnapshot.docs[querySnapshot.docs.length - 1].id ? querySnapshot.docs[querySnapshot.docs.length - 1] : {}
            })
        })

    }, [lastRowId])


    useEffect(() => {
        if (Object.values(searchValue).includes('')) {
            setSearchTracker(!searchTracker);
        }
    }, [searchValue])


    const previousDocumentsHandler = () => {
        const rows = [];
        var query = fetchQuery(LIMIT_TO_LAST, ROW_LIMIT, PREVIOUS)
        query.get().then((querySnapshot) => {
            querySnapshot.docs.map((item, index) => {
                rows.push({ ...item.data(), id: item.id, 'sno': index + 1 });
            })
            setRowData(rows);
            setVisibleRows({
                firstVisible: firstRowId != querySnapshot.docs[0].id ? querySnapshot.docs[0] : {},
                lastVisible: lastRowId != querySnapshot.docs[querySnapshot.docs.length - 1].id ? querySnapshot.docs[querySnapshot.docs.length - 1] : {}
            })
        })
    }

    const nextDocumentsHandler = () => {
        const rows = [];
        var query = fetchQuery(LIMIT, ROW_LIMIT, NEXT)
        query.get().then((querySnapshot) => {
            if (querySnapshot.docs.length > 0) {
                querySnapshot.docs.map((item, index) => {
                    rows.push({ ...item.data(), id: item.id, 'sno': index + 1 });
                })
                setRowData(rows);
                setVisibleRows({
                    firstVisible: querySnapshot.docs[0],
                    lastVisible: querySnapshot.docs.length > 0 && lastRowId != querySnapshot.docs[querySnapshot.docs.length - 1].id ? querySnapshot.docs[querySnapshot.docs.length - 1] : {}
                })
            }
            else {
                setRowData([]);
            }


        })
    }

    const sortData = (type, field) => {
        setSortDetails({
            sortValue: field,
            sortType: type
        })
    }

    const searchChangeHandler = (event) => {
        setSearchValue({
            [event.target.name]: event.target.value
        });
    }


    const searchHandler = (event, from, field) => {
        if (event.key === "Enter" || from === 'iconClick') {
            if (!Object.values(searchValue).includes('')) {
                setSearchField(field);
                setSearchTracker(!searchTracker);
            }
        }
    }


    const deleteHandler = (row) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            db.collection('employees').doc(`${row.id}`).delete().then((querySnapshot) => {
                getRowData();
            })
        }
    }

    const editHandler = (row) => {
        history.push({ pathname: '/register-employee', state: row });
    }


    return (
        <div style={{ width: '90%', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center' }}> EmployeeList</h2>

            <>
                <TableContainer component={Paper} >
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {
                                    tableData.map((item, index) => (
                                        <TableCell key={index}>
                                            <div>
                                                <strong>{item.headerName}</strong>
                                                {item.headerName !== 'S.No' && item.headerName !== 'Actions' ?
                                                    <div>
                                                        <ArrowUpwardIcon style={{ cursor: 'pointer', fontSize: 20, padding: ' 0px 10px', color: '#22d1dd' }} onClick={() => sortData('asc', item.field)} />
                                                        <ArrowDownwardIcon style={{ cursor: 'pointer', fontSize: 20, color: '#22d1dd' }} onClick={() => sortData('desc', item.field)} />
                                                    </div>
                                                    :
                                                    null
                                                }


                                            </div>

                                        </TableCell>
                                    ))
                                }
                            </TableRow>
                            <TableRow>
                                {
                                    tableData.map((item, index) => (
                                        <TableCell>{
                                            item.headerName !== 'S.No' && item.headerName !== 'Actions' ?
                                                <div>

                                                    <Input name={item.field} value={searchValue[item.field]} onKeyDown={(event) => searchHandler(event, '', item.field)} onChange={searchChangeHandler} className={classes.inputField}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    type='submit' onClick={(event) => searchHandler(event, 'iconClick', item.field)}
                                                                >
                                                                    <SearchIcon style={{ cursor: 'pointer', color: '#22d1dd' }} />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        } />
                                                </div>
                                                :
                                                null
                                        }
                                        </TableCell>
                                    ))
                                }

                            </TableRow>
                        </TableHead>

                        {
                            rowData && rowData.length > 0 ?
                                <TableBody>
                                    {
                                        rowData.map((data, index) => (
                                            <TableRow key={index}>
                                                {
                                                    tableData.map((item, keyIndex) => (
                                                        <TableCell >{item.headerName === 'Actions' ?
                                                            <div className={classes.actionIcons}>
                                                                <EditIcon style={{ cursor: 'pointer', marginRight: '10px', color: '#22d1dd' }} onClick={() => editHandler(data)} />
                                                                <DeleteIcon style={{ cursor: 'pointer', marginLeft: '10px', color: '#22d1dd' }} onClick={() => deleteHandler(data)} />
                                                            </div> :
                                                            data[item.field]}
                                                        </TableCell>
                                                    ))
                                                }

                                            </TableRow>
                                        ))
                                    }

                                </TableBody>
                                :
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <h2 style={{ textAlign: 'center', width: '100%' }}>No rows to show</h2>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                        }
                    </Table>
                    {
                        rowData && rowData.length > 0 ?

                            <div className={classes.paginationArrows}>
                                <IconButton disabled={visibleRows.firstVisible && Object.entries(visibleRows.firstVisible).length <= 0} onClick={previousDocumentsHandler}>
                                    <ChevronLeftIcon />
                                </IconButton>
                                <IconButton disabled={visibleRows.lastVisible && Object.entries(visibleRows.lastVisible).length <= 0} onClick={nextDocumentsHandler}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </div>
                            :
                            null
                    }
                </TableContainer>


            </>

        </div>
    )
}

export default EmployeeList
