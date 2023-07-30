import { useState, useEffect, React} from 'react'
import { Table, Button, Popconfirm, Row, Col, Upload, Cascader, Input, InputNumber,message,Checkbox } from "antd";
import { ExcelRenderer } from "react-excel-renderer";
import { EditableCell } from "../../Common/Components/Excel/EditableCell";
import { EditableFormRow} from "../../Common/Components/Excel/EditableFormRow";
import moment from 'moment';
import { useImportProjectsMutation,useGetCompaniesMutation,useImportCompaniesMutation } from "../slices/userApiSlice"
import { downloadExcel } from "react-export-table-to-excel"

import {
    DeleteOutlined,
    PlusOutlined,
    UploadOutlined
  } from '@ant-design/icons'
import { ProjectStatuses, ProjectScopes,Currencies } from '../../Common/lookups';

 



function ImportProjectsData() {

    // const [columnsWithoutMilestones, setColumnsWithoutMilestones] = useState([
    //   // {
    //   //   title: 'State',
    //   //   dataIndex: 'state',
    //   // },
    //     {
    //       title: 'Client',
    //       dataIndex: 'client',
    //       //render: (_, record) => (record.client.name),
    //     },
    //     {
    //       title: 'Project',
    //       dataIndex: 'projectName'
    //     },
    //     {
    //       title: 'Scope',
    //       dataIndex: 'scope',
    //      // render: (_, record) => (ProjectScopes.find(x=>x.value==record.scope).label),
    //     },
    //     {
    //       title: 'Status',
    //       dataIndex: 'status',
    //      // render: (_, record) => (ProjectStatuses.find(x=>x.value==record.status).label),
    //     },
    //     {
    //       title: 'Contract Signature Date',
    //       dataIndex: 'contractSignatureDate',
    //       render: (_, record) => (record.contractSignatureDate!=null?moment(record.contractSignatureDate).format('DD-MM-YYYY'):null),
    //     },
    //     {
    //       title: 'Contract Value',
    //       dataIndex: 'contractValue'
    //     },
    //     {
    //       title: 'Currency',
    //       dataIndex: 'contractValuecurrency',
    //     //  render: (_, record) => (Currencies.find(x=>x.value==record.finalContractValueCurrency) ? Currencies.find(x=>x.value==record.finalContractValueCurrency).label:null),
    //     },
    //     {
    //       title: 'Retainer Vaidity (# of months)',
    //       dataIndex: 'retainerValidatity',
    //     },
    //   // {
    //   //   title: "Action",
    //   //   dataIndex: "action",
    //   //   render: (text, record) =>
    //   //     rows.length >= 1 ? (
    //   //       <Popconfirm
    //   //         title="Sure to delete?"
    //   //         onConfirm={() =>handleDelete(record.key)}
    //   //       >
    //   //         <DeleteOutlined  style={{ color: "red", fontSize: "20px" }} />
             
    //   //       </Popconfirm>
    //   //     ) : null
    //   // }
    // ])

    const [columns, setColumns] = useState([])
    // const [columns, setColumns] = useState([
    //   // {
    //   //   title: 'State',
    //   //   dataIndex: 'state',
    //   // },
    //     {
    //       title: 'Client',
    //       dataIndex: 'client',
    //       //render: (_, record) => (record.client.name),
    //     },
    //     {
    //       title: 'Project',
    //       dataIndex: 'projectName'
    //     },
    //     {
    //       title: 'Scope',
    //       dataIndex: 'scope',
    //      // render: (_, record) => (ProjectScopes.find(x=>x.value==record.scope).label),
    //     },
    //     {
    //       title: 'Status',
    //       dataIndex: 'status',
    //      // render: (_, record) => (ProjectStatuses.find(x=>x.value==record.status).label),
    //     },
    //     {
    //       title: 'Contract Signature Date',
    //       dataIndex: 'contractSignatureDate',
    //       render: (_, record) => (record.contractSignatureDate!=null?moment(record.contractSignatureDate).format('DD-MM-YYYY'):null),
    //     },
    //     {
    //       title: 'Contract Value',
    //       dataIndex: 'contractValue'
    //     },
    //     {
    //       title: 'Currency',
    //       dataIndex: 'contractValuecurrency',
    //     //  render: (_, record) => (Currencies.find(x=>x.value==record.finalContractValueCurrency) ? Currencies.find(x=>x.value==record.finalContractValueCurrency).label:null),
    //     },
    //     {
    //       title: 'Retainer Vaidity (# of months)',
    //       dataIndex: 'retainerValidatity',
    //     },
    //   // {
    //   //   title: "Action",
    //   //   dataIndex: "action",
    //   //   render: (text, record) =>
    //   //     rows.length >= 1 ? (
    //   //       <Popconfirm
    //   //         title="Sure to delete?"
    //   //         onConfirm={() =>handleDelete(record.key)}
    //   //       >
    //   //         <DeleteOutlined  style={{ color: "red", fontSize: "20px" }} />
             
    //   //       </Popconfirm>
    //   //     ) : null
    //   // }
    // ])

    

    const [cols, setCols] = useState([])
    const [rows, setRows] = useState([])
    const [errorMessage, setErrorMessage] = useState(null)
    const [components, setComponents] = useState(null)
    const [cells, setCells] = useState([])

    const [getCompanies] = useGetCompaniesMutation();
const [companiesOptions, setCompaniesOptions] = useState([])
const [companies, setCompanies] = useState([])

const [lineOfBusinessId, setLineOfBusinessId] = useState(null)


const [companyName, setCompanyName] = useState('')
const [lobName, setLobName] = useState('')
const [numberOfMilestones, setNumberOfMilestones] = useState(-1)


    
const [actionLoading, setActionLoading] = useState(false)
const [basicDataSubmitted, setBasicDataSubmitted] = useState(false)
const [freeTextCompany, setFreeTextCompany] = useState(false)
//const [showMilestones, setShowMilestones] = useState(false)
const key = 'updatable';
    

const handleChangeFreeTextCompany =   (e) => { 
  setFreeTextCompany(!freeTextCompany)
  setLineOfBusinessId(null)
  setCompanyName("")
  setLobName("")
}

  const [importProjects] = useImportProjectsMutation()
  const [importCompanies] = useImportCompaniesMutation()


  const showLoadingMessage  = (msg)=>{
    message.loading({
      content: msg,
      key,
      className: 'custom-class',
      style: {
        marginTop: '8vh',
      },
    });
  }

  const showMessage = (msg)=>{
    setTimeout(() => {
    message.success({
      content: msg,
      key,
      className: 'custom-class',
      style: {
        marginTop: '8vh',
      },
    });
  }, 500);
  }

  const  ExcelDateToJSDate= (serial) => {
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;                                        
    var date_info = new Date(utc_value * 1000);
 
    var fractional_day = serial - Math.floor(serial) + 0.0000001;
 
    var total_seconds = Math.floor(86400 * fractional_day);
 
    var seconds = total_seconds % 60;
 
    total_seconds -= seconds;
 
    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;
 
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
 }

  const handleChangeCompany = (e)=>{
    setCompanyName(e.target.value)
  }

  const handleChangeLOB = (e)=>{
    setLobName(e.target.value)
  }

  const handleChangeNumberOfMilestones = (value)=>{
    setNumberOfMilestones(value)
    console.log(value)
  }


  const handleSave = row => {
    const newData = [...rows];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row
    });
    setRows(newData);
  };

  const checkFile = (file) => {
    let errorMessage = "";
    if (!file || !file[0]) {
      return;
    }
    const isExcel =
      file[0].type === "application/vnd.ms-excel" ||
      file[0].type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (!isExcel) {
      errorMessage = "You can only upload Excel file!";
    }
    console.log("file", file[0].type);
    const isLt2M = file[0].size / 1024 / 1024 < 2;
    if (!isLt2M) {
      errorMessage = "File must be smaller than 2MB!";
    }
    console.log("errorMessage", errorMessage);
    return errorMessage;
  }

  const fileHandler = fileList => {
    console.log("fileList", fileList);
    let fileObj = fileList;
    if (!fileObj) {
        setErrorMessage("No file uploaded!")
    
      return false;
    }
    console.log("fileObj.type:", fileObj.type);
    if (
      !(
        fileObj.type === "application/vnd.ms-excel" ||
        fileObj.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
        setErrorMessage("Unknown file format. Only Excel files are uploaded!")
     
      return false;
    }
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      //setShowMilestones(false)
      if (err) {
        console.log(err);
      } else {
        var milstonesCount = ((resp.cols.length-8)/2)
        console.log(milstonesCount)
        console.log(numberOfMilestones)
        if(milstonesCount != numberOfMilestones){
            setErrorMessage("Milestones are not valid")
        }else{
            pushColumns(resp.rows)
            //dd
        let newRows = [];
        resp.rows.slice(1).map((row, index) => {
            console.log(row)
          if (row && row !== "undefined") {
            const newRow = {
                key: index,
               // state: "Not posted",
               // company: `${companyName} - ${lobName}`,
                client: row[0],
                projectName: row[1],
                scope: row[2],
                status: row[3],
                contractSignatureDate: row[4]? ExcelDateToJSDate(row[4]): null,
                contractValue: row[5],
                contractValuecurrency: row[6],
                retainerValidatity: row[7],
              }
            newRows.push(pushMilestones(newRow,row));
          }
        });
    
        if (newRows.length === 0) {
            setErrorMessage("No data found in file!")
         
          return false;
        } else {
            setErrorMessage(null)
            setRows(newRows)
            console.log(newRows)
            console.log(cells)
            setCols(resp.cols)
          
        }
      }
    }
    });
    return false;
  };

  const pushColumns = (rows) => {
    let c = [
        // {
        //   title: 'State',
        //   dataIndex: 'state',
        // },
          {
            title: 'Client',
            dataIndex: 'client',
            //render: (_, record) => (record.client.name),
          },
          {
            title: 'Project',
            dataIndex: 'projectName'
          },
          {
            title: 'Scope',
            dataIndex: 'scope',
           // render: (_, record) => (ProjectScopes.find(x=>x.value==record.scope).label),
          },
          {
            title: 'Status',
            dataIndex: 'status',
           // render: (_, record) => (ProjectStatuses.find(x=>x.value==record.status).label),
          },
          {
            title: 'Contract Signature Date',
            dataIndex: 'contractSignatureDate',
            render: (_, record) => (record.contractSignatureDate!=null?moment(record.contractSignatureDate).format('DD-MM-YYYY'):null),
          },
          {
            title: 'Contract Value',
            dataIndex: 'contractValue'
          },
          {
            title: 'Currency',
            dataIndex: 'contractValuecurrency',
          //  render: (_, record) => (Currencies.find(x=>x.value==record.finalContractValueCurrency) ? Currencies.find(x=>x.value==record.finalContractValueCurrency).label:null),
          },
          {
            title: 'Retainer Vaidity (# of months)',
            dataIndex: 'retainerValidatity',
          },
        // {
        //   title: "Action",
        //   dataIndex: "action",
        //   render: (text, record) =>
        //     rows.length >= 1 ? (
        //       <Popconfirm
        //         title="Sure to delete?"
        //         onConfirm={() =>handleDelete(record.key)}
        //       >
        //         <DeleteOutlined  style={{ color: "red", fontSize: "20px" }} />
               
        //       </Popconfirm>
        //     ) : null
        // }
      ]
    for (let index = 1; index <= numberOfMilestones; index++) {
        let i=((index-1)*2)+8
        c.push({title:rows[0][i], dataIndex:`milestone${index}DateScheduled`,
        render: (_, record) => (record[`milestone${index}DateScheduled`]!=null?moment(record[`milestone${index}DateScheduled`]).format('DD-MM-YYYY'):null),})
        c.push({title:rows[0][i+1], dataIndex:`milestone${index}DateActual`,
        render: (_, record) => (record[`milestone${index}DateActual`]!=null?moment(record[`milestone${index}DateActual`]).format('DD-MM-YYYY'):null),})
     //   columns.push({title:rows[0][index+7], dataIndex:index+7})
     //   columns.push({title:rows[0][index+8], dataIndex:index+8})
    }
    // c.push({
    //     title: "Action",
    //     dataIndex: "action",
    //     render: (text, record) =>
    //       rows.length >= 1 ? (
    //         <Popconfirm
    //           title="Sure to delete?"
    //           onConfirm={() =>handleDelete(record.key)}
    //         >
    //           <DeleteOutlined  style={{ color: "red", fontSize: "20px" }} />
             
    //         </Popconfirm>
    //       ) : null
    //   })
      console.log(c)
      setColumns(c)


  setCells(c.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave
      })
    };
  }))
   
  }

  const pushMilestones = (newRow,row) => {
    for (let index = 1; index <= numberOfMilestones; index++) {
        let i=((index-1)*2)+8
        var newMilestoneDateScheduled = `milestone${index}DateScheduled` ;
        var newMilestoneDateActual = `milestone${index}DateActual` ;

        newRow[newMilestoneDateScheduled] = row[i]? ExcelDateToJSDate(row[i]): null;
        newRow[newMilestoneDateActual] = row[i+1]? ExcelDateToJSDate(row[i+1]): null ;

    }
    return newRow
  }

  const getProjectMilestones = (row) => {
    const projectMilestones=[]
    for (let index = 1; index <= numberOfMilestones; index++) {
      var newMilestoneDateScheduled = `milestone${index}DateScheduled` ;
      var newMilestoneDateActual = `milestone${index}DateActual` ;

      if(row[newMilestoneDateScheduled] || row[newMilestoneDateActual]){

        projectMilestones.push({
            Name:columns[((index-1)*2)+8].title.split('-')[0].trim(),
            DateScheduled:row[newMilestoneDateScheduled]? row[newMilestoneDateScheduled] : row[newMilestoneDateActual],//row[index+7],
            DateActual:row[newMilestoneDateActual],//row[index+8]
           // Status: ProjectStatuses.find(x=>x.label==row.status.split('-')[0].trim()).value ==3? 2 : (row.status.split('-')[1].trim() == `${index}`  ? 1 : (row.status.split('-')[1].trim() < `${index}`? 2: 0)),
            MilestoneIndex:index,
            Start:index==1,
            End:index==numberOfMilestones,
        })
      }
    }
    return projectMilestones
  }

  
  const getLOBMilestones = (row) => {
    const lobMilestones=[]
    for (let index = 1; index <= numberOfMilestones; index++) {

      

        lobMilestones.push({
            Name:columns[((index-1)*2)+8].title.split('-')[0].trim(),
            Description:"Imported through migration",
            NeedPayment:false
        })
      
    }
    return lobMilestones
  }

  const  handleSubmitCompanies = async () => {

    setActionLoading(true)
    showLoadingMessage('loading...')
  
    const companies = []
    rows.forEach(row => {
      var compIndx = -1
      var lobIndx = -1
      var clientIndx = -1
      compIndx = companies.indexOf(x=>x.Name==companyName)
      if(compIndx!=-1){
        lobIndx = companies[compIndx].indexOf(x=>x.Name==lobName)
      }
      if(lobIndx!=-1){
        clientIndx = companies[compIndx].LineOfBusinesses[lobIndx].Clients.indexOf(x=>x.Name==row.client)
      }
      if(compIndx ==-1){
      companies.push({
        Name:companyName,
        LineOfBusinesses: [{
          Name:lobName,
          Milestones:getLOBMilestones(row),
          //Company:{Name:row.company.split("-")[0]},
          Clients: [{Name:row.client}]
        }] ,
        
      })
    }else if(lobIndx==-1){
      companies[compIndx].push({LineOfBusinesses: [{
        Name:lobName,
        Milestones:getLOBMilestones(row),
       // Company:{Name:row.company.split("-")[0]},
        Clients: [{Name:row.client}]
      }]})
    }else if (clientIndx==-1){
      companies[compIndx].LineOfBusinesses[lobIndx].Clients.push(row.client)
    }
    });
  
    var result = await importCompanies(companies).unwrap()
    
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Companies-Import-Report",
        sheet: "Companies",
        tablePayload: {
          header: [ "State", "Company", "Client"],
          // accept two different data structures
          body: companies.map((row,i)=>({
            //key: i+2,
            state: result[i]? "Success":"Error",
            company: `${companyName} - ${lobName}`,
            client: row.client,
          }))
        }
      });
      
     
      setBasicDataSubmitted(true)
      setActionLoading(false)
      showMessage('Companies imported successfully!')
  
    };

