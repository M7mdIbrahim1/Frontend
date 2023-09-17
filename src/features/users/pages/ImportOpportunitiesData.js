import { useState, useEffect, React} from 'react'
import { Table, Button, Popconfirm, Row, Col, Icon, Upload,message } from "antd";
import { ExcelRenderer } from "react-excel-renderer";
import { EditableCell } from "../../Common/Components/Excel/EditableCell";
import { EditableFormRow} from "../../Common/Components/Excel/EditableFormRow";
import moment from 'moment';
import { useImportOpportunitiesMutation,useImportCompaniesMutation } from "../slices/userApiSlice"
import { downloadExcel } from "react-export-table-to-excel"
import {OpportunityStatuses,OpportunitySources,ClientStatuses,OpportunityScopes, Currencies} from "../../Common/lookups";

import {
    DeleteOutlined,
    PlusOutlined,
    UploadOutlined
  } from '@ant-design/icons'

 



function ImportOpportunitiesData() {

    const columns = [
      // {
      //   title: 'State',
      //   dataIndex: 'state',
      // },
        {
            title: 'Company - LOB',
            dataIndex: 'company',
          //  render: (_, record) => (`${record.lineOfBusiness.company.name} - ${record.lineOfBusiness.name}`),
         //   sorter: true
          },
          {
            title: 'Client',
            dataIndex: 'client',
          //  render: (_, record) => (record.client.name),
          },
          {
            title: 'Project',
            dataIndex: 'projectName'
          },
          {
            title: 'Client status',
            dataIndex: 'clientStatus',
          //  render: (_, record) => (ClientStatuses.find(x=>x.value==record.clientStatus).label),
          },
          {
            title: 'Source',
            dataIndex: 'source',
          //  render: (_, record) => (OpportunitySources.find(x=>x.value==record.source).label),
          },
          {
            title: 'Scope',
            dataIndex: 'scope',
          //  render: (_, record) => (OpportunityScopes.find(x=>x.value==record.scope).label),
          },
          {
            title: 'Status',
            dataIndex: 'status',
          //  render: (_, record) => (OpportunityStatuses.find(x=>x.value==record.status).label),
          },
          {
            title: 'First contact date',
            dataIndex: 'firstContactDate',
            render: (_, record) => (record.firstContactDate!=null?moment(record.firstContactDate).format('DD-MM-YYYY'):null),
          },
          {
            title: 'First proposal date',
            dataIndex: 'firstProposalDate',
            render: (_, record) => (record.firstProposalDate!=null?moment(record.firstProposalDate).format('DD-MM-YYYY'):null),
          },
          {
            title: 'First proposal value',
            dataIndex: 'firstProposalValue',
          },
          {
            title: 'Currency',
            dataIndex: 'firstProposalValueCurrency',
           // render: (_, record) => (Currencies.find(x=>x.value==record.firstProposalValueCurrency) ? Currencies.find(x=>x.value==record.firstProposalValueCurrency).label:null),
          },
          {
            title: 'Contract Signature Date',
            dataIndex: 'contractSignatureDate',
            render: (_, record) => (record.contractSignatureDate!=null?moment(record.contractSignatureDate).format('DD-MM-YYYY'):null),
          },
          {
            title: 'Final Contract Value',
            dataIndex: 'finalContractValue'
          },
          {
            title: 'Currency',
            dataIndex: 'finalContractValueCurrency',
           // render: (_, record) => (Currencies.find(x=>x.value==record.finalContractValueCurrency) ? Currencies.find(x=>x.value==record.finalContractValueCurrency).label:null),
          },
          {
            title: 'Retainer Validity (# of months)',
            dataIndex: 'retainerValidatity',
          },
        // {
        //   title: "GENDER",
        //   dataIndex: "gender",
        //   //editable: true
        // },
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

    const [cols, setCols] = useState([])
    const [rows, setRows] = useState([])
    const [errorMessage, setErrorMessage] = useState(null)
    const [components, setComponents] = useState(null)
    const [cells, setCells] = useState([])

   // const [opportunities, setOpportunities] = useState([])

    
   const [actionLoading, setActionLoading] = useState(false)
   const [basicDataSubmitted, setBasicDataSubmitted] = useState(false)
   const key = 'updatable';


  const [importOpportunities] = useImportOpportunitiesMutation()
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
      console.log(resp.rows[1][7])
      if (err) {
        console.log(err);
      } else {
        let newRows = [];
        resp.rows.slice(1).map((row, index) => {
          if (row && row !== "undefined") {
            newRows.push({
              key: index,
             // state: "Not posted",
              company: row[0],
              client: row[1],
              projectName: row[2],
              clientStatus: row[3],
              source: row[4],
              scope: row[5],
              status: row[6],
              firstContactDate: row[7]? ExcelDateToJSDate(row[7]): null,
              firstProposalDate: row[8]? ExcelDateToJSDate(row[8]): null,
              firstProposalValue: row[9],
              firstProposalValueCurrency: row[10],
              contractSignatureDate: row[11]? ExcelDateToJSDate(row[11]):null,
              finalContractValue: row[12],
              finalContractValueCurrency: row[13],
              retainerValidatity: row[14],
            });
          }
        });
        if (newRows.length === 0) {
            setErrorMessage("No data found in file!")
         
          return false;
        } else {
            setErrorMessage(null)
            console.log(newRows)
            setRows(newRows)
            setCols(resp.cols)
          
        }
      }
    });
    return false;
  };




