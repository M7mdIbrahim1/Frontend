
import {useRef, useState, useEffect, React} from 'react'
import { useGetCompaniesMutation,useGetProjectsMutation,useDeleteProjectMutation,useExportProjectsMutation } from "../slices/projectApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm,Cascader,DatePicker,Popover } from 'antd';
import {
  StepForwardOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import {ProjectStatuses,ClientStatuses,ProjectScopes, Currencies} from "../../Common/lookups";
import moment from 'moment';
import { downloadExcel } from "react-export-table-to-excel";
import { Chart as ChartJS, ArcElement, Tooltip,LinearScale,BarElement,CategoryScale,Legend, PointElement, LineElement } from 'chart.js';
import { Pie,Bar,Line } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend,CategoryScale,LinearScale,BarElement,PointElement,LineElement);


function OperationDashboard() {
  const { RangePicker } = DatePicker;
  const { Option } = Select;
  const roles = useSelector(selectCurrentUserRoles);
  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }



 const trendOptions = {
  responsive: true,
  interaction: {
    mode: 'index' ,
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: 'Chart.js Line Chart - Multi Axis',
    },
  },
  scales: {
    y: {
      type: 'linear' ,
      display: true,
      position: 'left',
    },
  },
};
const [trendLabels, setTrendLabels] = useState(['LY','01', '02', '03', '04', '05', '06', '07','08','09','10',
'11', '12', '13', '14', '15', '16', '17','18','19','20',
'21', '22', '23', '24', '25', '26', '27','28','29','30',
'31', '32', '33', '34', '35', '36', '37','38','39','40',
'41', '42', '43', '44', '45', '46', '47','48','49','50','51','52','NY'])
const [trendData, setTrendData] = useState([{
  label:'KickOff',
  labels:trendLabels,
  datasets: [
    {
      label: 'KickOff',
      data: [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      yAxisID: 'y',
    }
  ],
}])




  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' ,
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
  };
  
  const labels = ['Kickoff', 'First presentation','Customer Approval', 'Phase2', 'On Hold', 'Completion'];
  var barColors = ["red", "green","blue","orange","brown","yellow"];
  const [barData, setBarData] = useState({
    labels,
    datasets: [
      {
       label:"Backlog",
        data: [0,0,0,0,0,0,0],
        backgroundColor: barColors,
      }
    ],
  })
  
  const fwColors = ['#85FAC0','#27C174','#0f9451']
 
  const percentileColors = ['gray','darkBlue']
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 1000,
    showSizeChanger: true,
    pageSizeOptions: [1,5,10,20,50,100,500,1000],
    position: 'bottomCenter'
  });
 
  const [form] = Form.useForm();
  const key = 'updatable';

  const [actionLoading, setActionLoading] = useState(false)
  const [invalidMilestones, setInvalidMilestones] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

const [getProjects , { isLoading }] = useGetProjectsMutation();
const [projects, setProjects] = useState([])
const [milestones, setMilestones] = useState([{name:'KickOff'},
{name:'First Presentation'},
{name:'Customer Approval'},
{name:'Phase 2'},
{name:'OnHold'},
{name:'Completion'},
])
const [milestonesDiff, setMilestonesDiff] = useState([{name:'KickOff'},
{name:'First Presentation'},
{name:'Customer Approval'},
{name:'Phase 2'},
{name:'OnHold'},
{name:'Completion'},
])
const [getCompanies] = useGetCompaniesMutation();
const [companiesOptions, setCompaniesOptions] = useState([])
const [companies, setCompanies] = useState([])




const [searchLineOfBusinessIds, setSearchLineOfBusinessIds] = useState([])
const [searchDateFrom, setSearchDateFrom] = useState("")
const [searchDateTo, setSearchDateTo] = useState("")
const [searchStatus, setSearchStatus] = useState(-1)
const [percentileList, setPercentileList] = useState([
  {label:"P25", value:0},
  {label:"P50", value:1},
  {label:"P75", value:2},
  {label:"P90", value:3},
])
const [week, setWeek] = useState(22)
const [month, setMonth] = useState(5)
const [year, setYear] = useState(2022)
const [dashboardDate, setDashboardDate] = useState(new Date())
const [percentile, setPercentile] = useState(2)
const [companyLob, setCompanyLob] = useState('TBC - Egypt')
const [companyLobAll, setCompanyLobAll] = useState(['TBC - Egypt'])

