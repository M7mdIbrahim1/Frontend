import {useRef, useState, useEffect, React} from 'react'
import { useGetCompaniesMutation,useGetOpportunitiesMutation,useSaveOpportunityMutation,useDeleteOpportunityMutation,useExportOpportunitiesMutation,useUpdateOpportunityMutation,useSaveClientMutation } from "../slices/opportunityApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm,Cascader,Popover,DatePicker } from 'antd';
import {
  StepForwardOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import {OpportunityStatuses,OpportunitySources,ClientStatuses,OpportunityScopes, Currencies} from "../../Common/lookups";
import moment from 'moment';
import { downloadExcel } from "react-export-table-to-excel";
//import { ReactSpreadsheetImport } from "react-spreadsheet-import";
//import {OutTable, ExcelRenderer} from 'react-excel-renderer';
import {OutTable, ExcelRenderer} from 'react-excel-renderer';





function Opportunities() {




  const { RangePicker } = DatePicker;

  const { Option } = Select;

  const roles = useSelector(selectCurrentUserRoles);
  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }


  const columns = [
    {
      title: 'Company - LOB',
      dataIndex: 'company',
      render: (_, record) => (`${record.lineOfBusiness.company.name} - ${record.lineOfBusiness.name}`),
      sorter: true
    },
    {
      title: 'Client',
      dataIndex: 'client',
      render: (_, record) => (record.client.name),
    },
    {
      title: 'Project',
      dataIndex: 'projectName'
    },
    {
      title: 'Client status',
      dataIndex: 'clientStatus',
      render: (_, record) => (ClientStatuses.find(x=>x.value==record.clientStatus).label),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      render: (_, record) => (OpportunitySources.find(x=>x.value==record.source).label),
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      render: (_, record) => (OpportunityScopes.find(x=>x.value==record.scope).label),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, record) => (OpportunityStatuses.find(x=>x.value==record.status).label),
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
      dataIndex: 'firstProposalValuecurrency',
      render: (_, record) => (Currencies.find(x=>x.value==record.firstProposalValueCurrency) ? Currencies.find(x=>x.value==record.firstProposalValueCurrency).label:null),
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
      dataIndex: 'finalContractValuecurrency',
      render: (_, record) => (Currencies.find(x=>x.value==record.finalContractValueCurrency) ? Currencies.find(x=>x.value==record.finalContractValueCurrency).label:null),
    },
    {
      title: 'Retainer Validity (# of months)',
      dataIndex: 'retainerValidatity',
    },
    {
      title: 'Action',
      dataIndex: 'i',
      key: 'i',
      render: (_, record) =>  (allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','CommercialManager','CommercialUser']) ? <>
      <Link to="/progress-opportunity" state={{ id: record.id }}>
      <Button type="link" htmlType="button">
      <StepForwardOutlined />Progress
       </Button>
       </Link>
       <Popconfirm title="Sure to delete?" onConfirm={() => deleteClick(record.id)}>
       <Button disabled={actionLoading} type="link" htmlType="button" danger >
       <DeleteOutlined />Delete
       </Button>
       </Popconfirm>
       </>:null),
    },
  ];


  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: [1,5,10,20,50,100,500,1000],
    position: 'bottomCenter'
  });
 
  const [form] = Form.useForm();
  const key = 'updatable';


  const [actionLoading, setActionLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)


  

//const [saveOpportunity ] = useSaveOpportunityMutation();
//const [saveClient] = useSaveClientMutation();
const [deleteOpportunity] = useDeleteOpportunityMutation()
const [exportOpportunities] = useExportOpportunitiesMutation()
//const [updateOpportunity] = useUpdateOpportunityMutation()

const [getOpportunities , { isLoading }] = useGetOpportunitiesMutation();
const [opportunities, setOpportunities] = useState([])
const [getCompanies] = useGetCompaniesMutation();
const [companiesOptions, setCompaniesOptions] = useState([])
const [companies, setCompanies] = useState([])





const [searchLineOfBusinessIds, setSearchLineOfBusinessIds] = useState([])
const [searchDateFrom, setSearchDateFrom] = useState("")
const [searchDateTo, setSearchDateTo] = useState("")
const [searchStatus, setSearchStatus] = useState(-1)