const  handleSubmit = async () => {
    console.log("submitting: ", rows);
    //submit to API
    //if successful, banigate and clear the data
    //this.setState({ rows: [] })


  setActionLoading(true)
  showLoadingMessage('loading...')

    if((lineOfBusinessId==null || (companyName=="" && lobName=="")) && numberOfMilestones==-1 ){
        setErrorMessage("please fill company/lob and number of milstones")
        //alert("please fill company/lob and number of milstones")
    }else{

      var firstMilestoneDateScheduled = `milestone${1}DateScheduled` ;
      var firstMilestoneDateActual = `milestone${1}DateActual` ;
  
      var lastMilestoneDateScheduled = `milestone${numberOfMilestones}DateScheduled` ;
      var lastMilestoneDateActual = `milestone${numberOfMilestones}DateActual` ;

      console.log(rows[0].status)
      console.log(rows[0].status.split('-')[0].trim())
      console.log(ProjectStatuses)
      console.log(ProjectStatuses.find(x=>x.label==rows[0].status.split('-')[0].trim()).value)
    const projects = rows.map(row=>({
              LineOfBusiness: {
                Name:lobName,
                Company:{Name:companyName}} ,
              Client: {Name:row.client},
              ProjectName: row.projectName,
              Scope: ProjectScopes.find(x=>x.label==row.scope).value,
              Status: ProjectStatuses.find(x=>x.label==row.status.split('-')[0].trim()).value,
              ContractSignatureDate: row.contractSignatureDate,
              ContractValue: row.contractValue,
              ContractValueCurrency: row.ContractValueCurrency?Currencies.find(x=>x.desc==row.ContractValueCurrency).value:null ,
              RetainerValidatity: row.retainerValidatity,
              ProjectMilestones:getProjectMilestones(row),
              CurrentProjectMilestoneIndex:ProjectScopes.find(x=>x.label==row.scope).value == 0 ? (row.status.search('-') !=-1? row.status.split('-')[1].trim(): numberOfMilestones) : 0,
              MilestoneCount:numberOfMilestones,
              KickOffDateScheduled:row[firstMilestoneDateScheduled]? row[firstMilestoneDateScheduled] : row[firstMilestoneDateActual],
              KickOffDateActual:row[firstMilestoneDateActual],
              CompletionDateScheduled:row[lastMilestoneDateScheduled]? row[lastMilestoneDateScheduled] : row[lastMilestoneDateActual],
              CompletionDateActual:row[lastMilestoneDateActual],
              
    }))



    console.log(projects)

    

    var result = await importProjects(projects).unwrap()

    downloadExcel({
      fileName: "Projects-Import-Report",
      sheet: "Projects",
      tablePayload: {
        header: [ "State", "Company", "Client","ProjectName"],
        // accept two different data structures
        body: rows.map((row,i)=>({
          //key: i+2,
          state: result[i]? "Success":"Error",
          company: `${companyName} - ${lobName}`,
          client: row.client,
          projectName: row.projectName
        }))
      }
    });

    // const newRows =[]
    // rows.forEach((row,i) => {
      
    //   const newRow = {
    //     key: i,
    //     //state: result[i],
    //     company: `${companyName} - ${lobName}`,
    //     client: row.client,
    //     projectName: row.projectName,
    //     scope: row.scope,
    //     status: row.status,
    //     contractSignatureDate: row.contractSignatureDate,
    //     contractValue: row.contractValue,
    //     currency: row.currency,
    //     retainerValidatity: row.retainerValidatity,
    //   }
    //   newRows.push(pushMilestones(newRow,row));
      
    // });
   
  
    // setRows(newRows)

    setRows([])
    setColumns([])
    setCols([])

    setBasicDataSubmitted(false)
    setActionLoading(false)
    showMessage('Projects imported successfully!')


}
  };

 const handleDelete = key => {
    const rows = [...rows];
    setRows(rows.filter(item => item.key !== key))
  };
