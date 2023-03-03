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

function OperationCalculations() {

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

const insertEmptyLine = () => {
  return ["",""]
}

const exportAll = () => {
  const excels = []

  //const FWHeader = GetHeaderFW()
  const FMHeader = GetHeaderFM()
  const YTDHeader = GetHeaderYTD()

 // const FWScheduleCountBody = returnProjectMilestonesForScheduleCountFWCalc()
  const FWBody = returnProjectMilestonesForFWCalc()
  const FMBody = returnProjectMilestonesForFMCalc()
  const YTDBody = returnProjectMilestonesForYTDCalc()


  const headerCycleTimePercentile = GetHeaderProjectsCycleTimePercentile()
  const bodyCycleTimePercentile = GetBodyProjectsCycleTimePercentile()


  const headerPlanningDeltaPercentile = GetHeaderProjectsPlanningDeltaPercentile()
  const bodyPlanningDeltaPercentile = GetBodyProjectsPlanningDeltaPercentile()

  const headerBacklogPercentile = GetHeaderProjectsBacklogPercentile()
  const bodyBacklogPercentile = GetBodyProjectsBacklogPercentile()
   
 
  const bodyScheduleCountFWCalc = returnProjectMilestonesForScheduleCountFWCalc()

  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  
  uniqueLobs.forEach((x,i)=>{
    const excel = []
   
    //excel.push(FWHeader)

    FWBody[i].forEach(element => {
      excel.push(element)
    });

    excel.push(insertEmptyLine())
    excel.push(insertEmptyLine())

    excel.push(FMHeader)

    FMBody[i].forEach(element => {
      excel.push(element)
    });

    excel.push(insertEmptyLine())
    excel.push(insertEmptyLine())

    excel.push(YTDHeader)

    YTDBody[i].forEach(element => {
      excel.push(element)
    });


    excel.push(headerCycleTimePercentile)

    bodyCycleTimePercentile[i].forEach(element => {
      excel.push(element)
    });

    excel.push(insertEmptyLine())
    excel.push(insertEmptyLine())

    excel.push(headerPlanningDeltaPercentile)

    bodyPlanningDeltaPercentile[i].forEach(element => {
      excel.push(element)
    });

    excel.push(insertEmptyLine())
    excel.push(insertEmptyLine())

    excel.push(headerBacklogPercentile)

    bodyBacklogPercentile[i].forEach(element => {
      excel.push(element)
    });

    excel.push(insertEmptyLine())
    excel.push(insertEmptyLine())

    excel.push(GetHeaderFW())

    bodyScheduleCountFWCalc[i].forEach(element => {
      excel.push(element)
    });

    excels.push(excel)
  
  })


  setActionLoading(true)
  showLoadingMessage('loading...')
 
  excels.forEach((element,index) => {
    downloadExcel({
      fileName: "Projects-Export-All-Calculation",
      sheet: "Projects",
      tablePayload: {
        header: GetHeaderFW(),
        // accept two different data structures
        body: element
      }
    });
  });
  showMessage('Reports downloaded successfully!')
  setActionLoading(false)

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
      },

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

  uniqueLobs.forEach(u=>{
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

   

    console.log(projectsList)

    const header = ["Company", "CLient", "Project","Scope","Status","ContractSignatureDate","ContractValue","ContractValueCurrency","RetainerValidatity"
  ,]

  projectsList[0].lineOfBusiness.milestones.forEach(element => {
    header.push(`${element.name} - date scheduled`)
    header.push(`${element.name} - date actual`)
  });

  projectsList[0].lineOfBusiness.milestones.forEach(element => {
    header.push(`${element.name}FW`)
  });

  // header.push("KickOffFW")
  // header.push("ClientApprovalFW")
  // header.push("ProjectCompletionFW")
  // header.push("InvoiceFW")
  // header.push("Contract to Kick off")

  projectsList[0].lineOfBusiness.milestones.forEach((element,index) => {
    if (index==0){
      header.push(`OCT Contract to ${projectsList[0].lineOfBusiness.milestones[index+1].name}`)
    }
    else if(index < projectsList[0].lineOfBusiness.milestones.length-1){
    header.push(`OCT ${element.name} to ${projectsList[0].lineOfBusiness.milestones[index+1].name}`)
    }
  });

  projectsList[0].lineOfBusiness.milestones.forEach((element,index) => {
    if(index !=0){
    header.push(`ODP ${element.name} Scheduled to Actual`)
    }
  });

  projectsList[0].lineOfBusiness.milestones.forEach((element,index) => {
    if(index != 0){
    header.push(`Future Scheduling ${element.name} FW`)
    }
  });

  projectsList[0].lineOfBusiness.milestones.forEach((element,index) => {
    if(index == 0){
      header.push('Not started')
    }else{
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
  
  uniqueLobs.forEach(u=>{
    const lobProjects = [];
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

    projectsList.forEach(x => {
      const project =[
        `${x.lineOfBusiness.company.name}\\${x.lineOfBusiness.name}`,
          x.client.name,
         x.projectName,
          ProjectScopes.find(y=>y.value==x.scope).label,
          ProjectStatuses.find(y=>y.value==x.status).label,
          x.contractSignatureDate,
         x.contractValue,
          x.contractValueCurrency?Currencies.find(y=>y.value==x.contractValueCurrency).label:"",
          x.retainerValidatity]
      
      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone){
        project.push(milestone.dateScheduled)
        project.push(milestone.dateActual)
        }else{
          project.push("")
          project.push("")
        }
      });

 

      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone){
          project.push(calculateFW(milestone.dateActual))
        }else{
          project.push("")
        }
      });

      x.lineOfBusiness.milestones.forEach((element,index) => {
        if(index ==0){
          const milestone = x.projectMilestones.find(x=>x.name == element.name)
          const contractDate = x.opportunity.contractSignatureDate
          if(milestone && milestone.dateActual){
            project.push( subtractTwoDates(contractDate,milestone.dateActual))
          }else{
            project.push("")
          }
        }
        else if(index < x.lineOfBusiness.milestones.length-1){
        const milestone1 = x.projectMilestones.find(x=>x.name == element.name)
        const milestone2 = x.projectMilestones.find(x=>x.name == x.lineOfBusiness.milestones[index+1].name)
        if(milestone1 && milestone2 && milestone1.dateActual && milestone2.dateActual){
          project.push( subtractTwoDates(milestone1.dateActual,milestone2.dateActual))
        }else{
          project.push("")
        }
      }
      });

      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone && milestone.dateActual){
          project.push( subtractTwoDates(milestone.dateScheduled,milestone.dateActual))
        }else{
          project.push("")
        }
      });

      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone && milestone.dateScheduled>Date.now){
          project.push( calculateFW(milestone.dateScheduled))
        }else{
          project.push("")
        }
      });

      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone && !milestone.dateActual){
          project.push( subtractTwoDates(Date.now,milestone.dateScheduled))
        }else{
          project.push("")
        }
      });


    

      lobProjects.push(project)
    });
    projectsExportList.push(lobProjects)
  })
 
 
  return projectsExportList
}