const [numberOfProjectsMilestonesFW, setNumberOfProjectsMilestonesFW] = useState([2,5,10,12,3,4])
const [numberOfProjectsMilestonesFM, setNumberOfProjectsMilestonesFM] = useState([2,5,10,12,3,4])
const [numberOfProjectsMilestonesYTD, setNumberOfProjectsMilestonesYTD] = useState([2,5,10,12,3,4])
const [weeklyTrendProjectMilestones, setWeeklyTrendProjectMilestones] = useState([
  [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
  [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
  [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
  [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
  [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
  [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
])
const [percentileProjectMilestones, setPercentileProjectMilestones] = useState([12,18,50,120,7,44])
const [percentileProjectMilestonesDifference, setPercentileProjectMilestonesDifference] = useState([12,18,50,120,7,44])
const [backlogAgingPercentile, setBacklogAgingPercentile] = useState([12,18,50,120,7,44])
const [scheduledCountFWPlusOne, setScheduledCountFWPlusOne] = useState([1,3,5,3,6,7])
const [scheduledCountFWPlusTwo, setScheduledCountFWPlusTwo] = useState([1,3,5,3,6,7])
const [scheduledCountFWPlusThree, setScheduledCountFWPlusThree] = useState([1,3,5,3,6,7])
const [scheduledCountFWPlusFour, setScheduledCountFWPlusFour] = useState([1,3,5,3,6,7])
const [backlogChart, setBacklogChart] = useState([15,20,5,3,12,7])




const handleChangePercentile =   (value) => {
  setPercentile(value)}

const mapPercentile = (percentile) =>{
  switch (percentile) {
    case 0:
      return "P25"
      
    case 1:
      return "P50"
      
    case 2:
      return "P75"
      
      case 3:
        return "P90"
           
    default:
      return "P75";
  }
}

const handleChangeInputDate =   (date, dateString) => {
  setWeek(calculateFW(dateString))
  setMonth(calculateFM(dateString))
  setYear(calculateFY(dateString))
  setDashboardDate(dateString)
  console.log(dateString)
}

const handleChangeSearchDates = (dates, datesString) => {
  setSearchDateFrom(datesString[0])
  setSearchDateTo(datesString[1])
  //loadProjects(searchStatus,pagination.current,pagination.pageSize,searchLineOfBusinessIds,datesString[0],datesString[1])
  }


const handleSearchStatus = (args) => {
  console.log(args)
  setSearchStatus(args)
  //loadProjects(args,pagination.current,pagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
}






const loadProjects = async (status,page,pageSize,lineOfBusinessesIds,fromDate,toDate) =>{
  var projectsArray = await getProjects({ status, page, pageSize,lineOfBusinessesIds,fromDate:fromDate!=""? fromDate:null,toDate:toDate!=""?toDate:null}).unwrap()
  var total = projectsArray.totalCount
  console.log(projectsArray.projects)
  setProjects(projectsArray.projects)
  reSetPagingInfo(page,pageSize,total)
  return projectsArray;
  
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
   //loadProjects(-1, 1, pagination.pageSize,[],"","")
    
  }

  setBarData({
    labels:milestones.map(x=>x.name),
    datasets: [
      {
       label:"Backlog",
        data: backlogChart,
        backgroundColor: barColors,
      }
    ],
  })


  setTrendData(milestones.map((x,i)=>({
    label:x.name,
    labels:trendLabels,
    datasets: [
      {
        label: x.name,
        data: weeklyTrendProjectMilestones[i],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
      }
    ],
  })))
  fetchMyAPI()
}, [])



const handleChangeSearchLineOfBusiness =  async (value) => {
  console.log(value)
  if (value !=null && value.length>0){
  
    var lobIds = []
    var companyNames = []
    var company  = ''
    value.forEach((element,i) => {
      
      
     
      if(element.length==1){
        console.log(companies.find(x=>x.id==element[0]))
        validateMilstones(companies.find(x=>x.id==element[0]).lineOfBusinesses.map(x=>x.milestones.map(y=>y.name)))
        companies.find(x=>x.id==element[0]).lineOfBusinesses.map(x=>x.id).forEach( item =>{
          lobIds.push(item)
        })
        company  = companies.find(x=>x.id==element[0])
        var lobNames = company.lineOfBusinesses.map(x=>x.name)
        companyNames.push( `${company.name} - ${lobNames.reduce(function(y, z) { return  `${y}, ${z}` }, '')}`)
        if(i==0){
        setCompanyLob(`${company.name} - ${lobNames[0]}`)
        }
      }else{
        const milestonesLocal = []
        element.forEach((item, index) => {
          if(index==0){
            company  = companies.find(x=>x.id==element[0])
            companyNames.push( `${company.name} - `)
          }
          else
          //if(index!=0)
          {
            milestonesLocal.push(company.lineOfBusinesses.find(x=>x.id==item).milestones.map(y=>y.name))
            if(i==0){
            setCompanyLob(`${company.name} - ${company.lineOfBusinesses.find(x=>x.id==item).name}`)
            console.log(`${company.name} - ${company.lineOfBusinesses.find(x=>x.id==item).name}`)
            }
            
            companyNames[i] += `${company.lineOfBusinesses.find(x=>x.id==item).name},`
            console.log(companyNames)
            lobIds.push(item)
          }   
        });
        validateMilstones(milestonesLocal)
      }
      
    });
    
  setCompanyLobAll(companyNames)
  console.log(companyNames)
  setSearchLineOfBusinessIds(lobIds)
  setMilestones(company.lineOfBusinesses[0].milestones)
  const miles = [{name:'Contract'}]
  company.lineOfBusinesses[0].milestones.forEach(element => {
    miles.push(element)
  });
  setMilestonesDiff(miles)
 // loadOpportunties(searchStatus,1, pagination.pageSize,lobIds,searchDateFrom,searchDateTo)
  }else{
    setSearchLineOfBusinessIds([])
    setCompanyLobAll(['TBC - Egypt'])
    setCompanyLob('TBC - Egypt')
   // loadOpportunties(searchStatus,1, pagination.pageSize,[],searchDateFrom,searchDateTo)
  }
}
const  validateMilstones = (milestonesLocal) =>{
  if(milestonesLocal.length>1){
  const flatList=[]
  const len = milestonesLocal[0].length
  var invalid = false
  milestonesLocal.forEach(element => {
    if(element.length!=len){
      invalid = true
    }
    if(!invalid){
    element.forEach(item => {
      flatList.push(item)
    });
  }
  });
  if(!invalid){
  flatList.forEach(element => {
    if(!invalid){
    if(flatList.filter(x=>x==element).length != milestonesLocal.length)
    {
      invalid = true
    }
  }
  });
}
setInvalidMilestones(invalid)
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

const subtractTwoDates = (date1,date2) =>{
  var currentDate1 = new Date(date1).getTime()
  var currentDate2 = new Date(date2).getTime()
  var Difference_In_Time = currentDate2  - currentDate1 ;
      
    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    return Difference_In_Days
}




const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
///////////////////////////////////





const calculateFW = (date) =>{
  var currentDate = new Date(date);
  var startDate = new Date(currentDate.getFullYear(), 0, 1);
  var days = Math.floor((currentDate - startDate) /
      (24 * 60 * 60 * 1000));
        
  var weekNumber = Math.ceil(days / 7);
  // Display the calculated result       
  return weekNumber+1
}
const calculateFM = (date) =>{
  var currentDate = new Date(date);
  return currentDate.getMonth()+1
}
const calculateFY = (date) =>{
  var currentDate = new Date(date);
  return currentDate.getFullYear()
}
const generateDashboard = async () => {
  console.log(searchLineOfBusinessIds)
  var projs = await loadProjects(searchStatus,pagination.current,pagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
  setProjects(projs)
  // if(projs.length>0){
  //   setMilestones((projs.filter(x=>x.scope==0))[0].lineOfBusiness.milestones)
  // }
 

  calculateProjectMilestonesFW(projs.projects.filter(x=>x.scope==0))
  calculateProjectMilestonesFM(projs.projects.filter(x=>x.scope==0))
  calculateProjectMilestonesYTD(projs.projects.filter(x=>x.scope==0))
  calculateWeeklyTrendProjectMilestones(projs.projects.filter(x=>x.scope==0))
  calculatePercentileProjectMilestones(projs.projects.filter(x=>x.scope==0))
  calculatePercentileProjectMilestonesDiff(projs.projects.filter(x=>x.scope==0))
  calculateBacklogAgingPercentile(projs.projects.filter(x=>x.scope==0))
  calculateBacklogChart(projs.projects.filter(x=>x.scope==0))
  calculateScheduledCountFW(projs.projects.filter(x=>x.scope==0))
  setShowDashboard(true)
  
}
const toggleDashboard = () =>{
  setShowDashboard(!showDashboard)
}

const calculateBacklogChart = (projs) =>{
  var backlog =[]
  //var backlog =[projs.filter(x=> x.status==0).length]
projs[0].lineOfBusiness.milestones.forEach((element,i)=> {
  if(i< projs[0].lineOfBusiness.milestones.length-1){
  backlog.push(projs.filter(x=> x.projectMilestones.find(y=>y.name == element.name) ? (x.projectMilestones.find(y=>y.name == element.name).status==1) : false).length)
  }
})
backlog.push(projs.filter(x=> x.status==3).length)
backlog.push(projs.filter(x=> x.status==4).length)



setBarData({
  labels:[...milestones.map(x=>x.name),"On hold"],
  datasets: [
    {
     label:"Backlog",
      data: backlog,
      backgroundColor: barColors,
    }
  ],
})
setBacklogChart(backlog)
}
const calculateScheduledCountFW = (projs) =>{
  let scheduledCountFWPlusOne = []
  let scheduledCountFWPlusTwo = []
  let scheduledCountFWPlusThree = []
  let scheduledCountFWPlusFour = []
  var today = new Date();
  projs[0].lineOfBusiness.milestones.forEach((element,i)=> {
    // const milestone = x.projectMilestones.find(x=>x.name == element.name)
    // if(milestone){
     
      scheduledCountFWPlusOne.push(projs.filter(x=>x.projectMilestones.find(y=>y.name == element.name) && x.projectMilestones.find(y=>y.name == element.name).dateActual == null && x.projectMilestones.find(y=>y.name == element.name).dateScheduled>dashboardDate ? calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==week+1 && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==year : false).length)
      scheduledCountFWPlusTwo.push(projs.filter(x=>x.projectMilestones.find(y=>y.name == element.name) && x.projectMilestones.find(y=>y.name == element.name).dateActual == null && x.projectMilestones.find(y=>y.name == element.name).dateScheduled>dashboardDate ? calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==week+2 && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==year : false).length)
      scheduledCountFWPlusThree.push(projs.filter(x=>x.projectMilestones.find(y=>y.name == element.name) && x.projectMilestones.find(y=>y.name == element.name).dateActual == null && x.projectMilestones.find(y=>y.name == element.name).dateScheduled>dashboardDate ? calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==week+3 && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==year : false).length)
      scheduledCountFWPlusFour.push(projs.filter(x=>x.projectMilestones.find(y=>y.name == element.name) && x.projectMilestones.find(y=>y.name == element.name).dateActual == null && x.projectMilestones.find(y=>y.name == element.name).dateScheduled>dashboardDate ? calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==week+4 && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateScheduled)==year : false).length)
     
    // }
   });
   setScheduledCountFWPlusOne(scheduledCountFWPlusOne)
   setScheduledCountFWPlusTwo(scheduledCountFWPlusTwo)
   setScheduledCountFWPlusThree(scheduledCountFWPlusThree)
   setScheduledCountFWPlusFour(scheduledCountFWPlusFour)
}

const calculatePercentileProjectMilestones = (projs) =>{
  const percentileProjectMilestones = []
  
  const BodyList = calculatePlanningDelta(projs)
  projs[0].lineOfBusiness.milestones.forEach((element) => {
   
    percentileProjectMilestones.push([])
  });

  BodyList.forEach((element,index) => {
    
      const PlanningDelta = [...element.sort((x,y)=>x-y)]
      let p25index = Math.floor(PlanningDelta.length*0.25)
      let p50index = Math.floor(PlanningDelta.length*0.5)
      let p75index = Math.floor(PlanningDelta.length*0.75)
      let p90index = Math.floor(PlanningDelta.length*0.9)
      
      
      percentileProjectMilestones[index].push(PlanningDelta[p25index])
      percentileProjectMilestones[index].push(PlanningDelta[p50index])
      percentileProjectMilestones[index].push(PlanningDelta[p75index])
      percentileProjectMilestones[index].push(PlanningDelta[p90index])
    
  });
  var perc = []
  percentileProjectMilestones.forEach(element => {
    perc.push(element[percentile])
  });
  
setPercentileProjectMilestones(perc)
}

const calculatePlanningDelta = (projs) =>{
  
  const lobProjects =[]
  projs[0].lineOfBusiness.milestones.forEach(element => {
    const project =[]
    projs.forEach(x => {
      
 
      
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone && milestone.dateActual){
          project.push( subtractTwoDates(milestone.dateScheduled,milestone.dateActual))
        }
        // else{
        //   project.push("")
        // }
      });
    
      lobProjects.push(project)
      console.log(lobProjects)
      
    });
    
    
  
 
 
  return lobProjects
}


const calculatePercentileProjectMilestonesDiff = (projs) =>{
  
  const BodyList = calculateCycleTime(projs)
  const percentileProjectMilestonesDiff = []

console.log(BodyList)
 // percentileProjectMilestonesDiff.push([])
  projs[0].lineOfBusiness.milestones.forEach((element) => {
   
    percentileProjectMilestonesDiff.push([])
  });

  BodyList.forEach((element,index) => {
    
      const cycleTimes = [...element.sort((x,y)=>x-y)]
      let p25index = Math.floor(cycleTimes.length*0.25)
      let p50index = Math.floor(cycleTimes.length*0.5)
      let p75index = Math.floor(cycleTimes.length*0.75)
      let p90index = Math.floor(cycleTimes.length*0.9)
      
      
      percentileProjectMilestonesDiff[index].push(cycleTimes[p25index])
      percentileProjectMilestonesDiff[index].push(cycleTimes[p50index])
      percentileProjectMilestonesDiff[index].push(cycleTimes[p75index])
      percentileProjectMilestonesDiff[index].push(cycleTimes[p90index])
  });

  var perc = []
  percentileProjectMilestonesDiff.forEach(element => {
    perc.push(element[percentile])
  });
  
 
  setPercentileProjectMilestonesDifference(perc) 
}

const getContractToStart = (projs) =>{
  const project =[]
  const name = projs[0].lineOfBusiness.milestones[0].name
  console.log(name)
    projs.forEach(x => {

        const milestone = x.projectMilestones.find(x=>x.name == name)
        const contractDate = x.contractSignatureDate
        if(milestone && milestone.dateActual){
          project.push( subtractTwoDates(contractDate,milestone.dateActual))
        }
        // else{
        //   project.push("")
        // }
      
    
    });
    return project
  
}

const calculateCycleTime = (projs) =>{
  
  const lobProjects =[]
  const proj = getContractToStart(projs)
  lobProjects.push(proj)
  projs[0].lineOfBusiness.milestones.forEach((element,index) => {
    if(index < projs[0].lineOfBusiness.milestones.length-1){
    const project =[]
   


    projs.forEach(x => {
     
      
       
 

      
        
       
        const milestone1 = x.projectMilestones.find(y=>y.name == element.name)
        var indx= x.projectMilestones.indexOf(milestone1)
        const milestone2 = x.projectMilestones.find(y=>y.name == x.projectMilestones[indx+1].name)
        if(milestone1 && milestone2 && milestone1.dateActual && milestone2.dateActual){
          project.push( subtractTwoDates(milestone1.dateActual,milestone2.dateActual))
        }
        // else{
        //   project.push("")
        // }

      
      });

      lobProjects.push(project)
     
      
     
    }
    
      
    
  })

 
  return lobProjects
}

const calculateBacklogAgingPercentile = (projs) =>{
 
  const BodyList = calculateBacklog(projs)
  const backlogAgingPercentile=[]


  projs[0].lineOfBusiness.milestones.forEach((element) => {
   
    backlogAgingPercentile.push([])
  });


  BodyList.forEach((element,index) => {
      const Backlog = [...element.sort((x,y)=>x-y)]
      let p25index = Math.floor(Backlog.length*0.25)
      let p50index = Math.floor(Backlog.length*0.5)
      let p75index = Math.floor(Backlog.length*0.75)
      let p90index = Math.floor(Backlog.length*0.9)
      
      
      backlogAgingPercentile[index].push(Backlog[p25index])
      backlogAgingPercentile[index].push(Backlog[p50index])
      backlogAgingPercentile[index].push(Backlog[p75index])
      backlogAgingPercentile[index].push(Backlog[p90index])
   
  });
  var perc = []
  backlogAgingPercentile.forEach(element => {
    perc.push(element[percentile])
  });
  
setBacklogAgingPercentile(perc)
}


const calculateBacklog = (projs) =>{
  
const lobProjects=[]
projs[0].lineOfBusiness.milestones.forEach(element => {
  const project =[]
    projs.forEach(x => {
      
      
     
 
      
        const milestone = x.projectMilestones.find(x=>x.name == element.name)
        if(milestone && !milestone.dateActual){
          var today = dashboardDate;

          project.push( Math.round(subtractTwoDates(milestone.dateScheduled,today)))
        }
        // else{
        //   project.push("")
        // }
      });
      lobProjects.push(project)
    });
    console.log(lobProjects)
  return lobProjects
}
const calculateProjectMilestonesFW = (projs) => {
  let projectsMilestonesFW =[]
  
  projs[0].lineOfBusiness.milestones.forEach((element,i)=> {
    // const milestone = x.projectMilestones.find(x=>x.name == element.name)
    // if(milestone){
    
      projectsMilestonesFW.push(projs.filter(x=>x.projectMilestones.find(y=>y.name == element.name)&& x.projectMilestones.find(y=>y.name == element.name).dateActual != null? calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateActual)==week && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateActual)==year : false).length)
     
    // }
   });
   
   setNumberOfProjectsMilestonesFW(projectsMilestonesFW)
}

const calculateProjectMilestonesFM = (projs) => {

  let projectsMilestonesFM =[]
  
  projs[0].lineOfBusiness.milestones.forEach((element,i)=> {
    // const milestone = x.projectMilestones.find(x=>x.name == element.name)
    // if(milestone){
      projectsMilestonesFM.push(projs.filter(x=> x.projectMilestones.find(y=>y.name == element.name) && x.projectMilestones.find(y=>y.name == element.name).dateActual != null? calculateFM(x.projectMilestones.find(y=>y.name == element.name).dateActual)==month && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateActual)==year : false).length)
     
    // }
   });
   
   setNumberOfProjectsMilestonesFM(projectsMilestonesFM)
}

const calculateProjectMilestonesYTD = (projs) => {
  let projectsMilestonesYTD =[]
  projs[0].lineOfBusiness.milestones.forEach((element,i)=> {
    // const milestone = x.projectMilestones.find(x=>x.name == element.name)
    // if(milestone){
    let volume=0
      for (let index = 1; index <= week; index++) {
        volume += projs.filter(x=> x.projectMilestones.find(y=>y.name == element.name)&& x.projectMilestones.find(y=>y.name == element.name).dateActual != null?  calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateActual)==index && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateActual)==year : false).length
      }
      volume+= projs.filter(x=> x.projectMilestones.find(y=>y.name == element.name) && x.projectMilestones.find(y=>y.name == element.name).dateActual != null && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateActual)<year ? true:false).length
      projectsMilestonesYTD.push(volume)
     
    // }
   });
   setNumberOfProjectsMilestonesYTD(projectsMilestonesYTD)
}