//   handleAdd = () => {
//     const { count, rows } = this.state;
//     const newData = {
//       key: count,
//       name: "User's name",
//       age: "22",
//       gender: "Female"
//     };
//     this.setState({
//       rows: [newData, ...rows],
//       count: count + 1
//     });
//   };

const Remove = () =>{
  setColumns([])
  setCells([])
  setRows([])
  setErrorMessage("")
}

useEffect( () =>{ 
   setComponents({
    body: {
      row: EditableFormRow,
      cell: EditableCell
    }
    
  })


  async function fetchMyAPI() {
    
    var companiesArray = await getCompanies({}).unwrap()
    setCompanies(companiesArray)
   
    transformLineOfBusinesses(companiesArray)
 
    
  }
  fetchMyAPI()
    
  }, [columns,cells])

  

  const returnHeader = () =>{
   
  
      const header = ["Client", "Project","ClientStatus","Scope","Status","ContractSignatureDate","ContractValue","ContractValueCurrency","RetainerValidatity"]
  
   
      header.push("[Milestone Name] - date scheduled")
      header.push("[Milestone Name] - date actual")
  
    return header
  }

  const HandleSampleExcelClick =() =>{
  
    downloadExcel({
      fileName: "Projects-Import-Sample-Sheet",
      sheet: "Projects",
      tablePayload: {
        header: returnHeader(),
        // accept two different data structures
        body: []
      }
    });
  
  }


  
  
  
  const handleChangeLineOfBusiness =   (value) => {
    console.log(value)
    if (value != "" && value !=null && value.length>1){
    setLineOfBusinessId(value)
    var lobName
    var compName
    companies.forEach(element => {
      var lob=element.lineOfBusinesses.find(x=>x.id===value[1])
      if(lob){
        lobName=lob.name
        compName=element.name
      }
    });
    setCompanyName(compName)
    setLobName(lobName)
   
  }else{
    setLineOfBusinessId(null)
    setCompanyName("")
    setLobName("")
  }
}