const  handleSubmitCompanies = async () => {

  setActionLoading(true)
  showLoadingMessage('loading...')

  const companies = [
  //   {
  //   Name:rows[0].company.split("-")[0].trim(),
  //   LineOfBusinesses: [{
  //     Name:rows[0].company.split("-")[1].trim(),
  //     Company:{Name:rows[0].company.split("-")[0].trim()},
  //     Clients: []
  //   }] ,
    
  // }
]
  rows.forEach(row => 
  //   {
  //   if(!companies[0].LineOfBusinesses[0].Clients.find(x=>x.Name==row.client)){
  //   companies[0].LineOfBusinesses[0].Clients.push({Name:row.client})
  //   }
  // }
    {
    console.log(companies)
    var compIndx = -1
    var lobIndx = -1
    var clientIndx = -1
    compIndx = companies.findIndex(x=>x.Name===row.company.split("-")[0].trim())
    console.log(compIndx)
    if(compIndx!=-1){
      lobIndx = companies[compIndx].LineOfBusinesses.findIndex(x=>x.Name==row.company.split("-")[1].trim())
    }
    if(lobIndx!=-1){
      clientIndx = companies[compIndx].LineOfBusinesses[lobIndx].Clients.findIndex(x=>x.Name==row.client)
    }
    if(compIndx ==-1){
    companies.push({
      Name:row.company.split("-")[0].trim(),
      LineOfBusinesses: [{
        Name:row.company.split("-")[1].trim(),
        //Company:{Name:row.company.split("-")[0].trim()},
        Clients: [{Name:row.client}],
        Milestones: []
      }] ,
      
    })
  }else if(lobIndx==-1){
    companies[compIndx].LineOfBusinesses.push({
      Name:row.company.split("-")[1].trim(),
      //Company:{Name:row.company.split("-")[0].trim()},
      Clients: [{Name:row.client}],
      Milestones: []
    })
  }else if (clientIndx==-1){
    companies[compIndx].LineOfBusinesses[lobIndx].Clients.push({Name:row.client})
  }
  }
  );

  console.log(companies)

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
          company: row.company,
          client: row.client,
        }))
      }
    });
    
   setBasicDataSubmitted(true)
    setActionLoading(false)
    showMessage('Companies imported successfully!')

  };