const subtractTwoDates = (date1,date2) =>{
  var currentDate1 = new Date(date1).getTime()
  var currentDate2 = new Date(date2).getTime()
  var Difference_In_Time = currentDate2  - currentDate1 ;
      
    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return Difference_In_Days
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
  setActionLoading(false)
}




const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

///////////////////////////////////





const exportClickWithProjectScheduleCountFW =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
   
 
  const projectMilestonesForCalc = returnProjectMilestonesForScheduleCountFWCalc()
 
  projectMilestonesForCalc.forEach((element,index) => {
    downloadExcel({
      fileName: "Projects-Export-FW-Calculation",
      sheet: "Projects",
      tablePayload: {
        header: GetHeaderFW(),
        // accept two different data structures
        body: element
      }
    });
  });
  showMessage('Reports downloaded successfully!')
  setActionLoading(false)
}


const returnProjectMilestonesForScheduleCountFWCalc = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(u=>{
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

    
      const project =[]
      projectsList[0].lineOfBusiness.milestones.forEach((element,i)=> {
       // const milestone = x.projectMilestones.find(x=>x.name == element.name)
       // if(milestone){
        console.log(element)
        project.push([])
        project[i].push(element.name)
        project[i].push(0)
        for (let index = 1; index < 53; index++) {
          project[i].push(projectsList.filter(x=>x.projectMilestones.find(y=>y.name == element.name) && x.projectMilestones.find(y=>y.name == element.name).dateScheduled>Date.now ? calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==index : false).length)
        }
       // }
      });

    
  
    projectsExportList.push(project)
  })
 
 
  return projectsExportList
}


  ///////////////////