const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);


  
  
  
  
  
  
  
  
  const transformLineOfBusinesses = (comapniesArray) =>{
    console.log(comapniesArray)
    var lineOfBusinessesArray = []
    comapniesArray.forEach((company) => {
      if(company.lineOfBusinesses.length>0  && company.isActive){
        lineOfBusinessesArray.push({label:company.name,value:company.id,children:
          returnLineOfBusinesses(company.lineOfBusinesses)
        })
      }else{
        lineOfBusinessesArray.push({label:company.name,value:company.id,disabled:true
        })
      }
    });
    setCompaniesOptions(lineOfBusinessesArray)
  }
  
  
  const returnLineOfBusinesses =    (lineOfBusinesses) => {
    var lineOfBusinessesArray = []
    lineOfBusinesses.forEach(element => {
      lineOfBusinessesArray.push({label:element.name,value:element.id,disabled:element.isActive})
    });
    return lineOfBusinessesArray
  }

  // const ShowMilestones = ()=>{
  //   setShowMilestones(true)
  //   setColumns(columns)
  //   setColumns(columns)
  // }
  


  


    
    return (
      <>
        <div
       className="site-layout-background"
       style={{
         padding: 24,
         minHeight: 150,
       }}
     >
   

   <div  style={{paddingLeft:15}}>
        <h1>Importing projects data </h1>
        <Row gutter={16}>
          <Col
            span={8}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "5%"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="page-title">Upload Excel Component</div>
            </div>
          </Col>
          <Col span={8}>
            <Button
              onClick={HandleSampleExcelClick}
              
            >
              Sample excel sheet
            </Button>
          </Col>
          <Col
            span={8}
            align="right"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            {(rows.length)> 0 && (
              <>
                {/* <Button
                  onClick={this.handleAdd}
                  size="large"
                  type="info"
                  style={{ marginBottom: 16 }}
                >
                <PlusOutlined />
                  Add a row
                </Button>{" "} */}
                  <Button
                  onClick={handleSubmitCompanies}
                  size="large"
                  type="primary"
                  style={{ marginBottom: 16, marginLeft: 10 }}
                  disabled={actionLoading}
                >
                  Submit Basic Data
                </Button>

                {basicDataSubmitted? (<Button
                  onClick={handleSubmit}
                  size="large"
                  type="primary"
                  style={{ marginBottom: 16, marginLeft: 10 }}
                  disabled={actionLoading}
                >
                  Submit Projects
                </Button>) : null}
               
              </>
            )}
          </Col>
        </Row>
        <Row>
        <Col className="gutter-row" span={6}> 
            <Cascader
            name="lineOfBusinessId"
            value={lineOfBusinessId}
    options={companiesOptions}
    onChange={handleChangeLineOfBusiness}
    placeholder="Please select line of business"
    showSearch={{
      filter,
    }}
    style={{width:250}}
    onSearch={(value) => console.log(value)}
    disabled={freeTextCompany}
  /> or enter 

   </Col>
   <Checkbox value={freeTextCompany} onChange={handleChangeFreeTextCompany}></Checkbox>
   <Col className="gutter-row" span={6}> 
  <Input disabled={!freeTextCompany} value={companyName} name="companyName" placeholder="New company name" onChange={handleChangeCompany}   />
  </Col>
  <Col className="gutter-row" span={6}> 
  <Input disabled={!freeTextCompany} value={lobName} name="lobName" placeholder="New LOB name" onChange={handleChangeLOB}   />
  </Col>

           
           
        </Row>
        
        <div
       className="site-layout-background"
       style={{
         minHeight: 10,
       }}
     />
        <Row>
        <Col className="gutter-row" span={8}> 
            <InputNumber style={{width:250}} name="numberOfMilestones"  onChange={handleChangeNumberOfMilestones} placeholder="Enter Number of milestones"   />
            </Col>
            </Row>
            <div
       className="site-layout-background"
       style={{
         minHeight: 10,
       }}
     />
        <div>
          <Upload
            name="file"
            beforeUpload={fileHandler}
            onRemove={Remove}
            multiple={false}
            disabled={(numberOfMilestones==-1 || numberOfMilestones==null) || companyName=="" || lobName =="" || actionLoading}
            //{numberOfMilestones==-1 || numberOfMilestones==null || ((companyName=="" || companyName ==null) && (lobName=="" || lobName ==null)) || lineOfBusinessId ==-1 || lineOfBusinessId ==null || actionLoading}
          >
             <Button disabled={(numberOfMilestones==-1 || numberOfMilestones==null) || companyName=="" || lobName =="" || actionLoading} icon={<UploadOutlined />}>Click to Upload</Button>
            
          </Upload>
         
        </div>
        {errorMessage}
        <div style={{ marginTop: 20 }}>
          <Table
            components={components}
            rowClassName={() => "editable-row"}
            dataSource={rows}
            columns={cells}
            size="small"
          />
        </div>
        </div>
        </div>
      </>
    );
  
}

export default ImportProjectsData