const handleChangeSearchDates = (dates, datesString) => {
  setSearchDateFrom(datesString[0])
  setSearchDateTo(datesString[1])
  console.log(datesString[0])
  console.log(datesString[1])
  loadOpportunties(searchStatus,pagination.current,pagination.pageSize,searchLineOfBusinessIds,datesString[0],datesString[1])
  }



const handleSearchStatus = (args) => {
  console.log(args)
  setSearchStatus(args)
  loadOpportunties(args,pagination.current,pagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
}







const loadOpportunties = async (status,page,pageSize,lineOfBusinessesIds,fromDate,toDate) =>{

  var opportuntiesArray = await getOpportunities({ status, page, pageSize,lineOfBusinessesIds,fromDate:fromDate!=""? fromDate:null,toDate:toDate!=""?toDate:null}).unwrap()
  var total = opportuntiesArray.totalCount

  console.log(opportuntiesArray)

  setOpportunities(opportuntiesArray.opportunities)

  reSetPagingInfo(page,pageSize,total)
  
}

const reSetPagingInfo = (page,pageSize,total)=>{
  const paginationObject = {...pagination}
  paginationObject.current =page
  paginationObject.pageSize =pageSize
  paginationObject.total =total

  setPagination(paginationObject);
}


const handleTableChange = (newPagination, filters, sorter) => {
  // fetchData({
  //   sortField: sorter.field,
  //   sortOrder: sorter.order,
  //   pagination: newPagination,
  //   ...filters,
  // });
 loadOpportunties(searchStatus,newPagination.current,newPagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
};



useEffect( () =>{ 
  async function fetchMyAPI() {
  
    var companiesArray = await getCompanies({}).unwrap()
    setCompanies(companiesArray)
   
    transformLineOfBusinesses(companiesArray)
   loadOpportunties(-1, 1, pagination.pageSize,[],"","")

   console.log(companiesArray.lineOfBusinesses)
    
  }
  fetchMyAPI()
}, [])




const handleChangeSearchLineOfBusiness =  async (value) => {
  console.log(value)
  if (value !=null && value.length>0){
    var lobIds = []
    value.forEach(element => {
      if(element.length==1){
        companies.find(x=>x.id==element[0]).lineOfBusinesses.map(x=>x.id).forEach( item =>{
          lobIds.push(item)
        })
      }else{
        element.forEach((item, index) => {
          if(index!=0){
            lobIds.push(item)
          }   
        });
      }
      
    });
  console.log(lobIds)
  setSearchLineOfBusinessIds(lobIds)
  loadOpportunties(searchStatus,1, pagination.pageSize,lobIds,searchDateFrom,searchDateTo)
  }else{
    setSearchLineOfBusinessIds([])
    loadOpportunties(searchStatus,1, pagination.pageSize,[],searchDateFrom,searchDateTo)
  }
}






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



const onSearch = (value) => {
  console.log('search:', value);
};


  const body2 = [
    { firstname: "Edison", lastname: "Padilla", age: 14 },
    { firstname: "Cheila", lastname: "Rodriguez", age: 56 }
  ];

  const importClick =  () => {
    setIsOpen(true)
  }

  const onClose = () =>{
    setIsOpen(false)
  }

  const onSubmit = async () =>{

  }

const exportClick =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export",
      sheet: "Opportunities",
      tablePayload: {
        header: ["Company", "CLient", "Project","ClientStatus","Source","Scope","Status","FirstContactDate","FirstProposalDate","FirstProposalValue","FirstProposalValueCurrency","ContractSignatureDate","FinalContractValue","FinalContractValueCurrency","RetainerValidatity"],
        // accept two different data structures
        body: opportunities.map(x=>({
          Company:`${x.lineOfBusiness.company.name}-${x.lineOfBusiness.name}`,
          CLient:x.client.name,
          Project:x.projectName,
          ClientStatus:ClientStatuses.find(y=>y.value==x.clientStatus).label,
          Source:OpportunitySources.find(y=>y.value==x.source).label,
          Scope:OpportunityScopes.find(y=>y.value==x.scope).label,
          Status:OpportunityStatuses.find(y=>y.value==x.status).label,
          FirstContactDate:x.firstContactDate,
          FirstProposalDate:x.firstProposalDate,
          FirstProposalValue:x.firstProposalValue,
          FirstProposalValueCurrency:x.firstProposalValueCurrency?Currencies.find(y=>y.value==x.firstProposalValueCurrency).label:"",
          ContractSignatureDate:x.contractSignatureDate,
          FinalContractValue:x.finalContractValue,
          FinalContractValueCurrency:x.finalContractValueCurrency?Currencies.find(y=>y.value==x.finalContractValueCurrency).label:"",
          RetainerValidatity:x.retainerValidatity,
        }))
      }
    });
    showMessage('Report downloaded successfully!')
}