const exportClickWithFW =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
   
 
  const projectMilestonesForCalc = returnProjectMilestonesForFWCalc()
 
  projectMilestonesForCalc.forEach((element,index) => {
    downloadExcel({
      fileName: "Projects-Export-FW-Calculation",
      sheet: "Projects",
      tablePayload: {
        header: GetHeaderFW(),
        // accept two different data structures
        body: element
      }
    });
  });
  showMessage('Reports downloaded successfully!')
  setActionLoading(false)
}

const GetHeaderFW = () =>{
  const header = ["Type/FW"]
  for (let index = 1; index < 54; index++) {
    if(index==1)
    {
      header.push("LY")
    }else{
    header.push(`FW${index}`)
    }
  }
  return header
}

const returnProjectMilestonesForFWCalc = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(x=>{
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==x)]

    
      const project =[]
      projectsList[0].lineOfBusiness.milestones.forEach((element,i)=> {
       // const milestone = x.projectMilestones.find(x=>x.name == element.name)
       // if(milestone){
        console.log(element)
        project.push([])
        project[i].push(element.name)
        project[i].push(0)
        for (let index = 1; index < 53; index++) {
          project[i].push(projectsList.filter(x=>x.projectMilestones.find(y=>y.name == element.name)? calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateActual)==index : false).length)
        }
       // }
      });

    
  
    projectsExportList.push(project)
  })
 
 
  return projectsExportList
}

/////////////////


const exportClickWithFM =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
   
 
  const projectMilestonesForCalc = returnProjectMilestonesForFMCalc()
 
  projectMilestonesForCalc.forEach((element,index) => {
    downloadExcel({
      fileName: "Projects-Export-FM-Calculation",
      sheet: "Projects",
      tablePayload: {
        header: GetHeaderFM(),
        // accept two different data structures
        body: element
      }
    });
  });
  showMessage('Reports downloaded successfully!')
  setActionLoading(false)
}


const GetHeaderFM = () =>{
  const header = ["Type/FW"]
  for (let index = 0; index < 13; index++) {
    if(index==0)
    {
      header.push("LY")
    }else{
    header.push(`M${index}`)
    }
  }
  return header
}

const returnProjectMilestonesForFMCalc = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(x=>{
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==x)]

    
      const project =[]
      projectsList[0].lineOfBusiness.milestones.forEach((element,i)=> {
       // const milestone = x.projectMilestones.find(x=>x.name == element.name)
       // if(milestone){
        project.push([])
        project[i].push(element.name)
        project[i].push(0)
        for (let index = 1; index < 12; index++) {
          project[i].push(projectsList.filter(x=> x.projectMilestones.find(y=>y.name == element.name) ? (x=>calculateFM(x.projectMilestones.find(y=>y.name == element.name).dateActual)==index) : false).length)
        }
      //  }
      });

    
  
    projectsExportList.push(project)
  })
 
 
  return projectsExportList
}

