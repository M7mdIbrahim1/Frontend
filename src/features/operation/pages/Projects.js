import {useRef, useState, useEffect, React} from 'react'
import { useGetCompaniesMutation,useGetProjectsMutation,useDeleteProjectMutation,useExportProjectsMutation } from "../slices/projectApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm,Cascader,DatePicker } from 'antd';
import {
  StepForwardOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import {ProjectStatuses,ClientStatuses,ProjectScopes, Currencies} from "../../Common/lookups";
import moment from 'moment';
import { downloadExcel } from "react-export-table-to-excel";

function Projects() {

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
      title: 'Scope',
      dataIndex: 'scope',
      render: (_, record) => (ProjectScopes.find(x=>x.value==record.scope).label),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, record) => (ProjectStatuses.find(x=>x.value==record.status).label),
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
      render: (_, record) => (Currencies.find(x=>x.value==record.finalContractValueCurrency) ? Currencies.find(x=>x.value==record.finalContractValueCurrency).label:null),
    },
    {
      title: 'Retainer Vaidity (# of months)',
      dataIndex: 'retainerValidatity',
    },
    {
      title: 'Action',
      dataIndex: 'i',
      key: 'i',
      render: (_, record) =>  (allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','operationManager','operationUser']) ? <>
      <Link to="/progress-project" state={{ ProjectId: record.id, OpportunityId:-1 }}>
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

//const [saveOpportunity ] = useSaveOpportunityMutation();
//const [saveClient] = useSaveClientMutation();
const [deleteProject] = useDeleteProjectMutation()
const [exportProjects] = useExportProjectsMutation()
//const [updateOpportunity] = useUpdateOpportunityMutation()

const [getProjects , { isLoading }] = useGetProjectsMutation();
const [projects, setProjects] = useState([])
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
  loadProjects(searchStatus,pagination.current,pagination.pageSize,searchLineOfBusinessIds,datesString[0],datesString[1])
  }



const handleSearchStatus = (args) => {
  console.log(args)
  setSearchStatus(args)
  loadProjects(args,pagination.current,pagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
}







const loadProjects = async (status,page,pageSize,lineOfBusinessesIds,fromDate,toDate) =>{

  var projectsArray = await getProjects({ status, page, pageSize,lineOfBusinessesIds,fromDate:fromDate!=""? fromDate:null,toDate:toDate!=""?toDate:null}).unwrap()
  var total = projectsArray.totalCount

  console.log(projectsArray.projects)

  setProjects(projectsArray.projects)

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
 loadProjects(searchStatus,newPagination.current,newPagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
};



useEffect( () =>{ 
  async function fetchMyAPI() {
  
    var companiesArray = await getCompanies({}).unwrap()
    setCompanies(companiesArray)
   
    transformLineOfBusinesses(companiesArray)
   loadProjects(-1, 1, pagination.pageSize,[],"","")

    
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
  loadProjects(searchStatus,1, pagination.pageSize,lobIds,searchDateFrom,searchDateTo)
  }else{
    setSearchLineOfBusinessIds([])
    loadProjects(searchStatus,1, pagination.pageSize,[],searchDateFrom,searchDateTo)
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


const deleteClick = async (id) => {

  setActionLoading(true)
  showLoadingMessage('loading...')
    await deleteProject({Id: id}).unwrap()
    showMessage('Project deleted successfully!')
   loadProjects(-1, 1, pagination.pageSize,[],"","")
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

const returnHeader = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  console.log(lobs)
  const uniqueLobs = [...new Set(lobs)];
  console.log(uniqueLobs)
  const headerList = []

  uniqueLobs.forEach(x=>{
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==x)]

    console.log(x)

    console.log(projectsList)

    const header = ["Company", "CLient", "Project","Scope","Status","ContractSignatureDate","ContractValue","ContractValueCurrency","RetainerValidatity"]

  projectsList[0].lineOfBusiness.milestones.forEach(element => {
    header.push(`${element.name} - date scheduled`)
    header.push(`${element.name} - date actual`)
  });

  headerList.push(header)
  })
  return headerList
}

const returnProjectExportList =  () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(x=>{
    const lobProjects = [];
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==x)]

    projectsList.forEach(x => {
      const project ={
        Company:`${x.lineOfBusiness.company.name}\\${x.lineOfBusiness.name}`,
          CLient:x.client.name,
          Project:x.projectName,
          Scope:ProjectScopes.find(y=>y.value==x.scope).label,
          Status:ProjectStatuses.find(y=>y.value==x.status).label,
          ContractSignatureDate:x.contractSignatureDate,
          ContractValue:x.contractValue,
          ContractValueCurrency:x.contractValueCurrency?Currencies.find(y=>y.value==x.contractValueCurrency).label:"",
          RetainerValidatity:x.retainerValidatity,
      }
      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone){
        project[`${element.name} - date scheduled`] = milestone.dateScheduled
        project[`${element.name} - date actual`] = milestone.dateActual
        }else{
          project[`${element.name} - date scheduled`] = ""
          project[`${element.name} - date actual`] = ""
        }
      });

      lobProjects.push(project)
    });
    projectsExportList.push(lobProjects)
  })
 
 
  return projectsExportList
}