const exportClickWithCalc =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-Calculation",
      sheet: "Opportunities",
      tablePayload: {
        header: ["Company", "CLient", "Project","ClientStatus","Source","Scope","Status","FirstContactDate","FirstProposalDate","FirstProposalValue","FirstProposalValueCurrency","ContractSignatureDate","FinalContractValue","FinalContractValueCurrency","RetainerValidatity","FirstContactFW","FirstProposalFW","ContractSignatureFW","FirstContractToProposalCCT1","PorposalToContractCCT2","DiscountRate","RunRate","RunWay","ProposalCNC","ContractCNC"],
        // accept two different data structures
        body: opportunities.map(x=>({
          Company:`${x.lineOfBusiness.company.name}-${x.lineOfBusiness.name}`,
          CLient:x.client.name,
          Project:x.projectName,
          ClientStatus:ClientStatuses.find(y=>y.value==x.clientStatus).label,
          Source:OpportunitySources.find(y=>y.value==x.source).label,
          Scope:OpportunityScopes.find(y=>y.value==x.scope).label,
          Status:OpportunityStatuses.find(y=>y.value==x.status).label,
          FirstContactDate:x.firstContactDate,
          FirstProposalDate:x.firstProposalDate,
          FirstProposalValue:x.firstProposalValue,
          FirstProposalValueCurrency:x.firstProposalValueCurrency?Currencies.find(y=>y.value==x.firstProposalValueCurrency).label:"",
          ContractSignatureDate:x.contractSignatureDate,
          FinalContractValue:x.finalContractValue,
          FinalContractValueCurrency:x.finalContractValueCurrency?Currencies.find(y=>y.value==x.finalContractValueCurrency).label:"",
          RetainerValidatity:x.retainerValidatity,
          FirstContactFW:calculateFW(x.firstContactDate), 
          FirstProposalFW:calculateFW(x.firstProposalDate), 
          ContractSignatureFW:calculateFW(x.contractSignatureDate), 
          FirstContractToProposalCCT1:subtractTwoDates(x.firstContactDate,x.firstProposalDate), 
          PorposalToContractCCT2:subtractTwoDates(x.firstProposalDate,x.contractSignatureDate), 
          DiscountRate:(1 - (x.FinalContractValue /x.firstProposalValue)), 
          RunRate:x.retainerValidatity!=null && x.retainerValidatity!=""? x.finalContractValue/x.retainerValidatity:"NA", 
          RunWay:x.retainerValidatity!=null && x.retainerValidatity!=""?x.retainerValidatity/12:"NA", 
          ProposalCNC:x.firstProposalValueCurrency?Currencies.find(y=>y.value==x.firstProposalValueCurrency).label:"", 
          ContractCNC:x.finalContractValueCurrency?Currencies.find(y=>y.value==x.finalContractValueCurrency).label:""
        }))
      }
    });
    showMessage('Report downloaded successfully!')
}

const subtractTwoDates = (date1,date2) =>{
  var currentDate1 = new Date(date1).getTime()
  var currentDate2 = new Date(date2).getTime()
  var Difference_In_Time = currentDate2  - currentDate1 ;
      
    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return Difference_In_Days
}

const deleteClick = async (id) => {

  setActionLoading(true)
  showLoadingMessage('loading...')
    await deleteOpportunity({Id: id}).unwrap()
    showMessage('Opportunity deleted successfully!')
   loadOpportunties(-1, 1, pagination.pageSize,[],"","")
    reset()
    
  }


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

const reset = ()=>{
  
  

  setSearchStatus(-1)
  setSearchLineOfBusinessIds([])
  setSearchDateFrom("")
  setSearchDateTo("")

  setActionLoading(false)

  form.setFieldsValue({
    searchLineOfBusinessIds:[],
    searchStatus:null,
    searchDates:"",
  });
}