const  handleSubmit = async () => {

  setActionLoading(true)
  showLoadingMessage('loading...')



  const opportunities = rows.map(row=>({
    LineOfBusiness: {
      Name:row.company.split("-")[1].trim(),
      Company:{Name:row.company.split("-")[0].trim()}} ,
    Client: {Name:row.client},
    ProjectName: row.projectName,
    ClientStatus: ClientStatuses.find(x=>x.label==row.clientStatus).value,
    Source: OpportunitySources.find(x=>x.label==row.source).value ,
    Scope: OpportunityScopes.find(x=>x.label==row.scope).value,
    Status: OpportunityStatuses.find(x=>x.label==row.status).value,
    FirstContactDate: row.firstContactDate,//?ExcelDateToJSDate(row.firstContactDate):null,
    FirstProposalDate: row.firstProposalDate,//?ExcelDateToJSDate(row.firstProposalDate):null,
    FirstProposalValue: row.firstProposalValue,
    FirstProposalValueCurrency:  row.firstProposalValueCurrency?Currencies.find(x=>x.desc==row.firstProposalValueCurrency).value:null,
    CurrentProposalValue: row.firstProposalValue,
    CurrentProposalValueCurrency:  row.firstProposalValueCurrency?Currencies.find(x=>x.desc==row.firstProposalValueCurrency).value:null,
    ContractSignatureDate: row.contractSignatureDate,//?ExcelDateToJSDate(row.contractSignatureDate):null,
    FinalContractValue: row.finalContractValue,
    FinalContractValueCurrency: row.finalContractValueCurrency?Currencies.find(x=>x.desc==row.finalContractValueCurrency).value:null,
    RetainerValidatity: row.retainerValidatity,
}))


console.log(opportunities)



var result = await importOpportunities(opportunities).unwrap()

console.log(result)
  
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Import-Report",
      sheet: "Opportunities",
      tablePayload: {
        header: [ "State", "Company", "Client","ProjectName"],
        // accept two different data structures
        body: rows.map((row,i)=>({
          //key: i+2,
          state: result[i]? "Success":"Error",
          company: row.company,
          client: row.client,
          projectName: row.projectName
        }))
      }
    });
    
   

    // setRows(rows.map((row,i)=>({
    //   key: i,
    //  // state: result[i].message,
    //   company: row.company,
    //   client: row.client,
    //   projectName: row.projectName,
    //   clientStatus: row.clientStatus,
    //   source: row.source,
    //   scope: row.scope,
    //   status: row.status,
    //   firstContactDate: row.firstContactDate,//? ExcelDateToJSDate(row.firstContactDate): null,
    //   firstProposalDate: row.firstProposalDate,//? ExcelDateToJSDate(row.firstProposalDate): null,
    //   firstProposalValue: row.firstProposalValue,
    //   firstProposalValueCurrency: row.firstProposalValueCurrency,
    //   contractSignatureDate: row.contractSignatureDate,//? ExcelDateToJSDate(row.contractSignatureDate):null,
    //   finalContractValue: row.finalContractValue,
    //   finalContractValueCurrency: row.finalContractValueCurrency,
    //   retainerValidatity: row.retainerValidatity,
    // })))

    setRows([])

    setBasicDataSubmitted(false)
    setActionLoading(false)
    showMessage('Opportunities imported successfully!')

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


useEffect( () =>{ 
   setComponents({
    body: {
      row: EditableFormRow,
      cell: EditableCell
    }
  })

  setCells(columns.map(col => {
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
    
  }, [])

  const HandleSampleExcelClick =() =>{
    downloadExcel({
        fileName: "Opportunities-Import-Sample-Sheet",
        sheet: "Opportunities",
        tablePayload: {
          header: ["Company - LOB", "Client", "Project","ClientStatus","Source","Scope","Status","FirstContactDate","FirstProposalDate","FirstProposalValue","FirstProposalValueCurrency","ContractSignatureDate","FinalContractValue","FinalContractValueCurrency","RetainerValidatity"],
          // accept two different data structures
          body:[]
        }
      });
  }


  


    
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
        <h1>Importing opportunities data </h1>
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
            {rows.length > 0 && (
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
                  Submit Opportunities
                </Button>) : null}
                
              </>
            )}
          </Col>
        </Row>
        <div>
          <Upload
            name="file"
            beforeUpload={fileHandler}
            onRemove={() =>setRows([])}
            multiple={false}
          >
             <Button disabled={actionLoading} icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </div>
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

export default ImportOpportunitiesData