const calculateWeeklyTrendProjectMilestones = (projs) => {
  const project =[]
  projs[0].lineOfBusiness.milestones.forEach((element,i)=> {
    // const milestone = x.projectMilestones.find(x=>x.name == element.name)
    // if(milestone){
     project.push([])
     project[i].push(projs.filter(x=>x.projectMilestones.find(y=>y.name == element.name) && x.projectMilestones.find(y=>y.name == element.name).dateActual != null?  calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateActual)<year : false).length)
     for (let index = 1; index < 53; index++) {
       project[i].push(projs.filter(x=>x.projectMilestones.find(y=>y.name == element.name)&& x.projectMilestones.find(y=>y.name == element.name).dateActual != null? calculateFW(x.projectMilestones.find(y=>y.name == element.name).dateActual)==index && calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateActual)==year : false).length)
     }
     project[i].push(projs.filter(x=>x.projectMilestones.find(y=>y.name == element.name)&& x.projectMilestones.find(y=>y.name == element.name).dateActual != null?  calculateFY(x.projectMilestones.find(y=>y.name == element.name).dateActual)>year : false).length)
    // }
   });
   setTrendData(milestones.map((x,i)=>({
    label:x.name,
    labels:trendLabels,
    datasets: [
      {
        label: x.name,
        data: project[i],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
      }
    ],
  })))
   setWeeklyTrendProjectMilestones(project)
}
 

  return (
    <>
    <Descriptions title="Operation dashboard"></Descriptions>
 
 
         
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
       onFinish={generateDashboard}
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
         <Form.Item
          label="Line of business"
          name="searchLineOfBusinessIds"
          rules={[
            {
              required: true,
              message: 'Please select line of business!',
            },
          ]}>
         <Cascader
         name="searchLineOfBusinessIds"
    options={companiesOptions}
    onChange={handleChangeSearchLineOfBusiness}
    placeholder="Select line of business"
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
       <Form.Item
         label="Input date"
         name="inputDate"
         rules={[
           {
             required: true,
             message: 'Please enter input date!',
           },
         ]}
       
       >
          <DatePicker style={{ width: 295 }}  placeholder="Enter input date" onChange={handleChangeInputDate}   />
          </Form.Item>
    
           </Col>
           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Percentile"
         name="percentile"
         rules={[
           {
             required: true,
             message: 'Please choose percentile!',
           },
         ]}
       >
          <Select
      allowClear
      options={percentileList}
      onChange={handleChangePercentile}
      placeholder="Select percentile"
    />
    
          </Form.Item>
    
           </Col>
           
    </Row>
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
         <RangePicker style={{ width: 295 }}  name="searchDates" onChange={handleChangeSearchDates} />
             </Form.Item>
         
           </Col>
           {allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','CommercialManager']) ? (<>
           <Col className="gutter-row" span={3}> 
        

<Button   disabled={actionLoading} type="primary" htmlType="submit">Generate dashboard</Button>
</Col>
<Col className="gutter-row" span={3}> 
        
        <Button  onClick={toggleDashboard}   disabled={actionLoading} type="primary" >{showDashboard? "Hide test dashboard": "Show test dashboard"}</Button>
        
        </Col>


       
</>
):null}
           </Row>
          
          
          
       
       </Form>
  
   
     </div>
     </div>
     <div
           
           style={{
             padding: 10,
             minHeight: 20,
           }}
         >
         </div>
         {showDashboard ? (<>
<Form
        
        name="dashboard"
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
          

          <Col className="gutter-row" span={24}>
          <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 460,
           }}
         >
       <div  style={{paddingLeft:15}}>
       <Form
        
       name="FW"
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
       }}
       style={{paddingTop:10, minHeight:45,backgroundColor:'lightGray', fontWeight: 'bold', fontSize:'16px'}}
       >
         <Col className="gutter-row" span={8}>
          Reporting date
          </Col>
          <Col className="gutter-row" span={5} >
          {`FW${week}`}
          </Col>
          <Col className="gutter-row" span={5}>
          {`M${month}`}
          </Col>
          <Col className="gutter-row" span={5}>
          {`YR${year}`}
          </Col>
          </Row>
         
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, minHeight:45,backgroundColor:'#2383EE', fontWeight: 'bold', fontSize:'16px'}}
       >
         <Col className="gutter-row" span={8}>
         {`${companyLob}`}  
         <Popover content={companyLobAll.map(x=>(<><span>{x}</span><br/></>))} title="Details">
       <Button  type="link" htmlType="button" danger  >
      more
       </Button>
       </Popover>
          </Col>
          <Col className="gutter-row" span={5} ></Col>
          <Col className="gutter-row" span={5} ></Col>
          <Col className="gutter-row" span={2} >
          Projects
          </Col>
         
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:85}}
       >
         <Col className="gutter-row" span={6} style={{fontWeight: 'bold',paddingTop:20,border:'.5px solid'}}>
         {`Fiscal Week ${week}`}
          </Col>
       {milestones.map((x,i)=>( <Col className="gutter-row" span={3} style={{paddingTop:10,backgroundColor: fwColors[i%3], textAlign:'center'}} >
           {x.name}<br/>
            {numberOfProjectsMilestonesFW[i]}
          </Col>))}
              
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:85}}
       >
         <Col className="gutter-row" span={6} style={{fontWeight: 'bold',paddingTop:20,border:'.5px solid'}}>
          {`month ${month}`}
          </Col>
          {milestones.map((x,i)=>( <Col className="gutter-row" span={3} style={{paddingTop:10,backgroundColor:fwColors[i%3], textAlign:'center'}} >
           {x.name}<br/>
            {numberOfProjectsMilestonesFM[i]}
          </Col>))}
          
         
         
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:85}}
       >
         <Col className="gutter-row" span={6} style={{fontWeight: 'bold',paddingTop:20,border:'.5px solid'}}>
          {`${year} - to date`}
          </Col>
          {milestones.map((x,i)=>( <Col className="gutter-row" span={3} style={{paddingTop:10,backgroundColor:fwColors[i%3], textAlign:'center'}} >
           {x.name}<br/>
            {numberOfProjectsMilestonesYTD[i]}
          </Col>))}
          
         
         
          </Row>
          

          </Form>
          </div>
          </div>
           </Col>
           </Row>

           <div
           
           style={{
             padding: 10,
             minHeight: 20,
           }}
         >
         </div>

           <Row gutter={{
          xs: 8,
          sm: 16,
          md: 24,
          lg: 32,
        }}>
          <Col className="gutter-row" span={24}>
          <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 460,
           }}
         >
       <div  style={{paddingLeft:15}}>
       <Form
        
       name="ChannelChart"
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
       }}
       style={{paddingTop:5,backgroundColor:'lightGray', fontWeight: 'bold', fontSize:'16px'}}
       >
         <Col className="gutter-row" span={24}>
         Operational Effeciency
          </Col>
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{ fontSize:'16px',minHeight:35, textAlign:'center'}}
       >
        {milestonesDiff.map((x,i)=>(i<percentileProjectMilestonesDifference.length?
          <Col className="gutter-row" span={4} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid'}}>
          {`${mapPercentile(percentile)} <= ${percentileProjectMilestonesDifference[i]}days`}  {/* {'P75 <= 13.5days'} */}
           </Col> : null)
        )}
         
          
         
         
         
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{  fontSize:'16px',minHeight:35, textAlign:'center'}}
       >
         {milestonesDiff.map((x,i)=>(
          i<milestonesDiff.length-1?(
         <Col className="gutter-row" span={4} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid',backgroundColor:percentileColors[i%2]}}>
         <span style={{color:'white'}}>{x.name} to {milestonesDiff[i+1].name}</span>
         </Col>) :null)
        )}
         
         
         
         
          </Row>
      <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:5,backgroundColor:'lightGray', fontWeight: 'bold', fontSize:'16px'}}
       >
         <Col className="gutter-row" span={24}>
         Planning Accuracy
          </Col>
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{ fontSize:'16px',minHeight:35, textAlign:'center'}}
       >
        {milestones.map((x,i)=>(
          <Col className="gutter-row" span={4} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid'}}>
          {`${mapPercentile(percentile)} <= ${percentileProjectMilestones[i]}days`}  {/* {'P75 <= 13.5days'} */}
           </Col>
        ))}
         
          
         
         
         
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{  fontSize:'16px',minHeight:35, textAlign:'center'}}
       >
         {milestones.map((x,i)=>(
         <Col className="gutter-row" span={4} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid',backgroundColor:percentileColors[i%2]}}>
         <span style={{color:'white'}}>{x.name}</span>
         </Col>
        ))}
         
         
         
         
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:85}}
       >
         <Col className="gutter-row" span={4} style={{fontWeight: 'bold',backgroundColor: '#85FAC0',paddingTop:20,border:'.5px solid'}}>
         Scheduled action<br/>
         FW{week+1}
         <br/>
         FW{week+2}
          </Col>
       {milestones.map((x,i)=>( <Col className="gutter-row" span={4} style={{paddingTop:10, textAlign:'center'}} >
           {x.name}<br/>
           {scheduledCountFWPlusOne[i]}<br/>
           {scheduledCountFWPlusTwo[i]}
          </Col>))}
          
              
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:85}}
       >
        
          <Col className="gutter-row" span={4} style={{fontWeight: 'bold',backgroundColor: '#85FAC0',paddingTop:20,border:'.5px solid'}}>
         Scheduled action<br/>
         FW{week+3}
         <br/>
         FW{week+4}
          </Col>
       {milestones.map((x,i)=>( <Col className="gutter-row" span={4} style={{paddingTop:10, textAlign:'center'}} >
           {x.name}<br/>
           {scheduledCountFWPlusThree[i]}<br/>
           {scheduledCountFWPlusFour[i]}
          </Col>))}
              
          </Row>
        
         
          </Form>
          </div>
          </div>
           </Col>
           

           
           </Row>
           <div
           
           style={{
             padding: 10,
             minHeight: 20,
           }}
         >
         </div>


           
         <Row gutter={{
          xs: 8,
          sm: 16,
          md: 24,
          lg: 32,
        }}>
          <Col className="gutter-row" span={12}>
          <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 460,
           }}
         >
       <div  style={{paddingLeft:15}}>
       <Form
        
       name="WeeklyTrends"
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
       }}
       style={{ fontSize:'16px',minHeight:130}}
       >
        {trendData.map((x)=>(<>
          <Col className="gutter-row" span={6} style={{paddingTop:35, fontWeight: 'bold',border:'.5px solid'}}>
          Weekly trend {x.label}
          </Col>
          <Col className="gutter-row" span={18} style={{fontWeight: 'bold',border:'.5px solid'}} >
          <Line options={trendOptions} data={x} style={{maxHeight:130}}  />
          </Col>
          </>
        ))}
         
         
         
         
          </Row>
          </Form>
          </div>
          </div>
           </Col>

           <Col className="gutter-row" span={12}>
          <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 460,
           }}
         >
       <div  style={{paddingLeft:15}}>
       <Form
        
       name="ProjectDetails"
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
       }}
       style={{paddingTop:10, minHeight:45,backgroundColor:'#40bf70', fontWeight: 'bold', fontSize:'16px'}}
       >
         <Col className="gutter-row" span={8}>
          Backlog
          </Col>
        
          
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:300}}
       >
         <Col className="gutter-row" span={24} style={{fontWeight: 'bold',border:'.5px solid'}}>
         <Bar options={options} data={barData} />
          
          </Col>
          
         
         
          </Row>
          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:30}}
       >
        {milestones.map((x,i)=>(
          <Col className="gutter-row" span={5} style={{fontWeight: 'bold',border:'.5px solid', textAlign:'center'}}>
          {x.name}: {backlogAgingPercentile[i]} days
          </Col>
        ))}
         
         
         
         
          </Row>


          </Form>
          </div>
          </div>
           </Col>
           </Row>
           <div
           
           style={{
             padding: 10,
             minHeight: 20,
           }}
         >
         </div>

           




           
           </Form>
           </>):null}
 </>
  )
}

export default OperationDashboard