///////////////////



const exportClickWithYTD =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
   
 
  const projectMilestonesForCalc = returnProjectMilestonesForYTDCalc()
 
  projectMilestonesForCalc.forEach((element,index) => {
    downloadExcel({
      fileName: "Projects-Export-YTD-Calculation",
      sheet: "Projects",
      tablePayload: {
        header: GetHeaderYTD(),
        // accept two different data structures
        body: element
      }
    });
  });
  showMessage('Reports downloaded successfully!')
  setActionLoading(false)
}


const GetHeaderYTD = () =>{
  const header = ["Type/FW"]
  for (let index = 0; index < 13; index++) {
    if(index==0)
    {
      header.push("LY")
    }else{
    header.push(`M${index}`)
    }
  }
  return header
}

const returnProjectMilestonesForYTDCalc = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(u=>{
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

    
      const project =[]
      projectsList[0].lineOfBusiness.milestones.forEach((element,i)=> {
       // const milestone = x.projectMilestones.find(x=>x.name == element.name)
        //if(milestone){
          project.push([])
        project[i].push(element.name)
        project[i].push(0)
        let volume =0;
        for (let index = 1; index < 12; index++) {
          volume += projectsList.filter(x=> x.projectMilestones.find(y=>y.name == element.name)? calculateFM(x.projectMilestones.find(y=>y.name == element.name).dateActual==index) : false).length
          project[i].push(volume)
        }
       // }
      });

    
  
    projectsExportList.push(project)
  })
 
 
  return projectsExportList
}

/////////////////////////////////////



const exportClickWithProjectsCycleTimePercentile =  () => {

  const header = GetHeaderProjectsCycleTimePercentile()
  const body = GetBodyProjectsCycleTimePercentile()

  body.forEach(element => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Projects-Export-Projects-CycleTime-Percentile",
        sheet: "Projects",
        tablePayload: {
          header: header,
          body: element
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  });

 
}

const GetHeaderProjectsCycleTimePercentile = () =>{
  const header = ["Cycle Time","P25","P50","P75","P90"]
 
  return header
}


const GetBodyProjectsCycleTimePercentile = () =>{
  const body =[]
  const HeaderList = ReturnCycleHeaders()
  const BodyList = calculateCycleTime()

  HeaderList.forEach((element) => {
    element.forEach((x) => {
      body.push([x])
    });
  });

  BodyList.forEach((element,index) => {
    element.forEach((x) => { 
      const cycleTimes = [...x.sort((x,y)=>x-y)]

      let p25index = Math.floor(cycleTimes.length*0.25)
      let p50index = Math.floor(cycleTimes.length*0.5)
      let p75index = Math.floor(cycleTimes.length*0.75)
      let p90index = Math.floor(cycleTimes.length*0.9)
      
      
      body[index].push(cycleTimes[p25index])
      body[index].push(cycleTimes[p50index])
      body[index].push(cycleTimes[p75index])
      body[index].push(cycleTimes[p90index])
    });
  });

  


 

return body
}


///////////////////////////////////////////




const exportClickWithProjectsPlanningDeltaPercentile =  () => {


  const header = GetHeaderProjectsPlanningDeltaPercentile()
  const body = GetBodyProjectsPlanningDeltaPercentile()

  body.forEach(element => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Projects-Export-Projects-PlanningDelta-Percentile",
        sheet: "Projects",
        tablePayload: {
          header: header,
          body: element
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  });

 
}

const GetHeaderProjectsPlanningDeltaPercentile = () =>{
  const header = ["Planning Delta","P25","P50","P75","P90"]
 
  return header
}