const onFinish = async (values) => {
  
  
   
  }




const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

const calculateFW = (date) =>{
  var currentDate = new Date(date);
  var startDate = new Date(currentDate.getFullYear(), 0, 1);
  var days = Math.floor((currentDate - startDate) /
      (24 * 60 * 60 * 1000));
        
  var weekNumber = Math.ceil(days / 7);

  // Display the calculated result       
  return weekNumber
}
 


  return (
    <>
    <Descriptions title="Opportunities Listing"></Descriptions>
 
 
         
             <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 150,
           }}
         >
       
 
       <div  style={{paddingLeft:15}}>
       <Form
        
       name="search"
       labelCol={{
         span: 24,
       }}
       wrapperCol={{
         span: 24,
       }}
       initialValues={{
         remember: true,
       }}
     >
       <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}>
         <Col className="gutter-row" span={6}>
         <Form.Item>
         <Select name="searchStatus"
      allowClear
      options= {OpportunityStatuses}
      onChange={handleSearchStatus}
      placeholder="Select status to search with"
    />
             </Form.Item>
         
           </Col>

           <Col className="gutter-row" span={6}>
         <Form.Item>
         <Cascader
         name="searchLineOfBusinessIds"
    options={companiesOptions}
    onChange={handleChangeSearchLineOfBusiness}
    placeholder="Please select line of business"
    showSearch={{
      filter,
    }}
    multiple
    maxTagCount="responsive"
    onSearch={(value) => console.log(value)}
  />
             </Form.Item>
         
           </Col>

           <Col className="gutter-row" span={6}>
         <Form.Item>
         <RangePicker name="searchDates" onChange={handleChangeSearchDates} />
             </Form.Item>
         
           </Col>

           {allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','CommercialManager']) ? (
           <Col className="gutter-row" span={6}> 
        

        {/* <ExcelFile element={ <Button style={{width:"100px"}}   disabled={actionLoading} type="primary" >Export</Button>}>
                <ExcelSheet data={opportunities} name="Opportunites">
                    <ExcelColumn label="Company" value={(col)=> `${col.company.name}\\${col.lineOfBusiness.name}`}/>
                    <ExcelColumn label="Client" value={(col)=> col.client.name}/>
                    <ExcelColumn label="Project" value="projectName"/>
                    <ExcelColumn label="ClientStatus" value={(col)=> ClientStatuses.find(x=>x.value==col.clientStatus).label}/>
                    <ExcelColumn label="Source" value={(col)=> OpportunitySources.find(x=>x.value==col.source).label}/>
                    <ExcelColumn label="Scope" value={(col)=> OpportunityScopes.find(x=>x.value==col.scope).label}/>
                    <ExcelColumn label="Status" value={(col)=> OpportunityStatuses.find(x=>x.value==col.status).label}/>
                    <ExcelColumn label="FirstContactDate" value="firstContactDate"/>
                    <ExcelColumn label="FirstProposalDate" value="firstProposalDate"/>
                    <ExcelColumn label="FirstProposalValue" value="firstProposalValue"/>
                    <ExcelColumn label="FirstProposalValueCurrency" value={(col)=> Currencies.find(x=>x.value==col.firstProposalValueCurrency).label}/>
                    <ExcelColumn label="ContractSignatureDate" value="contractSignatureDate"/>
                    <ExcelColumn label="FinalContractValue" value="finalContractValue"/>
                    <ExcelColumn label="FinalContractValueCurrency" value={(col)=> Currencies.find(x=>x.value==col.finalContractValueCurrency).label}/>
                    <ExcelColumn label="RetainerValidatity" value="retainerValidatity"/>
                </ExcelSheet>
            </ExcelFile> */}

<Button style={{width:"100px"}} onClick={exportClick}   disabled={actionLoading} type="primary" >Export</Button>{"  "}

{/* <Button  onClick={exportClickWithCalc}   disabled={actionLoading} type="primary" >Export calculation</Button> */}




</Col>):null}
          
          
       </Row>
       </Form>
  
   
  <Table
       columns={columns}
       rowKey={(record) => record.id}
       dataSource={opportunities}
       pagination={pagination}
      //  loading={isLoading}
       onChange={handleTableChange}
       size="small"
       rowClassName="editable-row"
     />
     </div>
   
 </div>
 </>
  )
}

export default Opportunities
