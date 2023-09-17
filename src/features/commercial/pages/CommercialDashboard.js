import {useRef, useState, useEffect, React} from 'react'
import { useGetCompaniesMutation,useGetOpportunitiesMutation,useSaveOpportunityMutation,useDeleteOpportunityMutation,useExportOpportunitiesMutation,useUpdateOpportunityMutation,useSaveClientMutation } from "../slices/opportunityApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Text,Col, Row,Button,message,Descriptions, Form , Input, Select, Table,Popover,Cascader,DatePicker } from 'antd';
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
import axios from "axios";
import ColumnGroup from 'antd/lib/table/ColumnGroup';
import { Chart as ChartJS, ArcElement, Tooltip,LinearScale,BarElement,CategoryScale,Legend, PointElement, LineElement } from 'chart.js';
import { Pie,Bar,Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend,CategoryScale,LinearScale,BarElement,PointElement,LineElement);











function CommercialDashboard() {



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

const [trendProposalData, setTrendProposalData] = useState({
  labels:trendLabels,
  datasets: [
    {
      label: 'Proposals',
      data: [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      yAxisID: 'y',
    }
  ],
})



const [trendContractData, setTrendContractData] = useState({
  labels:trendLabels,
  datasets: [
    {
      label: 'Contracts',
      data: [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
      borderColor: 'rgba(255, 206, 86, 1)',
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      yAxisID: 'y',
    }
  ],
})


const [trendLeadData, setTrendLeadData] = useState({
  labels:trendLabels,
  datasets: [
    {
      label: 'Leads',
      data: [1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y',
    }
  ],
})


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
  
  const labels = ['New', 'Funnel', 'Proposed', 'Approved', 'Won', 'Lost'];
  var barColors = ["red", "green","blue","orange","brown","yellow"];

  const [barData, setBarData] = useState({
    labels,
    datasets: [
      {
       label:"Funnel",
        data: [0,0,0,0,0,0],
        backgroundColor: barColors,
      }
    ],
  })
  
  


  const chartData = {
    labels: ['Referral','Direct', 'Facebook', 'Website' ],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const { RangePicker } = DatePicker;

  const { Option } = Select;

  const roles = useSelector(selectCurrentUserRoles);
  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }




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
  const [isOpen, setIsOpen] = useState(false)
  const [toCurrency, setToCurrency] = useState("EGP")

  const [showDashboard, setShowDashboard] = useState(false)



const [getOpportunities , { isLoading }] = useGetOpportunitiesMutation();
const [opportunities, setOpportunities] = useState([])
const [getCompanies] = useGetCompaniesMutation();
const [companiesOptions, setCompaniesOptions] = useState([])
const [companies, setCompanies] = useState([])


const [percentileList, setPercentileList] = useState([
  {label:"P25", value:0},
  {label:"P50", value:1},
  {label:"P75", value:2},
  {label:"P90", value:3},
])


const [searchLineOfBusinessIds, setSearchLineOfBusinessIds] = useState([])
const [searchDateFrom, setSearchDateFrom] = useState("")
const [searchDateTo, setSearchDateTo] = useState("")
const [searchStatus, setSearchStatus] = useState(-1)


const [week, setWeek] = useState(22)
const [month, setMonth] = useState(5)
const [year, setYear] = useState(2022)

const [percentile, setPercentile] = useState(2)
const [currency, setCurrency] = useState(0)
const [companyLob, setCompanyLob] = useState('TBC - Egypt')
const [companyLobAll, setCompanyLobAll] = useState(['TBC - Egypt'])

const [numberOfLeadsFW, setNumberOfLeadsFW] = useState(2)
const [numberOfLeadsFM, setNumberOfLeadsFM] = useState(5)
const [numberOfLeadsYTD, setNumberOfLeadsYTD] = useState(10)

const [numberOfProposalsFW, setNumberOfProposalsFW] = useState(4)
const [numberOfProposalsFM, setNumberOfProposalsFM] = useState(0)
const [numberOfProposalsYTD, setNumberOfProposalsYTD] = useState(7)


const [numberOfContractsFW, setNumberOfContractsFW] = useState(12)
const [numberOfContractsFM, setNumberOfContractsFM] = useState(1)
const [numberOfContractsYTD, setNumberOfContractsYTD] = useState(0)


const [projectPrecent, setProjectPrecent] = useState(80)
const [retainerPercent, setRetainerPrecent] = useState(20)

const [weeklyTrendLeads, setWeeklyTrendLeads] = useState([1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4])
const [weeklyTrendProposals, setWeeklyTrendLProposals] = useState([1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4])
const [weeklyTrendContracts, setWeeklyTrendContracts] = useState([1,2,3,2,0,5,7,9,2,4,4,4,2,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,1,2,3,2,0,5,7,9,2,4,1,2,3,2,0,5,7,9,2,4,2,4])

const [leadToProposalPercentile, setLeadToProposalPercentile] = useState(10.25)
const [proposalToContractPercentile, setProposalToContractPercentile] = useState(42.75)

const [leadToProposalPercentileProject, setLeadToProposalPercentileProject] = useState(4.5)
const [proposalToContractPercentileProject, setProposalToContractPercentileProject] = useState(20)

const [leadToProposalPercentileRetainer, setLeadToProposalPercentileRetainer] = useState(18.25)
const [proposalToContractPercentileRetainer, setProposalToContractPercentileRetainer] = useState(40)

const [projectChannels, setProjectChannels] = useState(chartData)

const [projectFunnel, setProjectFunnel] = useState([5,8,6,3,4,2])



const [numberOfLeads, setNumberOfLeads] = useState(8)
const [numberOfQualified, setNumberOfQualified] = useState(9)
const [numberOfProposed, setNumberOfProposed] = useState(6)
const [numberOfApproved, setNumberOfApproved] = useState(4)
const [numberOfWon, setNumberOfWon] = useState(3)
const [numberOfLost, setNumberOfLost] = useState(2)

const [conversionPercent, setConversionPercent] = useState(20)
const [winLossPercent, setWinLossPercent] = useState(33)

const [avgWon, setAvgWon] = useState(30)
const [avgApproved, setAvgApproved] = useState('-')
const [avgDiscountApproved, setAvgDiscountApproved] = useState(25)
const [avgDiscountWon, setAvgDiscountWon] = useState(20)

const [numberOfContracts, setNumberOfContracts] = useState(9)
const [proposedValue, setProposedValue] = useState(8207)
const [discountRate, setDiscountRate] = useState(34)
const [contractedValue, setContractedValue] = useState(5308)

const [runRate, setRunRate] = useState(471)
const [runWay, setRunWay] = useState(11)

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
}

const handleChangeSearchDates = (dates, datesString) => {
  setSearchDateFrom(datesString[0])
  setSearchDateTo(datesString[1])
 // console.log(datesString[0])
 // console.log(datesString[1])
  //loadOpportunties(searchStatus,pagination.current,pagination.pageSize,searchLineOfBusinessIds,datesString[0],datesString[1])
  }

  const handleChangeCurrency =   (value) => setCurrency(value)



const handleSearchStatus = (args) => {
  //console.log(args)
  setSearchStatus(args)
  //loadOpportunties(args,pagination.current,pagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
}

const fixedTestRates = [
  {from:"EGP",
   to:"EGP",
   rate:1
  },
  {from:"USD",
   to:"EGP",
   rate:31
  },
  {from:"EUR",
   to:"EGP",
   rate:33
  },
  {from:"GBP",
   to:"EGP",
   rate:39
  },
  {from:"AED",
   to:"EGP",
   rate:8.5
  },
  {from:"SAR",
   to:"EGP",
   rate:8
  },
]


const convertCurrency = (amount, from, to) =>{
  const toCurrency = mapCurrency(to)
  const fromCurrency = mapCurrency(from)

  const fromRate = fixedTestRates.find(x=>x.from==fromCurrency)
  const toRate = fixedTestRates.find(x=>x.from==toCurrency)
  
  if(fromRate && toRate){
    var toEGP = 0
    if(fromCurrency!="EGP"){
    toEGP = amount*fromRate.rate
    }else{
      toEGP=amount
    }
    return toEGP/toRate.rate
  }
  else 
  {
    return 0
  }

  
}




const mapCurrency = (currency) =>{
  switch (currency) {
    case 0:
      return "EGP"
      
    case 1:
      return "USD"
      
    case 2:
      return "EUR"
      
      case 3:
        return "GBP"
       
        case 4:
         return "AED"
        
          case 5:
            return "SAR"
           
    default:
      return "EGP";
  }
}







const loadOpportunties = async (status,page,pageSize,lineOfBusinessesIds,fromDate,toDate) =>{

  var opportuntiesArray = await getOpportunities({ status, page, pageSize,lineOfBusinessesIds,fromDate:fromDate!=""? fromDate:null,toDate:toDate!=""?toDate:null}).unwrap()
  var total = opportuntiesArray.totalCount

  console.log(opportuntiesArray)

  setOpportunities(opportuntiesArray.opportunities)

  reSetPagingInfo(page,pageSize,total)

  return opportuntiesArray;
  
}

const reSetPagingInfo = (page,pageSize,total)=>{
  const paginationObject = {...pagination}
  paginationObject.current =page
  paginationObject.pageSize =pageSize
  paginationObject.total =total

  setPagination(paginationObject);
}






useEffect( () =>{ 
  async function fetchMyAPI() {
  
    var companiesArray = await getCompanies({}).unwrap()
    setCompanies(companiesArray)
   
    transformLineOfBusinesses(companiesArray)
  // loadOpportunties(-1, 1, pagination.pageSize,[],"","")

  
    
  }

  setBarData({
    labels,
    datasets: [
      {
       label:"Funnel",
        data: projectFunnel,
        backgroundColor: barColors,
      }
    ],
  })

  setTrendLeadData({
    labels:trendLabels,
    datasets: [
      {
        label: 'Leads',
        data: weeklyTrendLeads,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
      }
    ],
  })

  setTrendProposalData({
    labels:trendLabels,
    datasets: [
      {
        label: 'Proposals',
        data: weeklyTrendProposals,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y',
      }
    ],
  })

  setTrendContractData({
    labels:trendLabels,
    datasets: [
      {
        label: 'Contracts',
        data: weeklyTrendContracts,
        borderColor: 'rgba(255, 206, 86, 1)',
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
        yAxisID: 'y',
      }
    ],
  })

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
        element.forEach((item, index) => {
          if(index==0){
            company  = companies.find(x=>x.id==element[0])
            companyNames.push( `${company.name} - `)
          }
          else
          //if(index!=0)
          {
            if(i==0){
            setCompanyLob(`${company.name} - ${company.lineOfBusinesses.find(x=>x.id==item).name}`)
            console.log(`${company.name} - ${company.lineOfBusinesses.find(x=>x.id==item).name}`)
            }
            
            companyNames[i] += `${company.lineOfBusinesses.find(x=>x.id==item).name},`
            console.log(companyNames)
            lobIds.push(item)
          }   
        });
      }
      
    });
  setCompanyLobAll(companyNames)
  console.log(companyNames)
  setSearchLineOfBusinessIds(lobIds)
 // loadOpportunties(searchStatus,1, pagination.pageSize,lobIds,searchDateFrom,searchDateTo)
  }else{
    setSearchLineOfBusinessIds([])
    setCompanyLobAll(['TBC - Egypt'])
    setCompanyLob('TBC - Egypt')
   // loadOpportunties(searchStatus,1, pagination.pageSize,[],searchDateFrom,searchDateTo)
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



const subtractTwoDates = (date1,date2) =>{
  var currentDate1 = new Date(date1).getTime()
  var currentDate2 = new Date(date2).getTime()
  var Difference_In_Time = currentDate2  - currentDate1 ;
      
    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return Difference_In_Days
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








const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

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

const currentYear = () =>{
  var currentDate = new Date(Date.now);
  return currentDate.getFullYear()
}


const generateDashboard = async () => {

  var opps = await loadOpportunties(searchStatus,1,pagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)

  calculateCommercialNumbers(opps.opportunities)

  calculateProjectRetainerPercent(opps.opportunities)

  calculateWeeklyTrendLeads(opps.opportunities)
  calculateWeeklyTrendProposals(opps.opportunities)
  calculateWeeklyTrendContracts(opps.opportunities)

  calculateCommercialIntensity(opps.opportunities)
  calculateCommercialIntensityProjects(opps.opportunities)
  calculateCommercialIntensityRetainers(opps.opportunities)

  calculateProjectsChannels(opps.opportunities)

  calculateRetainerNumbers(opps.opportunities)

  calculateProjectsFunnel(opps.opportunities)

  setShowDashboard(true)

}

const toggleDashboard = () =>{
  setShowDashboard(!showDashboard)
}

const calculateRetainerNumbers = (opps) => {

  // let AllProposed = opps.filter(x=>x.scope==1).reduce(function(total, y) { return total+ (y.firstProposalValue ? convertCurrency(y.firstProposalValue,y.firstProposalValueCurrency,toCurrency) : 0)  }, 0)
  // let WonTotalContracted = opps.filter(x=>x.status==4 && x.scope==1).reduce(function(total,y) { return total+ (y.firstProposalValue ? convertCurrency(y.firstProposalValue,y.firstProposalValueCurrency,toCurrency) : 0)  }, 0)

  let proposedValue = Math.round(opps.filter(x=>x.scope==1).reduce(function(total, y) { return total+ (y.firstProposalValue ? convertCurrency(y.firstProposalValue,y.firstProposalValueCurrency,currency) : 0)  }, 0)/1000)

  let WonTotalContracted = Math.round(opps.filter(x=>x.status==4  && x.scope==1).reduce(function(total,y) { return total+ (y.finalContractValue ? convertCurrency(y.finalContractValue,y.finalContractValueCurrency,currency) : 0)  }, 0)/1000)

  let discountRate = Math.round(100-((WonTotalContracted/proposedValue)*100))

  proposedValue = proposedValue.toLocaleString('en-US', {
    style: 'currency',
    currency: mapCurrency(currency),
  })

  WonTotalContracted = WonTotalContracted.toLocaleString('en-US', {
    style: 'currency',
    currency: mapCurrency(currency),
  })

  setNumberOfContracts(opps.filter(x=>x.scope==1).length)
  setProposedValue(proposedValue)
  setDiscountRate(discountRate)
  setContractedValue(WonTotalContracted)

  setRunRate(Math.round(opps.filter(x=>x.status==4  && x.scope==1).reduce(function(total,y) { return total+ (y.finalContractValue & y.retainerValidatity ? convertCurrency(y.finalContractValue,y.finalContractValueCurrency,currency)/y.retainerValidatity : 0) }, 0)/1000).toLocaleString('en-US', {
    style: 'currency',
    currency: mapCurrency(currency),
  }))
  setRunWay(Math.round(opps.filter(x=>x.status==4  && x.scope==1).reduce(function(total,y) { return total+ (y.retainerValidatity ? y.retainerValidatity : 0)  }, 0) / opps.filter(x=>x.status==4  && x.scope==1).length))


}

const calculateProjectsFunnel = (opps) =>{
  setProjectFunnel([
    opps.filter(x=>x.status==0 &&x.scope==0).length,
    opps.filter(x=>x.status==1 &&x.scope==0).length,
    opps.filter(x=>x.status==2 &&x.scope==0).length,
    opps.filter(x=>x.status==3 &&x.scope==0).length,
    opps.filter(x=>x.status==4 &&x.scope==0).length,
    opps.filter(x=>x.status==5 &&x.scope==0).length,
  ])

  setBarData({
    labels,
    datasets: [
      {
       label:"Funnel",
        data: [
          opps.filter(x=>x.status==0 &&x.scope==0).length,
          opps.filter(x=>x.status==1 &&x.scope==0).length,
          opps.filter(x=>x.status==2 &&x.scope==0).length,
          opps.filter(x=>x.status==3 &&x.scope==0).length,
          opps.filter(x=>x.status==4 &&x.scope==0).length,
          opps.filter(x=>x.status==5 &&x.scope==0).length,
        ],
        backgroundColor: barColors,
      }
    ],
  })

  setNumberOfLeads(opps.filter(x=>x.scope==0).length)
  setNumberOfQualified(opps.filter(x=>x.status>=1 &&x.scope==0).length)
  setNumberOfProposed(opps.filter(x=>x.status>=2 &&x.scope==0).length)
  setNumberOfApproved(opps.filter(x=>x.status==3 &&x.scope==0).length)
  setNumberOfWon(opps.filter(x=>x.status==4 &&x.scope==0).length)
  setNumberOfLost(opps.filter(x=>x.status==5 &&x.scope==0).length)

  setConversionPercent(Math.round((opps.filter(x=>x.status==4 &&x.scope==0).length/opps.filter(x=>x.scope==0).length)*100))
  setWinLossPercent(Math.round((opps.filter(x=>x.status==4 &&x.scope==0).length/opps.filter(x=>x.status==5 &&x.scope==0).length)*100))


  //let AllProposed = opps.filter(x=>x.scope==0).reduce(function(total, y) { return total + (y.firstProposalValue ? convertCurrency(y.firstProposalValue,y.firstProposalValueCurrency,currency) : 0)  }, 0)
 
  let WonTotalProposal =  Math.round(opps.filter(x=>x.status==4 && x.scope==0).reduce(function(total,y) { return total + (y.firstProposalValue ? convertCurrency(y.firstProposalValue,y.firstProposalValueCurrency,currency) : 0)  }, 0))
  let WonTotalContracted = Math.round(opps.filter(x=>x.status==4 && x.scope==0).reduce(function(total, y) { return total +  (y.finalContractValue ? convertCurrency(y.finalContractValue,y.finalContractValueCurrency,currency) : 0)  },0))

  let approvedTotalProposal =  Math.round(opps.filter(x=>x.status==3 && x.scope==0).reduce(function(total,y) { return total + (y.firstProposalValue ? convertCurrency(y.firstProposalValue,y.firstProposalValueCurrency,currency) : 0 )  }, 0))
  let approvedTotalContracted = Math.round(opps.filter(x=>x.status==3 && x.scope==0).reduce(function(total, y) { return total +  (y.currentProposalValue ? convertCurrency(y.currentProposalValue,y.currentProposalValueCurrency,currency) : 0)  },0))


  let avgDiscountWon = Math.round(100-((WonTotalContracted/WonTotalProposal)*100))

  let avgDiscountApproved = Math.round(100-((approvedTotalContracted/approvedTotalProposal)*100))

  WonTotalProposal = WonTotalProposal.toLocaleString('en-US', {
    style: 'currency',
    currency: mapCurrency(currency),
  })

  

  let avgWon =  Math.round(WonTotalContracted/1000).toLocaleString('en-US', {
    style: 'currency',
    currency: mapCurrency(currency),
  })

  let avgApproved =  Math.round(approvedTotalContracted/1000).toLocaleString('en-US', {
    style: 'currency',
    currency: mapCurrency(currency),
  })

  WonTotalContracted = WonTotalContracted.toLocaleString('en-US', {
    style: 'currency',
    currency: mapCurrency(currency),
  })

  


  setAvgWon(avgWon)
  setAvgApproved(avgApproved)

  // setAvgDiscountApproved(Math.round((WonTotalContracted/WonTotalProposal)*100))
  // setAvgDiscountWon(Math.round((AllProposed/WonTotalContracted)*100))

  setAvgDiscountApproved(avgDiscountApproved)
  setAvgDiscountWon(avgDiscountWon)


}

const calculateProjectsChannels = (opps) =>{
  setProjectChannels({
    labels: ['Referral','Direct', 'Facebook', 'Website' ],
    datasets: [
      {
        label: '# of Votes',
        data: [
          opps.filter(x=>x.source==0).length,
          opps.filter(x=>x.source==1).length,
          opps.filter(x=>x.source==2).length,
          opps.filter(x=>x.source==3).length,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  })

 
}



const calculateCommercialNumbers = (opps) =>{
  console.log(opps)
  setNumberOfLeadsFW(opps.filter(x=>calculateFW(x.firstContactDate)==week && calculateFY(x.firstContactDate) == year).length)
  setNumberOfLeadsFM(opps.filter(x=>calculateFM(x.firstContactDate)==month && calculateFY(x.firstContactDate) == year).length)
  let numberOfLeadsYTD = 0;
  for (let index = 1; index <= week; index++) 
    numberOfLeadsYTD += opps.filter(x=>calculateFW(x.firstContactDate)==index && calculateFY(x.firstContactDate) == year).length
  setNumberOfLeadsYTD(numberOfLeadsYTD)

  setNumberOfProposalsFW(opps.filter(x=>calculateFW(x.firstProposalDate)==week && calculateFY(x.firstProposalDate) == year).length)
  setNumberOfProposalsFM(opps.filter(x=>calculateFM(x.firstProposalDate)==month && calculateFY(x.firstProposalDate) == year).length)
  let numberOfProposalsYTD = 0;
  for (let index = 1; index <= week; index++) 
    numberOfProposalsYTD += opps.filter(x=>calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate) == year).length
  setNumberOfProposalsYTD(numberOfProposalsYTD)


  setNumberOfContractsFW(opps.filter(x=>calculateFW(x.contractSignatureDate)==week && calculateFY(x.contractSignatureDate) == year).length)
  setNumberOfContractsFM(opps.filter(x=>calculateFM(x.contractSignatureDate)==month && calculateFY(x.contractSignatureDate) == year).length )
  let numberOfContractsYTD = 0;
  for (let index = 1; index <= week; index++) 
    numberOfContractsYTD += opps.filter(x=>calculateFW(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate) == year).length
  setNumberOfContractsYTD(numberOfContractsYTD)
  
}


const calculateProjectRetainerPercent = (opps) =>{
  setProjectPrecent(Math.round((opps.filter(x=>x.scope==0).length/opps.length)*100))
  setRetainerPrecent(Math.round((opps.filter(x=>x.scope==1).length/opps.length)*100))
}


const calculateWeeklyTrendLeads = (opps) =>{
  const NewLeadVolume =[]
 // NewLeadVolume.push(0)
 NewLeadVolume.push(opps.filter( x=>x.firstContactDate?calculateFY(x.firstContactDate) < year : false).length)
  for (let index = 1; index < 53; index++) {
   NewLeadVolume.push( opps.filter(x=>x.firstContactDate?calculateFW(x.firstContactDate)==index && calculateFY(x.firstContactDate) == year :false).length)
 }
 NewLeadVolume.push(opps.filter(x=>x.firstContactDate?calculateFY(x.firstContactDate) > year:false).length)
 setWeeklyTrendLeads(NewLeadVolume)

 setTrendLeadData({
  labels:trendLabels,
  datasets: [
    {
      label: 'Leads',
      data: NewLeadVolume,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y',
    }
  ],
})


}

const calculateWeeklyTrendProposals = (opps) =>{
 const NewProposalVolume =[]
 //NewProposalVolume.push(0)
 NewProposalVolume.push(opps.filter(x=>x.firstProposalDate?calculateFY(x.firstProposalDate) < year:false).length)
 for (let index = 1; index < 53; index++) {
   NewProposalVolume.push(opps.filter(x=>x.firstProposalDate?calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate) == year:false).length)
}
NewProposalVolume.push(opps.filter(x=>x.firstProposalDate?calculateFY(x.firstProposalDate) > year:false).length)
setWeeklyTrendLProposals(NewProposalVolume)

setTrendProposalData({
  labels:trendLabels,
  datasets: [
    {
      label: 'Proposals',
      data: NewProposalVolume,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      yAxisID: 'y',
    }
  ],
})

}

const calculateWeeklyTrendContracts = (opps) =>{
 const NewContractVolume =[]
 //NewContractVolume.push(0)
 NewContractVolume.push(opps.filter(x=>x.contractSignatureDate?calculateFY(x.contractSignatureDate) < year:false).length)
 for (let index = 1; index < 53; index++) {
   NewContractVolume.push(opps.filter(x=>x.contractSignatureDate?calculateFW(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate) == year:false).length)
}
NewContractVolume.push(opps.filter(x=>x.contractSignatureDate?calculateFY(x.contractSignatureDate) > year:false).length)
setWeeklyTrendContracts(NewContractVolume)


setTrendContractData({
  labels:trendLabels,
  datasets: [
    {
      label: 'Contracts',
      data: NewContractVolume,
      borderColor: 'rgba(255, 206, 86, 1)',
    backgroundColor: 'rgba(255, 206, 86, 0.2)',
      yAxisID: 'y',
    }
  ],
})
}


const calculateCommercialIntensity = (opps)=>{
  const LeadsCCT1 =[]
  
  const CCT1 = opps.filter(x=>x.firstProposalDate? true :false).map(x=>(subtractTwoDates(x.firstContactDate,x.firstProposalDate))).sort((x,y)=>x-y)
  
  let p25indexCCT1 = Math.floor(CCT1.length*0.25)
  let p50indexCCT1 = Math.floor(CCT1.length*0.5)
  let p75indexCCT1 = Math.floor(CCT1.length*0.75)
  let p90indexCCT1 = Math.floor(CCT1.length*0.9)
  
  
  LeadsCCT1.push(CCT1[p25indexCCT1])
  LeadsCCT1.push(CCT1[p50indexCCT1])
  LeadsCCT1.push(CCT1[p75indexCCT1])
  LeadsCCT1.push(CCT1[p90indexCCT1])

  const LeadsCCT2 =[]
    
  const CCT2 = opps.filter(x=>x.contractSignatureDate? true :false).map(x=>(subtractTwoDates(x.firstProposalDate,x.contractSignatureDate))).sort((x,y)=>x-y)
  
  let p25indexCCT2 = Math.floor(CCT2.length*0.25)
  let p50indexCCT2 = Math.floor(CCT2.length*0.5)
  let p75indexCCT2 = Math.floor(CCT2.length*0.75)
  let p90indexCCT2 = Math.floor(CCT2.length*0.9)
  
  
  LeadsCCT2.push(CCT2[p25indexCCT2])
  LeadsCCT2.push(CCT2[p50indexCCT2])
  LeadsCCT2.push(CCT2[p75indexCCT2])
  LeadsCCT2.push(CCT2[p90indexCCT2])
  
  setLeadToProposalPercentile(LeadsCCT1[percentile])
  setProposalToContractPercentile(LeadsCCT2[percentile])
  
  
}


const calculateCommercialIntensityProjects = (opps)=>{
  const LeadsCCT1 =[]
  
  const CCT1 = opps.filter(x=>x.scope==0 && (x.firstProposalDate? true: false)).map(x=>(subtractTwoDates(x.firstContactDate,x.firstProposalDate))).sort((x,y)=>x-y)
  
  let p25indexCCT1 = Math.floor(CCT1.length*0.25)
  let p50indexCCT1 = Math.floor(CCT1.length*0.5)
  let p75indexCCT1 = Math.floor(CCT1.length*0.75)
  let p90indexCCT1 = Math.floor(CCT1.length*0.9)
  
  
  LeadsCCT1.push(CCT1[p25indexCCT1])
  LeadsCCT1.push(CCT1[p50indexCCT1])
  LeadsCCT1.push(CCT1[p75indexCCT1])
  LeadsCCT1.push(CCT1[p90indexCCT1])

  const LeadsCCT2 =[]
    
  const CCT2 = opps.filter(x=>x.scope==0 && (x.contractSignatureDate? true: false)).map(x=>(subtractTwoDates(x.firstProposalDate,x.contractSignatureDate))).sort((x,y)=>x-y)
  
  let p25indexCCT2 = Math.floor(CCT2.length*0.25)
  let p50indexCCT2 = Math.floor(CCT2.length*0.5)
  let p75indexCCT2 = Math.floor(CCT2.length*0.75)
  let p90indexCCT2 = Math.floor(CCT2.length*0.9)
  
  
  LeadsCCT2.push(CCT2[p25indexCCT2])
  LeadsCCT2.push(CCT2[p50indexCCT2])
  LeadsCCT2.push(CCT2[p75indexCCT2])
  LeadsCCT2.push(CCT2[p90indexCCT2])
  
  setLeadToProposalPercentileProject(LeadsCCT1[percentile])
  setProposalToContractPercentileProject(LeadsCCT2[percentile])
  
  
}


const calculateCommercialIntensityRetainers = (opps)=>{
  const LeadsCCT1 =[]
  
  const CCT1 = opps.filter(x=>x.scope==1 && (x.firstProposalDate? true: false)).map(x=>(subtractTwoDates(x.firstContactDate,x.firstProposalDate))).sort((x,y)=>x-y)
  
  let p25indexCCT1 = Math.floor(CCT1.length*0.25)
  let p50indexCCT1 = Math.floor(CCT1.length*0.5)
  let p75indexCCT1 = Math.floor(CCT1.length*0.75)
  let p90indexCCT1 = Math.floor(CCT1.length*0.9)
  
  
  LeadsCCT1.push(CCT1[p25indexCCT1])
  LeadsCCT1.push(CCT1[p50indexCCT1])
  LeadsCCT1.push(CCT1[p75indexCCT1])
  LeadsCCT1.push(CCT1[p90indexCCT1])

  const LeadsCCT2 =[]
    
  const CCT2 = opps.filter(x=>x.scope==1 && (x.contractSignatureDate  ? true: false)).map(x=>(subtractTwoDates(x.firstProposalDate,x.contractSignatureDate))).sort((x,y)=>x-y)
  
  let p25indexCCT2 = Math.floor(CCT2.length*0.25)
  let p50indexCCT2 = Math.floor(CCT2.length*0.5)
  let p75indexCCT2 = Math.floor(CCT2.length*0.75)
  let p90indexCCT2 = Math.floor(CCT2.length*0.9)
  
  
  LeadsCCT2.push(CCT2[p25indexCCT2])
  LeadsCCT2.push(CCT2[p50indexCCT2])
  LeadsCCT2.push(CCT2[p75indexCCT2])
  LeadsCCT2.push(CCT2[p90indexCCT2])
  
  setLeadToProposalPercentileRetainer(LeadsCCT1[percentile])
  setProposalToContractPercentileRetainer(LeadsCCT2[percentile])
  
  
}



 


  return (
    <>
    <Descriptions title="Commercial dashboard"></Descriptions>
 
 
         
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

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Currency"
         name="currency"
         rules={[
           {
             required: true,
             message: 'Please choose currency!',
           },
         ]}
       >
           <Select
          options={Currencies}
          name="currency"
          onChange={handleChangeCurrency}
          placeholder="Select Contract value currency"
         value={currency}
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
      options= {OpportunityStatuses}
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
         <Col className="gutter-row" span={12}>
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
          {`${mapCurrency(currency)}`}
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
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#96C2F2', textAlign:'center'}} >
           New leads<br/>
            {numberOfLeadsFW}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#79B2F1', textAlign:'center'}} >
           New Proposals<br/>
           {numberOfProposalsFW}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#4898F2', textAlign:'center'}} >
           New Contracts<br/>
           {numberOfContractsFW}
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
          {`month ${month}`}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#96C2F2', textAlign:'center'}} >
           New leads<br/>
            {numberOfLeadsFM}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#79B2F1', textAlign:'center'}} >
           New Proposals<br/>
           {numberOfProposalsFM}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#4898F2', textAlign:'center'}} >
           New Contracts<br/>
           {numberOfContractsFM}
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
          {`${year} - to date`}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#96C2F2', textAlign:'center'}} >
           New leads<br/>
            {numberOfLeadsYTD}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#79B2F1', textAlign:'center'}} >
           New Proposals<br/>
           {numberOfProposalsYTD}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,backgroundColor:'#4898F2', textAlign:'center'}} >
           New Contracts<br/>
           {numberOfContractsYTD}
          </Col>
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:62}}
       >
         <Col className="gutter-row" span={6} style={{paddingTop:10,fontWeight: 'bold',border:'.5px solid'}}>
          Projects
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,fontWeight: 'bold',border:'.5px solid'}} >
           {`${projectPrecent}%`}
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,fontWeight: 'bold',border:'.5px solid'}} >
           Retainers
          </Col>
          <Col className="gutter-row" span={6} style={{paddingTop:10,fontWeight: 'bold',border:'.5px solid'}} >
          {`${retainerPercent}%`}
          </Col>
         
         
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
        
       name="ProjectFunnel"
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
          Projects Funnel
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
         <Col className="gutter-row" span={4} style={{fontWeight: 'bold',border:'.5px solid', textAlign:'center'}}>
          Leads<br/>{numberOfLeads} 
          </Col>
          <Col className="gutter-row" span={4} style={{fontWeight: 'bold',border:'.5px solid', textAlign:'center'}} >
           Qualified<br/>{numberOfQualified}
          </Col>
          <Col className="gutter-row" span={4} style={{fontWeight: 'bold',border:'.5px solid', textAlign:'center'}} >
           Proposed<br/>{numberOfProposed}
          </Col>
          <Col className="gutter-row" span={4} style={{fontWeight: 'bold',border:'.5px solid', textAlign:'center'}} >
          Approved<br/>{numberOfApproved}
          </Col>

          <Col className="gutter-row" span={4} style={{fontWeight: 'bold',border:'.5px solid', textAlign:'center'}} >
          Won<br/>{numberOfWon}
          </Col>

          <Col className="gutter-row" span={4} style={{fontWeight: 'bold',border:'.5px solid', textAlign:'center'}} >
          lost<br/>{numberOfLost}
          </Col>
         
         
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
         <Col className="gutter-row" span={6} style={{paddingTop:35, fontWeight: 'bold',border:'.5px solid'}}>
          Weekly trend leads
          </Col>
          <Col className="gutter-row" span={18} style={{fontWeight: 'bold',border:'.5px solid'}} >
          <Line options={trendOptions} data={trendLeadData} style={{maxHeight:130}}  />
          </Col>
         
         
         
          </Row>


          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:140}}
       >
         <Col className="gutter-row" span={6} style={{paddingTop:35, fontWeight: 'bold',border:'.5px solid'}}>
          Weekly trend proposals
          </Col>
          <Col className="gutter-row" span={18} style={{fontWeight: 'bold',border:'.5px solid'}} >
          <Line options={trendOptions} data={trendProposalData} style={{maxHeight:130}}  />
          </Col>
         
         
         
          </Row>


          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:140}}
       >
         <Col className="gutter-row" span={6} style={{paddingTop:35, fontWeight: 'bold',border:'.5px solid'}}>
          Weekly trend contracts
          </Col>
          <Col className="gutter-row" span={18} style={{fontWeight: 'bold',border:'.5px solid'}} >
          <Line options={trendOptions} data={trendContractData} style={{maxHeight:130}}  />
          </Col>
         
         
         
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
          Projects details
          </Col>

        
          
          </Row>


          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Conversion
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
           {`${conversionPercent}%`}
          </Col>
          
         
         
          </Row>


          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Approved
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
           {avgApproved}
          </Col>
          
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Won
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
           {avgWon}
          </Col>
          
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Win / Loss
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
           {`${winLossPercent}%`}
          </Col>
          
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
          Avg discount approved
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
           {`${avgDiscountApproved}%`}
          </Col>
          
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Avg discount won
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
           {`${avgDiscountWon}%`}
          </Col>
          
         
         
          </Row>

          <div
           className="site-layout-background"
           style={{
             padding: 5,
             minHeight: 20,
           }}
         >
         </div>
      

      <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:5,backgroundColor:'lightGray', fontWeight: 'bold', fontSize:'16px'}}
       >
         <Col className="gutter-row" span={12}>
          Commercial Intensity - Projects
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
         <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid'}}>
          {`${mapPercentile(percentile)} <= ${leadToProposalPercentileProject}days`} {/* {'P75 <= 13.5days'} */}
          </Col>
          <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid'}} >
         {`${mapPercentile(percentile)} <= ${proposalToContractPercentileProject}days`}  {/* {'P75<= 7days'} */}
          </Col>
         
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{  fontSize:'16px',minHeight:35, textAlign:'center'}}
       >
         <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid',backgroundColor:'gray'}}>
          <span style={{color:'white'}}>Lead to Proposal</span>
          </Col>
          <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid',backgroundColor:'darkBlue'}} >
          <span style={{color:'white'}}>Proposal to Contract</span>
          </Col>
         
         
         
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
         <Col className="gutter-row" span={12}>
          Commercial Intensity 
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
         <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid'}}>
         {`${mapPercentile(percentile)} <= ${leadToProposalPercentile}days`}  {/* {'P75 <= 13.5days'} */}
          </Col>
          <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid'}} >
          {`${mapPercentile(percentile)} <= ${proposalToContractPercentile}days`}   {/* {'P75<= 7days'} */}
          </Col>
         
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{  fontSize:'16px',minHeight:35, textAlign:'center'}}
       >
         <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid',backgroundColor:'gray'}}>
          <span style={{color:'white'}}>Lead to Proposal</span>
          </Col>
          <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid',backgroundColor:'darkBlue'}} >
          <span style={{color:'white'}}>Proposal to Contract</span>
          </Col>
         
         
         
          </Row>


          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:310}}
       >
         <Col className="gutter-row" span={24} style={{fontWeight: 'bold',border:'.5px solid'}}>
          Channels
          <div style={{paddingLeft:130,maxHeight:275}}>
          <Pie data={projectChannels}  />
          </div>
          </Col>
          
         
         
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
        
       name="RetainerDetails"
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
          Retainer details
          </Col>

        
          
          </Row>


          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         # of Contracts
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
           {numberOfContracts}
          </Col>
          
         
         
          </Row>


          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Proposed Value
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
         {proposedValue}
          </Col>
          
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Discount Rate
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
          {`${discountRate}%`}
          </Col>
          
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Contracted Value
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
          {contractedValue}
          </Col>
          
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Monthly Run Rate
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
          {runRate}
          </Col>
          
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:10, fontSize:'16px',minHeight:40}}
       >
         <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}}>
         Runway		
          </Col>
          <Col className="gutter-row" span={12} style={{fontWeight: 'bold',border:'.5px solid'}} >
           {runWay} months
          </Col>
          
         
         
          </Row>

          <div
           className="site-layout-background"
           style={{
             padding: 5,
             minHeight: 20,
           }}
         >
         </div>
      

      <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{paddingTop:5,backgroundColor:'lightGray', fontWeight: 'bold', fontSize:'16px'}}
       >
         <Col className="gutter-row" span={12}>
          Commercial Intensity - Retainer
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
         <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid'}}>
         {`${mapPercentile(percentile)} <= ${leadToProposalPercentileRetainer}days`}  {/* {'P75 <= 13.5days'} */}
          </Col>
          <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid'}} >
          {`${mapPercentile(percentile)} <= ${proposalToContractPercentileRetainer}days`}  {/* {'P75<= 7days'} */}
          </Col>
         
         
         
          </Row>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}
       style={{  fontSize:'16px',minHeight:35, textAlign:'center'}}
       >
         <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid',backgroundColor:'gray'}}>
          <span style={{color:'white'}}>Lead to Proposal</span>
          </Col>
          <Col className="gutter-row" span={12} style={{paddingTop:5,fontWeight: 'bold',border:'.5px solid',backgroundColor:'darkBlue'}} >
          <span style={{color:'white'}}>Proposal to Contract</span>
          </Col>
         
         
         
          </Row>



          </Form>
          </div>
          </div>
           </Col>



           
           </Row>





           
           </Form>
           </>):null}
       
          


          
   
 
 </>
  )
}


export default CommercialDashboard