const GetBodyProjectsPlanningDeltaPercentile = () =>{
  const body =[]
  const HeaderList = ReturnCycleHeaders()
  const BodyList = calculatePlanningDelta()

  HeaderList.forEach((element) => {
    element.forEach((x) => {
      body.push([x])
    });
  });

  BodyList.forEach((element,index) => {
    element.forEach((x) => { 
      const PlanningDelta = [...x.sort((x,y)=>x-y)]

      let p25index = Math.floor(PlanningDelta.length*0.25)
      let p50index = Math.floor(PlanningDelta.length*0.5)
      let p75index = Math.floor(PlanningDelta.length*0.75)
      let p90index = Math.floor(PlanningDelta.length*0.9)
      
      
      body[index].push(PlanningDelta[p25index])
      body[index].push(PlanningDelta[p50index])
      body[index].push(PlanningDelta[p75index])
      body[index].push(PlanningDelta[p90index])
    });
  });

  


 

return body
}


///////////////////////////////////////////




const exportClickWithProjectsBacklogPercentile =  () => {

  const header = GetHeaderProjectsBacklogPercentile()
  const body = GetBodyProjectsBacklogPercentile()

  body.forEach(element => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Projects-Export-Projects-Backlog-Percentile",
        sheet: "Projects",
        tablePayload: {
          header: header,
          body: element
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  });

 
}

const GetHeaderProjectsBacklogPercentile = () =>{
  const header = ["Aging","P25","P50","P75","P90"]
 
  return header
}


const GetBodyProjectsBacklogPercentile = () =>{
  const body =[]
  const HeaderList = ReturnBacklogHeaders()
  const BodyList = calculateBacklog()

  HeaderList.forEach((element) => {
    element.forEach((x) => {
      body.push([x])
    });
  });

  BodyList.forEach((element,index) => {
    element.forEach((x) => { 
      const Backlog = [...x.sort((x,y)=>x-y)]

      let p25index = Math.floor(Backlog.length*0.25)
      let p50index = Math.floor(Backlog.length*0.5)
      let p75index = Math.floor(Backlog.length*0.75)
      let p90index = Math.floor(Backlog.length*0.9)
      
      
      body[index].push(Backlog[p25index])
      body[index].push(Backlog[p50index])
      body[index].push(Backlog[p75index])
      body[index].push(Backlog[p90index])
    });
  });

  


 

return body
}



///////////////////////////////////////////




const calculatePlanningDelta = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(u=>{
    const lobProjects = [];
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

    projectsList.forEach(x => {
      const project =[]
      
     
 
      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone && milestone.dateActual){
          project.push( subtractTwoDates(milestone.dateScheduled,milestone.dateActual))
        }else{
          project.push("")
        }
      });
    
      lobProjects.push(project)
    });
    projectsExportList.push(lobProjects)
  })
 
 
  return projectsExportList
}



const calculateCycleTime = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(u=>{
    const lobProjects = [];
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

    projectsList.forEach(x => {
      const project =[]
      
     
 


      x.lineOfBusiness.milestones.forEach((element,index) => {
        if(index ==0){
          const milestone = x.projectMilestones.find(x=>x.name == element.name)
          const contractDate = x.opportunity.contractSignatureDate
          if(milestone && milestone.dateActual){
            project.push( subtractTwoDates(contractDate,milestone.dateActual))
          }else{
            project.push("")
          }
        }
        else if(index < x.lineOfBusiness.milestones.length-1){
        const milestone1 = x.projectMilestones.find(x=>x.name == element.name)
        const milestone2 = x.projectMilestones.find(x=>x.name == x.lineOfBusiness.milestones[index+1].name)
        if(milestone1 && milestone2 && milestone1.dateActual && milestone2.dateActual){
          project.push( subtractTwoDates(milestone1.dateActual,milestone2.dateActual))
        }else{
          project.push("")
        }
      }
      });

     



    

      lobProjects.push(project)
    });
    projectsExportList.push(lobProjects)
  })
 
 
  return projectsExportList
}



