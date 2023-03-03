import React from 'react'
import { useState, useEffect } from 'react'
import SelectSearch from 'react-select-search';
import { Col, Row } from 'antd';

function Pager({childRef, loadPage, changePageSize, totalCount, vissiblePageNumber,disabled }) {

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    // const [totalPages, setTotalPage] = useState(Math.ceil(totalCount/pageSize))
    
    const [pagesArray, setPageArray] = useState([])
    const [startDots, setStartDots] = useState(false)
    const [endDots, setEndDots] = useState(false)

    const pageSizeOptions = [
        { name: "1/page", value: "1" },
        { name: "5/page", value: "5" },
        { name: "10/page", value: "10" },
        { name: "20/page", value: "20" },
        { name: "50/page", value: "50" },
        { name: "100/page", value: "100" }
  ];

  const handleChangePageSize =  async (...args) => {
    setPageSize(args[0])
    loadPageArray(1);
    setPage(1);
    changePageSize(args[0])
    //var companies = await getCompanies({ name: searchName, page:pageNumber, pageSize:args[0],ownerId:searchOwnerId}).unwrap();
   // setCompanies(companies)
  }
  
   

    useEffect(() => {
        if(totalCount<=pageSize)
        {
            setPageArray([1]);   
        }else{
            var totalPages = Math.ceil(totalCount/pageSize)
            setPageArray(Array(totalPages > vissiblePageNumber? vissiblePageNumber : totalPages).fill().map((_, index) => index + 1));
            setEndDots(totalPages>vissiblePageNumber)
        }
      }, [vissiblePageNumber, pageSize,totalCount])
  

   


    const loadPageArray = (pageNumber) => {
        setStartDots(false)
        setEndDots(false)
        if(totalCount>pageSize)
        {
            var totalPages = Math.ceil(totalCount/pageSize)
       if (totalPages> vissiblePageNumber)
       {
        if(pageNumber<Math.ceil(vissiblePageNumber/2)+1){
            setPageArray(Array(vissiblePageNumber).fill().map((_, index) => index + 1))
            setEndDots(true)
            console.log("1")
            console.log(startDots)
            console.log(endDots)
        }else if(pageNumber>=Math.floor(vissiblePageNumber/2)+1 && pageNumber <totalPages-Math.floor(vissiblePageNumber/2))
        {
            loadVisiblePages(pageNumber-Math.floor(vissiblePageNumber/2));
            setStartDots(true)
            setEndDots(true)
            console.log("2")
            console.log(startDots)
            console.log(endDots)
            //p3agesArray= [pageNumber-2, pageNumber-1, pageNumber, pageNumber+1, pageNumber+2];
        }else {//if (pageNumber >= totalPages-vissiblePageNumber){
            loadVisiblePages(totalPages-vissiblePageNumber+1);
            setStartDots(true)
            console.log("3")
            console.log(startDots)
            console.log(endDots)
            //pagesArray= [pageNumber-3, pageNumber-2, pageNumber-1, pageNumber, pageNumber+1];
        }
        //else{
          //  loadVisiblePages(vissiblePageNumber+1)
           // pagesArray= [pageNumber-4, pageNumber-3, pageNumber-2, pageNumber-1, pageNumber];
       // }
       }
    }
    }

    const loadVisiblePages = (startNumber) => {
        let array =[];
        for (let i = startNumber; i < vissiblePageNumber+startNumber; i++) {
            array.push(i)
          }
          setPageArray(array)
    }

    const lastPage = () => {
        var totalPages = Math.ceil(totalCount/pageSize)
        loadPage(totalPages);
        setPage(totalPages);
        loadPageArray(totalPages);
    }

    const firstPage = () => {
        loadPage(1);
        setPage(1);
        loadPageArray(1);
    }

    const nPage = (pageNumber) => {
        loadPage(pageNumber);
        setPage(pageNumber);
        loadPageArray(pageNumber);
    }

    const renderPage = (pageNumber) => {
        setPage(pageNumber);
        loadPageArray(pageNumber);
    }

    childRef.renderPage = renderPage
    
    
   

    const nav = (
        <nav className="nav-ex2">
            <button   onClick={firstPage} disabled={page === 1 || disabled}>&lt;&lt;</button>

           { startDots? <button  disabled={true}>. . .</button> : ""}
     
            {/* Removed isPreviousData from PageButton to keep button focus color instead */}
            {pagesArray.map(pg => <button  disabled={page === pg || disabled} key={pg} onClick={() => nPage(pg)}>{pg}</button> )}

            { endDots? <button  disabled={true}>. . .</button> : ""}
         
            <button onClick={lastPage} disabled={page === Math.ceil(totalCount/pageSize) || disabled}>&gt;&gt;</button>
        </nav>
    )

  return (
    <>  <div style={{paddingLeft:15}}>
    <Row gutter={{
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
    }}>
      <Col className="gutter-row">{nav}</Col> 
      
      <Col className="gutter-row" style={{paddingTop:12}}><SelectSearch
    options={pageSizeOptions}
    value={pageSize}
    name="pageSizesSelect"
    onChange={handleChangePageSize}
  /></Col>
  
  </Row>
  </div>
  </>
   
  )
}

export default Pager