const exportClick =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')

  const headerList = returnHeader()
  console.log(headerList)
  const projectExportList = returnProjectExportList()
  //  await exportProjects({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()

  headerList.forEach((element,index) => {
    downloadExcel({
      fileName: "Projects-Export",
      sheet: "Projects",
      tablePayload: {
        header: element,
        // accept two different data structures
        body: projectExportList[index] 
      }
    });
  });
  showMessage('Reports downloaded successfully!')
}


const returnHeaderWithCalc = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  console.log(lobs)
  const uniqueLobs = [...new Set(lobs)];
  console.log(uniqueLobs)
  const headerList = []

  uniqueLobs.forEach(x=>{
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==x)]

    console.log(x)

    console.log(projectsList)

    const header = ["Company", "CLient", "Project","Scope","Status","ContractSignatureDate","ContractValue","ContractValueCurrency","RetainerValidatity"
  ,]

  projectsList[0].lineOfBusiness.milestones.forEach(element => {
    header.push(`${element.name} - date scheduled`)
    header.push(`${element.name} - date actual`)
  });

  header.push("KickOffFW")
  header.push("ClientApprovalFW1")
  header.push("ProjectCompletionFW")
  header.push("InvoiceFW")
  header.push("Contract to Kick off")

  projectsList[0].lineOfBusiness.milestones.forEach((element,index) => {
    if(index != projectsList[0].lineOfBusiness.milestones.length-1){
    header.push(`OCT ${element.name} to ${projectsList[0].lineOfBusiness.milestones[index+1].name}`)
    }
  });

  projectsList[0].lineOfBusiness.milestones.forEach((element,index) => {
    if(index != projectsList[0].lineOfBusiness.milestones.length-1){
    header.push(`ODP ${element.name} Scheduled to Actual`)
    }
  });

  projectsList[0].lineOfBusiness.milestones.forEach((element,index) => {
    if(index != projectsList[0].lineOfBusiness.milestones.length-1){
    header.push(`Future Scheduling ${element.name} FW`)
    }
  });

  projectsList[0].lineOfBusiness.milestones.forEach((element,index) => {
    if(index != projectsList[0].lineOfBusiness.milestones.length-1){
    header.push(`OBA ${element.name}`)
    }
  });
  

  headerList.push(header)
  })
  return headerList
}

const returnProjectExportListWithCalc =  () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(x=>{
    const lobProjects = [];
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==x)]

    projectsList.forEach(x => {
      const project ={
        Company:`${x.lineOfBusiness.company.name}\\${x.lineOfBusiness.name}`,
          CLient:x.client.name,
          Project:x.projectName,
          Scope:ProjectScopes.find(y=>y.value==x.scope).label,
          Status:ProjectStatuses.find(y=>y.value==x.status).label,
          ContractSignatureDate:x.contractSignatureDate,
          ContractValue:x.contractValue,
          ContractValueCurrency:x.contractValueCurrency?Currencies.find(y=>y.value==x.contractValueCurrency).label:"",
          RetainerValidatity:x.retainerValidatity,
      }
      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone){
        project[`${element.name} - date scheduled`] = milestone.dateScheduled
        project[`${element.name} - date actual`] = milestone.dateActual
        }else{
          project[`${element.name} - date scheduled`] = ""
          project[`${element.name} - date actual`] = ""
        }
      });

      lobProjects.push(project)
    });
    projectsExportList.push(lobProjects)
  })
 
 
  return projectsExportList
}

const exportClickWithCalc =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')

  const headerList = returnHeaderWithCalc()
  const projectExportList = returnProjectExportListWithCalc()
  //  await exportProjects({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()

  headerList.forEach((element,index) => {
    downloadExcel({
      fileName: "Projects-Export-Calculation",
      sheet: "Projects",
      tablePayload: {
        header: element,
        // accept two different data structures
        body: projectExportList[index] 
      }
    });
  });
  showMessage('Reports downloaded successfully!')
}




const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);


 


  return (
    <>
    <Descriptions title="Projects Listing"></Descriptions>
 
 
         
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
      options= {ProjectStatuses}
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

           {allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','operationManager']) ? (
           <Col className="gutter-row" span={6}> 
        
        <Button style={{width:"100px"}}   disabled={actionLoading} type="primary" onClick={exportClick} >
       Export
      </Button>
            {" "}
      <Button  onClick={exportClickWithCalc}   disabled={actionLoading} type="primary" >Export calculation</Button>
</Col>):null}
          
          
       </Row>
       </Form>
  
   
  <Table
       columns={columns}
       rowKey={(record) => record.id}
       dataSource={projects}
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

export default Projects