const calculateBacklog = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(u=>{
    const lobProjects = [];
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

    projectsList.forEach(x => {
      const project =[]
      
     
 
      x.lineOfBusiness.milestones.forEach(element => {
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone && !milestone.dateActual){
          project.push( subtractTwoDates(Date.now,milestone.dateScheduled))
        }else{
          project.push("")
        }
      });

     



    

      lobProjects.push(project)
    });
    projectsExportList.push(lobProjects)
  })
 
 
  return projectsExportList
}

const ReturnBacklogHeaders = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(u=>{
    const lobProjects = [];
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

    projectsList.forEach(x => {
      const project =[]
      
     
 


      x.lineOfBusiness.milestones.forEach((element,index) => {
        if(index ==0){
          project.push(`Not started`)
        }
        else if(index < x.lineOfBusiness.milestones.length-1){
          project.push(`${element.name}`)
      }
      });

      lobProjects.push(project)
    });
    projectsExportList.push(lobProjects)
  })
 
 
  return projectsExportList
}

const ReturnCycleHeaders = () =>{
  const lobs = projects.map(x=>x.lineOfBusiness.id)
  const uniqueLobs = [...new Set(lobs)];

  const projectsExportList = [];
  
  uniqueLobs.forEach(u=>{
    const lobProjects = [];
    let projectsList = [...projects.filter(y=>y.lineOfBusiness.id==u)]

    projectsList.forEach(x => {
      const project =[]
      
     
 


      x.lineOfBusiness.milestones.forEach((element,index) => {
        if(index ==0){
          project.push(`Contract to ${x.lineOfBusiness.milestones[index+1].name}`)
        }
        else if(index < x.lineOfBusiness.milestones.length-1){
          project.push(`${element.name} to ${x.lineOfBusiness.milestones[index+1].name}`)
      }
      });

      lobProjects.push(project)
    });
    projectsExportList.push(lobProjects)
  })
 
 
  return projectsExportList
}

////////////////////////



const calculateFW = (date) =>{
  var currentDate = new Date(date);
  var startDate = new Date(currentDate.getFullYear(), 0, 1);
  var days = Math.floor((currentDate - startDate) /
      (24 * 60 * 60 * 1000));
        
  var weekNumber = Math.ceil(days / 7);

  // Display the calculated result       
  return weekNumber
}

const calculateFM = (date) =>{
  var currentDate = new Date(date);
  return currentDate.getMonth()
}
 


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
          <>
           <Col className="gutter-row" span={3}> 
       


       <Button  onClick={exportAll}   disabled={actionLoading} type="primary" >Operation engine</Button>
       
       </Col>
        
          <Col className="gutter-row" span={3}> 
       


<Button  onClick={exportClickWithCalc}   disabled={actionLoading} type="primary" >Basic calculation</Button>

</Col>

<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithFW}   disabled={actionLoading} type="primary" >Fiscal week</Button>

</Col>

<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithFM}   disabled={actionLoading} type="primary" >Fiscal month</Button>

</Col>


<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithYTD}   disabled={actionLoading} type="primary" >Year To Date</Button>

</Col>

<Col className="gutter-row" span={3}> 

<Button  onClick={exportClickWithProjectsCycleTimePercentile}   disabled={actionLoading} type="primary" >Cycle time percentile</Button>

</Col> 

<Col className="gutter-row" span={3}> 

<Button  onClick={exportClickWithProjectsPlanningDeltaPercentile}   disabled={actionLoading} type="primary" >Planning delta Aging percentile</Button>

</Col> 


<Col className="gutter-row" span={3}> 

<Button  onClick={exportClickWithProjectsBacklogPercentile}   disabled={actionLoading} type="primary" >Backlog Aging percentile</Button>

</Col> 

<Col className="gutter-row" span={3}> 

<Button  onClick={exportClickWithProjectScheduleCountFW}   disabled={actionLoading} type="primary" >Scheduled Count</Button>

</Col> 


      
</>):null}
          
          
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


export default OperationCalculations