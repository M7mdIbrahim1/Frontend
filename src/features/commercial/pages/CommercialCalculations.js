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
import axios from "axios";





function CommercialCalculations() {




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
  const [toCurrency, setToCurrency] = useState("EGP")


const [year, setYear] = useState(2022)

  

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

  const insertEmptyLine = () => {
    return ["",""]
  }

  const exportAll = () => {
    
  
    const FWHeader = GetHeaderFW()
    const FMHeader = GetHeaderFM()
    const YTDHeader = GetHeaderYTD()
  
    const FWVolumeBody = GetBodyFWVolume()
    const FMVolumeBody = GetBodyFMVolume()
    const YTDVolumeBody = GetBodyYTDVolume()

    const FWAmountBody = GetBodyFWAmount()
    const FMAmountBody = GetBodyFMAmount()
    const YTDAmountBody = GetBodyYTDAmount()

    const FWBacklogVolumeBody = GetBodyFWBacklogVolume()
    const FWBacklogAmountBody = GetBodyFWBacklogAmount()

    const YTDClientSegProjectVolumeHeader =  GetHeaderYTDClientSegProjectVolume()
    const YTDClientSegProjectVolumeBody = GetBodyYTDClientSegProjectVolume()

    const HeaderYTDClientSegProjectAmount = GetHeaderYTDClientSegProjectAmount()
    const BodyYTDClientSegProjectAmount = GetBodyYTDClientSegProjectAmount()

    const HeaderOpportunitiesFunnel =  GetHeaderOpportunitiesFunnel()
    const BodyOpportunitiesFunnel = GetBodyOpportunitiesFunnel()

    const HeaderOpportunitiesCCTPercentileAll = GetHeaderOpportunitiesCCTPercentileAll()
    const BodyOpportunitiesCCTPercentileAll = GetBodyOpportunitiesCCTPercentileAll()

    const HeaderOpportunitiesCCTPercentile = GetHeaderOpportunitiesCCTPercentile()
    const BodyOpportunitiesCCTPercentile = GetBodyOpportunitiesCCTPercentile()


    const HeaderYTDClientSegProjectAmountRetainer= GetHeaderYTDClientSegProjectAmountRetainer()
    const BodyYTDClientSegProjectAmountRetainer= GetBodyYTDClientSegProjectAmountRetainer()

    const HeaderOpportunitiesFunnelRetainer = GetHeaderOpportunitiesFunnelRetainer()
    const BodyOpportunitiesFunnelRetainer= GetBodyOpportunitiesFunnelRetainer()

    const HeaderOpportunitiesCCTPercentileRetainer= GetHeaderOpportunitiesCCTPercentileRetainer()
    const BodyOpportunitiesCCTPercentileRetainer = GetBodyOpportunitiesCCTPercentileRetainer()

       

    
    
      const excel = []

      excel.push(FWHeader)
     
  
      FWVolumeBody.forEach(element => {
        excel.push(element)
      });
  
      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push(FMHeader)
  
      FMVolumeBody.forEach(element => {
        excel.push(element)
      });
  
      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push(YTDHeader)
  
      YTDVolumeBody.forEach(element => {
        excel.push(element)
      });

      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())

      excel.push("Backlog")
      excel.push(FWHeader)
  
      FWBacklogVolumeBody.forEach(element => {
        excel.push(element)
      });
  
  
      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())

      excel.push("Amount")

      excel.push(FWHeader)
  
      FWAmountBody.forEach(element => {
        excel.push(element)
      });
  
      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push(FMHeader)
  
      FMAmountBody.forEach(element => {
        excel.push(element)
      });
  
      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push(YTDHeader)
  
      YTDAmountBody.forEach(element => {
        excel.push(element)
      });
  
      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("Backlog")
      excel.push(FWHeader)
  
      FWBacklogAmountBody.forEach(element => {
        excel.push(element)
      });


      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("YTD client segmentation volume")
      excel.push(YTDClientSegProjectVolumeHeader)
  
      YTDClientSegProjectVolumeBody.forEach(element => {
        excel.push(element)
      });

      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("YTD client segmentation amount")
      excel.push(HeaderYTDClientSegProjectAmount)
  
      BodyYTDClientSegProjectAmount.forEach(element => {
        excel.push(element)
      });

      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("Opprotunities projects Funnel")
      excel.push(HeaderOpportunitiesFunnel)
  
      BodyOpportunitiesFunnel.forEach(element => {
        excel.push(element)
      });

      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("Opprotunities CCT Percentile All")
      excel.push(HeaderOpportunitiesCCTPercentile)
  
      BodyOpportunitiesCCTPercentileAll.forEach(element => {
        excel.push(element)
      });

      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("Opprotunities CCT Percentile Projects")
      excel.push(HeaderOpportunitiesCCTPercentile)
  
      BodyOpportunitiesCCTPercentile.forEach(element => {
        excel.push(element)
      });

      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("YTD Client Seg Project Amount Retainer")
      excel.push(HeaderYTDClientSegProjectAmountRetainer)
  
      BodyYTDClientSegProjectAmountRetainer.forEach(element => {
        excel.push(element)
      });


      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("Opportunities Funnel Retainer")
      excel.push(HeaderOpportunitiesFunnelRetainer)
  
      BodyOpportunitiesFunnelRetainer.forEach(element => {
        excel.push(element)
      });

      excel.push(insertEmptyLine())
      excel.push(insertEmptyLine())
  
      excel.push("Opportunities CCT Percentile Retainer")
      excel.push(HeaderOpportunitiesCCTPercentileRetainer)
  
      BodyOpportunitiesCCTPercentileRetainer.forEach(element => {
        excel.push(element)
      });


      

      

      

      


  
  
  
    setActionLoading(true)
    showLoadingMessage('loading...')
   
   
      downloadExcel({
        fileName: "Opportunities-Export-All-Calculation",
        sheet: "Opportunities",
        tablePayload: {
          header: ["Volume"],
          // accept two different data structures
          body: excel
        }
      });
   
    showMessage('Reports downloaded successfully!')
    setActionLoading(false)
  
  }


////////////////////////////////////////////////////////



const exportClickWithOpportunitiesCCTPercentile =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-Opportunities-CCT-Percentile",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderOpportunitiesCCTPercentile(),
        body: GetBodyOpportunitiesCCTPercentile()
      }
    });
    showMessage('Report downloaded successfully!')
    setActionLoading(false)
}

const GetHeaderOpportunitiesCCTPercentile = () =>{
  const header = ["Projects","P25","P50","P75","P90"]
 
  return header
}

const GetHeaderOpportunitiesCCTPercentileAll = () =>{
  const header = ["All","P25","P50","P75","P90"]
 
  return header
}


const GetBodyOpportunitiesCCTPercentile = () =>{
const body =[GetCCT1(),GetCCT2()]
return body
}

const GetBodyOpportunitiesCCTPercentileAll = () =>{
  const body =[GetCCT1All(),GetCCT2All()]
  return body
  }



const GetCCT1All = () =>{
  const Leads =["CCT1 (Lead to Proposal)"]
  
  const CCT1 = [...opportunities.filter(x=>x.firstProposalDate? true: false).map(x=>(subtractTwoDates(x.firstContactDate,x.firstProposalDate))).sort((x,y)=>x-y)]
  
  let p25index = Math.floor(CCT1.length*0.25)
  let p50index = Math.floor(CCT1.length*0.5)
  let p75index = Math.floor(CCT1.length*0.75)
  let p90index = Math.floor(CCT1.length*0.9)
  
  
  Leads.push(CCT1[p25index])
  Leads.push(CCT1[p50index])
  Leads.push(CCT1[p75index])
  Leads.push(CCT1[p90index])
  
  return Leads
  }
  
  const GetCCT2All = () =>{
    const Leads =["CCT2 (Proposal to Lead)"]
    
    const CCT2 = [...opportunities.filter(x=> x.contractSignatureDate? true: false).map(x=>(subtractTwoDates(x.firstProposalDate,x.contractSignatureDate))).sort((x,y)=>x-y)]
    
    let p25index = Math.floor(CCT2.length*0.25)
    let p50index = Math.floor(CCT2.length*0.5)
    let p75index = Math.floor(CCT2.length*0.75)
    let p90index = Math.floor(CCT2.length*0.9)
    
    
    Leads.push(CCT2[p25index])
    Leads.push(CCT2[p50index])
    Leads.push(CCT2[p75index])
    Leads.push(CCT2[p90index])
    
    return Leads
    }



const GetCCT1 = () =>{
const Leads =["CCT1 (Lead to Proposal)"]

const CCT1 = [...opportunities.filter(x=>x.scope==0 && (x.firstProposalDate? true: false)).map(x=>(subtractTwoDates(x.firstContactDate,x.firstProposalDate))).sort((x,y)=>x-y)]

let p25index = Math.floor(CCT1.length*0.25)
let p50index = Math.floor(CCT1.length*0.5)
let p75index = Math.floor(CCT1.length*0.75)
let p90index = Math.floor(CCT1.length*0.9)


Leads.push(CCT1[p25index])
Leads.push(CCT1[p50index])
Leads.push(CCT1[p75index])
Leads.push(CCT1[p90index])

return Leads
}

const GetCCT2 = () =>{
  const Leads =["CCT2 (Proposal to Lead)"]
  
  const CCT2 = [...opportunities.filter(x=>x.scope==0 && (x.contractSignatureDate? true: false)).map(x=>(subtractTwoDates(x.firstProposalDate,x.contractSignatureDate))).sort((x,y)=>x-y)]
  
  let p25index = Math.floor(CCT2.length*0.25)
  let p50index = Math.floor(CCT2.length*0.5)
  let p75index = Math.floor(CCT2.length*0.75)
  let p90index = Math.floor(CCT2.length*0.9)
  
  
  Leads.push(CCT2[p25index])
  Leads.push(CCT2[p50index])
  Leads.push(CCT2[p75index])
  Leads.push(CCT2[p90index])
  
  return Leads
  }

  //////////////////////////


const exportClickWithOpportunitiesCCTPercentileRetainer =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-Opportunities-CCT-Percentile-Retainer",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderOpportunitiesCCTPercentileRetainer(),
        body: GetBodyOpportunitiesCCTPercentileRetainer()
      }
    });
    showMessage('Report downloaded successfully!')
    setActionLoading(false)
}

const GetHeaderOpportunitiesCCTPercentileRetainer = () =>{
  const header = ["Retainer","P25","P50","P75","P90"]
 
  return header
}


const GetBodyOpportunitiesCCTPercentileRetainer = () =>{
const body =[GetCCT1Retainer(),GetCCT2Retainer()]
return body
}



const GetCCT1Retainer = () =>{
const Leads =["CCT1 (Lead to Proposal)"]

const CCT1 = [...opportunities.filter(x=>x.scope==1 && (x.firstProposalDate? true: false)).map(x=>(subtractTwoDates(x.firstContactDate,x.firstProposalDate))).sort((x,y)=>x-y)]

let p25index = Math.floor(CCT1.length*0.25)
let p50index = Math.floor(CCT1.length*0.5)
let p75index = Math.floor(CCT1.length*0.75)
let p90index = Math.floor(CCT1.length*0.9)


Leads.push(CCT1[p25index])
Leads.push(CCT1[p50index])
Leads.push(CCT1[p75index])
Leads.push(CCT1[p90index])

return Leads
}

const GetCCT2Retainer = () =>{
  const Leads =["CCT2 (Proposal to Lead)"]
  
  const CCT2 = [...opportunities.filter(x=>x.scope==1 && (x.contractSignatureDate? true: false)).map(x=>(subtractTwoDates(x.firstProposalDate,x.contractSignatureDate))).sort((x,y)=>x-y)]
  
  let p25index = Math.floor(CCT2.length*0.25)
  let p50index = Math.floor(CCT2.length*0.5)
  let p75index = Math.floor(CCT2.length*0.75)
  let p90index = Math.floor(CCT2.length*0.9)
  
  
  Leads.push(CCT2[p25index])
  Leads.push(CCT2[p50index])
  Leads.push(CCT2[p75index])
  Leads.push(CCT2[p90index])
  
  return Leads
  }


  ///////////////////////


  const exportClickWithOpportunitiesFunnelRetainer =  () => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Opportunities-Export-Opportunities-Funnel-ٍRetainer",
        sheet: "Opportunities",
        tablePayload: {
          header: GetHeaderOpportunitiesFunnelRetainer(),
          body: GetBodyOpportunitiesFunnelRetainer()
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  }

  const GetHeaderOpportunitiesFunnelRetainer = () =>{
    const header = ["Status","Volume","Amount (proposed)","Amount (contracted)","Average"]
   
    return header
  }


const GetBodyOpportunitiesFunnelRetainer = () =>{
  const body =[GetLeadsRetainer(),GetQualifiedRetainer(),GetProposedRetainer(),GetApprovedRetainer(),GetWonRetainer(),GetLostRetainer()]
  return body
}



const GetLeadsRetainer = () =>{
  const Leads =["Leads"]

  let LeadsAmount = opportunities.filter(x=>x.scope==1).reduce(function(y, z) { return y+ (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.scope==1).length

  Leads.push(LeadsAmount)
  Leads.push(LeadsVolume)
  Leads.push("-")
  Leads.push(LeadsAmount/LeadsVolume)
 
 return Leads
}

const GetQualifiedRetainer = () =>{
  const Qualified =["Qualified"]

  let LeadsAmount = opportunities.filter(x=>x.status!=0 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status!=0 && x.scope==1).length

  Qualified.push(LeadsAmount)
  Qualified.push(LeadsVolume)
  Qualified.push("-")
  Qualified.push(LeadsAmount/LeadsVolume)
 
 return Qualified
}

const GetProposedRetainer = () =>{
  const Proposed =["Proposed"]

  let LeadsAmount = opportunities.filter(x=>x.status==2&& x.scope==1&& x.scope==1 ).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status==2&& x.scope==1&& x.scope==1 ).length

  Proposed.push(LeadsAmount)
  Proposed.push(LeadsVolume)
  Proposed.push("-")
  Proposed.push(LeadsAmount/LeadsVolume)
 
 return Proposed
}

const GetApprovedRetainer = () =>{
  const Approved =["Approved"]

  let LeadsAmount = opportunities.filter(x=>x.status==3&& x.scope==1 ).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status==3&& x.scope==1 ).length

  Approved.push(LeadsAmount)
  Approved.push(LeadsVolume)
  Approved.push("-")
  Approved.push(LeadsAmount/LeadsVolume)
 
 return Approved
}

const GetWonRetainer = () =>{
  const Won =["Won"]

  let LeadsAmount = opportunities.filter(x=>x.status==4&& x.scope==1 ).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsAmountContracted = opportunities.filter(x=>x.status==4&& x.scope==1 ).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status==4&& x.scope==1 ).length

  Won.push(LeadsAmount)
  Won.push(LeadsVolume)
  Won.push(LeadsAmountContracted)
  Won.push(LeadsAmount/LeadsVolume)
 
 return Won
}


const GetLostRetainer = () =>{
  const Lost =["Lost"]

  let LeadsAmount = opportunities.filter(x=>x.status==5&& x.scope==1 ).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status==5&& x.scope==1  ).length

  Lost.push(LeadsAmount)
  Lost.push(LeadsVolume)
  Lost.push("-")
  Lost.push(LeadsAmount/LeadsVolume)
 
 return Lost
}

////////////////////


const exportClickWithYTDClientSegAmountRetainer =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-YTD-ClientSeg-Amount",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderYTDClientSegProjectAmountRetainer(),
        body: GetBodyYTDClientSegProjectAmountRetainer()
      }
    });
    showMessage('Report downloaded successfully!')
    setActionLoading(false)
}

const GetHeaderYTDClientSegProjectAmountRetainer = () =>{
  const header = ["Retainer","New","Funnel","Proposed","Approved","Won","Lost","T. Channel","Won%","M Runrate","Runway"]
  //,"Avg. opp/Channel","Relative Percentage"]
 
  return header
}

const GetBodyYTDClientSegProjectAmountRetainer = () =>{
const body =[
  GetTotalVolumeRetainer(),
  //GetDirectAmountRetainer(),GetReferralAmountRetainer(),GetFacebookAmountRetainer(),GetWebsiteAmountRetainer(),
  GetTotalAmountRetainer(),GetAvgDiscountRetainer(),
  //GetValueContractedDirectRetainer(),GetValueContractedReferralRetainer(),GetValueContractedFaceBookRetainer(),GetValueContractedWebsiteRetainer(),
  GetValueContractedTotalRetainer()]
// let totalDirect = body[0][7]
// let totalReferral = body[1][7]
// let totalFacebook = body[2][7]
// let totalWebsite = body[3][7]
// let totalAll = body[4][7]
// body[0][10] = totalDirect/totalAll
// body[1][10] = totalReferral/totalAll
// body[2][10] = totalFacebook/totalAll
// body[3][10] = totalWebsite/totalAll
// body[4][10] = totalAll/totalAll

// let avgDirect = body[0][11]
// let avgReferral = body[1][11]
// let avgFacebook = body[2][11]
// let avgWebsite = body[3][11]
// let avgAll = body[4][11]
// body[0][12] = avgDirect/avgAll
// body[1][12] = avgReferral/avgAll
// body[2][12] = avgFacebook/avgAll
// body[3][12] = avgWebsite/avgAll
// body[4][12] = avgAll/avgAll
return body
}



const GetDirectAmountRetainer = () =>{
const DirectAmount =["Direct"]

let New = "-"
let Funnel = "-"
let Approved = opportunities.filter(x=>x.status==2 && x.source==1  && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Proposed = opportunities.filter(x=>x.status==3 && x.source==1 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Won = opportunities.filter(x=>x.status==4 && x.source==1 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Lost = opportunities.filter(x=>x.status==5 && x.source==1 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let total =Approved+Proposed+Won+Lost
let wonPercentage = Won/total
let wonLoss = Won/Lost

let NewVol = opportunities.filter(x=>x.status==0 && x.source==1 && x.scope==1).length
let FunnelVol = opportunities.filter(x=>x.status==1 && x.source==1 && x.scope==1).length
let ApprovedVol = opportunities.filter(x=>x.status==2 && x.source==1 && x.scope==1).length
let ProposedVol = opportunities.filter(x=>x.status==3 && x.source==1 && x.scope==1).length
let WonVol = opportunities.filter(x=>x.status==4 && x.source==1 && x.scope==1).length
let LostVol = opportunities.filter(x=>x.status==5 && x.source==1 && x.scope==1).length
let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol


DirectAmount.push(New)
DirectAmount.push(Funnel)
DirectAmount.push(Proposed)
DirectAmount.push(Approved)
DirectAmount.push(Won)
DirectAmount.push(Lost)
DirectAmount.push(total)
DirectAmount.push(wonPercentage)
DirectAmount.push(wonLoss)
DirectAmount.push("-")
DirectAmount.push(total/totalVol)
DirectAmount.push("-")
return DirectAmount
}

const GetReferralAmountRetainer = () =>{
const Referral =["Referral"]

let New = "-"
let Funnel = "-"
let Approved = opportunities.filter(x=>x.status==2 && x.source==0 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Proposed = opportunities.filter(x=>x.status==3 && x.source==0 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Won = opportunities.filter(x=>x.status==4 && x.source==0 && x.scope==1).reduce(function(y, z) { return y+ (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Lost = opportunities.filter(x=>x.status==5 && x.source==0 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let total =Approved+Proposed+Won+Lost
let wonPercentage = Won/total
let wonLoss = Won/Lost

let NewVol = opportunities.filter(x=>x.status==0 && x.source==0 && x.scope==1).length
let FunnelVol = opportunities.filter(x=>x.status==1 && x.source==0 && x.scope==1).length
let ApprovedVol = opportunities.filter(x=>x.status==2 && x.source==0 && x.scope==1).length
let ProposedVol = opportunities.filter(x=>x.status==3 && x.source==0 && x.scope==1).length
let WonVol = opportunities.filter(x=>x.status==4 && x.source==0 && x.scope==1).length
let LostVol = opportunities.filter(x=>x.status==5 && x.source==0 && x.scope==1).length
let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol


Referral.push(New)
Referral.push(Funnel)
Referral.push(Proposed)
Referral.push(Approved)
Referral.push(Won)
Referral.push(Lost)
Referral.push(total)
Referral.push(wonPercentage)
Referral.push(wonLoss)
Referral.push("-")
Referral.push(total/totalVol)
Referral.push("-")
return Referral
}


const GetFacebookAmountRetainer = () =>{
const Facebook =["Facebook"]

let New = "-"
let Funnel = "-"
let Approved = opportunities.filter(x=>x.status==2 && x.source==2 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Proposed = opportunities.filter(x=>x.status==3 && x.source==2 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Won = opportunities.filter(x=>x.status==4 && x.source==2 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Lost = opportunities.filter(x=>x.status==5 && x.source==2 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let total =Approved+Proposed+Won+Lost
let wonPercentage = Won/total
let wonLoss = Won/Lost

let NewVol = opportunities.filter(x=>x.status==0 && x.source==2 && x.scope==1).length
let FunnelVol = opportunities.filter(x=>x.status==1 && x.source==2 && x.scope==1).length
let ApprovedVol = opportunities.filter(x=>x.status==2 && x.source==2 && x.scope==1).length
let ProposedVol = opportunities.filter(x=>x.status==3 && x.source==2 && x.scope==1).length
let WonVol = opportunities.filter(x=>x.status==4 && x.source==2 && x.scope==1).length
let LostVol = opportunities.filter(x=>x.status==5 && x.source==2 && x.scope==1).length
let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol

Facebook.push(New)
Facebook.push(Funnel)
Facebook.push(Proposed)
Facebook.push(Approved)
Facebook.push(Won)
Facebook.push(Lost)
Facebook.push(total)
Facebook.push(wonPercentage)
Facebook.push(wonLoss)
Facebook.push("-")
Facebook.push(total/totalVol)
Facebook.push("-")
return Facebook
}


const GetWebsiteAmountRetainer = () =>{
const Website =["Website"]

let New = "-"
let Funnel = "-"
let Approved = opportunities.filter(x=>x.status==2 && x.source==3 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Proposed = opportunities.filter(x=>x.status==3 && x.source==3 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Won = opportunities.filter(x=>x.status==4 && x.source==3 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Lost = opportunities.filter(x=>x.status==5 && x.source==3 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let total =Approved+Proposed+Won+Lost
let wonPercentage = Won/total
let wonLoss = Won/Lost

let NewVol = opportunities.filter(x=>x.status==0 && x.source==3 && x.scope==1).length
let FunnelVol = opportunities.filter(x=>x.status==1 && x.source==3 && x.scope==1).length
let ApprovedVol = opportunities.filter(x=>x.status==2 && x.source==3 && x.scope==1).length
let ProposedVol = opportunities.filter(x=>x.status==3 && x.source==3 && x.scope==1).length
let WonVol = opportunities.filter(x=>x.status==4 && x.source==3 && x.scope==1).length
let LostVol = opportunities.filter(x=>x.status==5 && x.source==3 && x.scope==1).length
let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol

Website.push(New)
Website.push(Funnel)
Website.push(Proposed)
Website.push(Approved)
Website.push(Won)
Website.push(Lost)
Website.push(total)
Website.push(wonPercentage)
Website.push(wonLoss)
Website.push("-")
Website.push(total/totalVol)
Website.push("-")
return Website
}


const GetTotalVolumeRetainer = () =>{
  const ProposalBacklog =["Volume"]

  let New = opportunities.filter(x=>x.status==0 && x.scope==1).length
  let Funnel = opportunities.filter(x=>x.status==1 && x.scope==1).length
  let Approved = opportunities.filter(x=>x.status==2 && x.scope==1).length
  let Proposed = opportunities.filter(x=>x.status==3 && x.scope==1).length
  let Won = opportunities.filter(x=>x.status==4 && x.scope==1).length
  let Lost = opportunities.filter(x=>x.status==5 && x.scope==1).length
  let total = New + Funnel +Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let runRate = opportunities.filter(x=>x.scope==1).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency)/z.retainerValidatity : 0) }, 0)
  let runWay = opportunities.filter(x=>x.scope==1).reduce(function(y, z) { return y + (z.retainerValidatity ? z.retainerValidatity : 0) }, 0) / opportunities.filter(x=>x.scope==1).length
  //let wonLoss = Won/Lost
  ProposalBacklog.push(New)
  ProposalBacklog.push(Funnel)
  ProposalBacklog.push(Approved)
  ProposalBacklog.push(Proposed)
  ProposalBacklog.push(Won)
  ProposalBacklog.push(Lost)
  ProposalBacklog.push(total)
  ProposalBacklog.push(wonPercentage)
  ProposalBacklog.push(runRate)
  ProposalBacklog.push(runWay)
 return ProposalBacklog
}


const GetTotalAmountRetainer = () =>{
const Total =["Value proposed"]
let New = "-"
let Funnel = "-"
let Approved = opportunities.filter(x=>x.status==2 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Proposed = opportunities.filter(x=>x.status==3 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Won = opportunities.filter(x=>x.status==4 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let Lost = opportunities.filter(x=>x.status==5 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let total =Approved+Proposed+Won+Lost
let wonPercentage =  Math.round((Won/total)*100)
let wonLoss =  Math.round((Won/Lost)*100)

let NewVol = opportunities.filter(x=>x.status==0 && x.scope==1).length
let FunnelVol = opportunities.filter(x=>x.status==1 && x.scope==1).length
let ApprovedVol = opportunities.filter(x=>x.status==2 && x.scope==1).length
let ProposedVol = opportunities.filter(x=>x.status==3 && x.scope==1).length
let WonVol = opportunities.filter(x=>x.status==4 && x.scope==1).length
let LostVol = opportunities.filter(x=>x.status==5 && x.scope==1).length
let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol


Total.push(New)
Total.push(Funnel)
Total.push(Proposed)
Total.push(Approved)
Total.push(Won)
Total.push(Lost)
Total.push(total)
Total.push(wonPercentage)
//Total.push(wonLoss)
Total.push("-")
//Total.push(total/totalVol)
Total.push("-")
return Total
}

const GetAvgDiscountRetainer = () =>{
const avgDiscount =["Average Discount"]


let AllProposed = opportunities.filter(x=>x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)

let WonTotalProposal = opportunities.filter(x=>x.status==4 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
let WonTotalContracted = opportunities.filter(x=>x.status==4 && x.scope==1).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0) 


avgDiscount.push("-")
avgDiscount.push("-")
avgDiscount.push("-")
avgDiscount.push("-")
avgDiscount.push(Math.round((WonTotalProposal/WonTotalContracted)*100))
avgDiscount.push("-")
avgDiscount.push(Math.round((AllProposed/WonTotalContracted)*100))
avgDiscount.push("-")
avgDiscount.push("-")
avgDiscount.push("-")
//avgDiscount.push("-")
//avgDiscount.push("-")
return avgDiscount
}

const GetValueContractedDirectRetainer = () =>{
const ValueContracted =["Value Contracted Direct"]


let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.source==1 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
return ValueContracted
}

const GetValueContractedReferralRetainer = () =>{
const ValueContracted =["Value Contracted Referral"]


let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.source==0  && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
return ValueContracted
}

const GetValueContractedFaceBookRetainer = () =>{
const ValueContracted =["Value Contracted Facebook"]


let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.source==2  && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
return ValueContracted
}

const GetValueContractedWebsiteRetainer = () =>{
const ValueContracted =["Value Contracted Website"]


let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.source==3 && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
return ValueContracted
}

const GetValueContractedTotalRetainer = () =>{
const ValueContracted =["Value Contracted Total"]


let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.scope==1).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push(WonTotalContracted)
ValueContracted.push("-")
ValueContracted.push("-")
ValueContracted.push("-")
//ValueContracted.push("-")
//ValueContracted.push("-")
return ValueContracted
}


///////////////////

  


  const exportClickWithOpportunitiesFunnel =  () => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Opportunities-Export-Opportunities-Funnel",
        sheet: "Opportunities",
        tablePayload: {
          header: GetHeaderOpportunitiesFunnel(),
          body: GetBodyOpportunitiesFunnel()
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  }

  const GetHeaderOpportunitiesFunnel = () =>{
    const header = ["Status","Volume","Amount (proposed)","Amount (contracted)","Average"]
   
    return header
  }


const GetBodyOpportunitiesFunnel = () =>{
  const body =[GetLeads(),GetQualified(),GetProposed(),GetApproved(),GetWon(),GetLost()]
  return body
}



const GetLeads = () =>{
  const Leads =["Leads"]

  let LeadsAmount = opportunities.filter(x=>x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.scope==0).length

  Leads.push(LeadsVolume)
  Leads.push(LeadsAmount)
 
  Leads.push("-")
  Leads.push(LeadsAmount/LeadsVolume)
 
 return Leads
}

const GetQualified = () =>{
  const Qualified =["Qualified"]

  let LeadsAmount = opportunities.filter(x=>x.status!=0 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status!=0 && x.scope==0).length

  Qualified.push(LeadsVolume)
  Qualified.push(LeadsAmount)
  
  Qualified.push("-")
  Qualified.push(LeadsAmount/LeadsVolume)
 
 return Qualified
}

const GetProposed = () =>{
  const Proposed =["Proposed"]

  let LeadsAmount = opportunities.filter(x=>x.status==2 && x.scope==0 ).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status==2 && x.scope==0 ).length

  Proposed.push(LeadsVolume)
  Proposed.push(LeadsAmount)
  
  Proposed.push("-")
  Proposed.push(LeadsAmount/LeadsVolume)
 
 return Proposed
}

const GetApproved = () =>{
  const Approved =["Approved"]

  let LeadsAmount = opportunities.filter(x=>x.status==3 && x.scope==0 ).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status==3 && x.scope==0 ).length

  Approved.push(LeadsVolume)
  Approved.push(LeadsAmount)
  
  Approved.push("-")
  Approved.push(LeadsAmount/LeadsVolume)
 
 return Approved
}

const GetWon = () =>{
  const Won =["Won"]

  let LeadsAmount = opportunities.filter(x=>x.status==4 && x.scope==0 ).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsAmountContracted = opportunities.filter(x=>x.status==4 && x.scope==0 ).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status==4 && x.scope==0 ).length

  Won.push(LeadsVolume)
  Won.push(LeadsAmount)
  
  Won.push(LeadsAmountContracted)
  Won.push(LeadsAmount/LeadsVolume)
 
 return Won
}


const GetLost = () =>{
  const Lost =["Lost"]

  let LeadsAmount = opportunities.filter(x=>x.status==5 && x.scope==0 ).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let LeadsVolume = opportunities.filter(x=>x.status==5 && x.scope==0  ).length

  Lost.push(LeadsVolume)
  Lost.push(LeadsAmount)
  
  Lost.push("-")
  Lost.push(LeadsAmount/LeadsVolume)
 
 return Lost
}



  /////////////////////////////////////////////////////////


  const exportClickWithYTDClientSegAmount =  () => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Opportunities-Export-YTD-ClientSeg-Amount",
        sheet: "Opportunities",
        tablePayload: {
          header: GetHeaderYTDClientSegProjectAmount(),
          body: GetBodyYTDClientSegProjectAmount()
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  }

  const GetHeaderYTDClientSegProjectAmount = () =>{
    const header = ["Project Amount","New","Funnel","Proposed","Approved","Won","Lost","T. Channel","Won%","Won/Loss","Channel%","Avg. opp/Channel","Relative Percentage"]
   
    return header
  }

const GetBodyYTDClientSegProjectAmount = () =>{
  const body =[GetDirectAmount(),GetReferralAmount(),GetFacebookAmount(),GetWebsiteAmount(),GetTotalAmount(),GetAvgDiscount(),GetValueContractedDirect(),GetValueContractedReferral(),GetValueContractedFaceBook(),GetValueContractedWebsite(),GetValueContractedTotal()]
  let totalDirect = body[0][7]
  let totalReferral = body[1][7]
  let totalFacebook = body[2][7]
  let totalWebsite = body[3][7]
  let totalAll = body[4][7]
  body[0][10] = Math.round((totalDirect/totalAll)*100)
  body[1][10] = Math.round((totalReferral/totalAll)*100)
  body[2][10] = Math.round((totalFacebook/totalAll)*100)
  body[3][10] = Math.round((totalWebsite/totalAll)*100)
  body[4][10] = Math.round((totalAll/totalAll)*100)

  let avgDirect = body[0][11]
  let avgReferral = body[1][11]
  let avgFacebook = body[2][11]
  let avgWebsite = body[3][11]
  let avgAll = body[4][11]
  body[0][12] = Math.round((avgDirect/avgAll)*100)
  body[1][12] = Math.round((avgReferral/avgAll)*100)
  body[2][12] = Math.round((avgFacebook/avgAll)*100)
  body[3][12] = Math.round((avgWebsite/avgAll)*100)
  body[4][12] = Math.round((avgAll/avgAll)*100)
  return body
}



const GetDirectAmount = () =>{
  const DirectAmount =["Direct"]

  let New = "-"
  let Funnel = "-"
  let Approved = opportunities.filter(x=>x.status==2 && x.source==1  && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Proposed = opportunities.filter(x=>x.status==3 && x.source==1 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Won = opportunities.filter(x=>x.status==4 && x.source==1 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Lost = opportunities.filter(x=>x.status==5 && x.source==1 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let total =Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)

  let NewVol = opportunities.filter(x=>x.status==0 && x.source==1 && x.scope==0).length
  let FunnelVol = opportunities.filter(x=>x.status==1 && x.source==1 && x.scope==0).length
  let ApprovedVol = opportunities.filter(x=>x.status==2 && x.source==1 && x.scope==0).length
  let ProposedVol = opportunities.filter(x=>x.status==3 && x.source==1 && x.scope==0).length
  let WonVol = opportunities.filter(x=>x.status==4 && x.source==1 && x.scope==0).length
  let LostVol = opportunities.filter(x=>x.status==5 && x.source==1 && x.scope==0).length
  let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol


  DirectAmount.push(New)
  DirectAmount.push(Funnel)
  DirectAmount.push(Proposed)
  DirectAmount.push(Approved)
  DirectAmount.push(Won)
  DirectAmount.push(Lost)
  DirectAmount.push(total)
  DirectAmount.push(wonPercentage)
  DirectAmount.push(wonLoss)
  DirectAmount.push("-")
  DirectAmount.push(total/totalVol)
  DirectAmount.push("-")
 return DirectAmount
}

const GetReferralAmount = () =>{
  const Referral =["Referral"]

  let New = "-"
  let Funnel = "-"
  let Approved = opportunities.filter(x=>x.status==2 && x.source==0 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Proposed = opportunities.filter(x=>x.status==3 && x.source==0 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Won = opportunities.filter(x=>x.status==4 && x.source==0 && x.scope==0).reduce(function(y, z) { return y+ (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Lost = opportunities.filter(x=>x.status==5 && x.source==0 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let total =Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)

  let NewVol = opportunities.filter(x=>x.status==0 && x.source==0 && x.scope==0).length
  let FunnelVol = opportunities.filter(x=>x.status==1 && x.source==0 && x.scope==0).length
  let ApprovedVol = opportunities.filter(x=>x.status==2 && x.source==0 && x.scope==0).length
  let ProposedVol = opportunities.filter(x=>x.status==3 && x.source==0 && x.scope==0).length
  let WonVol = opportunities.filter(x=>x.status==4 && x.source==0 && x.scope==0).length
  let LostVol = opportunities.filter(x=>x.status==5 && x.source==0 && x.scope==0).length
  let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol


  Referral.push(New)
  Referral.push(Funnel)
  Referral.push(Proposed)
  Referral.push(Approved)
  Referral.push(Won)
  Referral.push(Lost)
  Referral.push(total)
  Referral.push(wonPercentage)
  Referral.push(wonLoss)
  Referral.push("-")
  Referral.push(total/totalVol)
  Referral.push("-")
 return Referral
}


const GetFacebookAmount = () =>{
  const Facebook =["Facebook"]

  let New = "-"
  let Funnel = "-"
  let Approved = opportunities.filter(x=>x.status==2 && x.source==2 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Proposed = opportunities.filter(x=>x.status==3 && x.source==2 && x.scope==0).reduce(function(y, z) { return y+ (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Won = opportunities.filter(x=>x.status==4 && x.source==2 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Lost = opportunities.filter(x=>x.status==5 && x.source==2 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let total =Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)

  let NewVol = opportunities.filter(x=>x.status==0 && x.source==2 && x.scope==0).length
  let FunnelVol = opportunities.filter(x=>x.status==1 && x.source==2 && x.scope==0).length
  let ApprovedVol = opportunities.filter(x=>x.status==2 && x.source==2 && x.scope==0).length
  let ProposedVol = opportunities.filter(x=>x.status==3 && x.source==2 && x.scope==0).length
  let WonVol = opportunities.filter(x=>x.status==4 && x.source==2 && x.scope==0).length
  let LostVol = opportunities.filter(x=>x.status==5 && x.source==2 && x.scope==0).length
  let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol

  Facebook.push(New)
  Facebook.push(Funnel)
  Facebook.push(Proposed)
  Facebook.push(Approved)
  Facebook.push(Won)
  Facebook.push(Lost)
  Facebook.push(total)
  Facebook.push(wonPercentage)
  Facebook.push(wonLoss)
  Facebook.push("-")
  Facebook.push(total/totalVol)
  Facebook.push("-")
 return Facebook
}


const GetWebsiteAmount = () =>{
  const Website =["Website"]

  let New = "-"
  let Funnel = "-"
  let Approved = opportunities.filter(x=>x.status==2 && x.source==3 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Proposed = opportunities.filter(x=>x.status==3 && x.source==3 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Won = opportunities.filter(x=>x.status==4 && x.source==3 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Lost = opportunities.filter(x=>x.status==5 && x.source==3 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let total =Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)

  let NewVol = opportunities.filter(x=>x.status==0 && x.source==3 && x.scope==0).length
  let FunnelVol = opportunities.filter(x=>x.status==1 && x.source==3 && x.scope==0).length
  let ApprovedVol = opportunities.filter(x=>x.status==2 && x.source==3 && x.scope==0).length
  let ProposedVol = opportunities.filter(x=>x.status==3 && x.source==3 && x.scope==0).length
  let WonVol = opportunities.filter(x=>x.status==4 && x.source==3 && x.scope==0).length
  let LostVol = opportunities.filter(x=>x.status==5 && x.source==3 && x.scope==0).length
  let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol

  Website.push(New)
  Website.push(Funnel)
  Website.push(Proposed)
  Website.push(Approved)
  Website.push(Won)
  Website.push(Lost)
  Website.push(total)
  Website.push(wonPercentage)
  Website.push(wonLoss)
  Website.push("-")
  Website.push(total/totalVol)
  Website.push("-")
 return Website
}


const GetTotalAmount = () =>{
  const Total =["T. Status"]
  let New = "-"
  let Funnel = "-"
  let Approved = opportunities.filter(x=>x.status==2 && x.scope==0).reduce(function(y, z) { return y+ (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Proposed = opportunities.filter(x=>x.status==3 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Won = opportunities.filter(x=>x.status==4 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let Lost = opportunities.filter(x=>x.status==5 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let total =Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)

  let NewVol = opportunities.filter(x=>x.status==0 && x.scope==0).length
  let FunnelVol = opportunities.filter(x=>x.status==1 && x.scope==0).length
  let ApprovedVol = opportunities.filter(x=>x.status==2 && x.scope==0).length
  let ProposedVol = opportunities.filter(x=>x.status==3 && x.scope==0).length
  let WonVol = opportunities.filter(x=>x.status==4 && x.scope==0).length
  let LostVol = opportunities.filter(x=>x.status==5 && x.scope==0).length
  let totalVol = NewVol + FunnelVol +ApprovedVol+ProposedVol+WonVol+LostVol


  Total.push(New)
  Total.push(Funnel)
  Total.push(Proposed)
  Total.push(Approved)
  Total.push(Won)
  Total.push(Lost)
  Total.push(total)
  Total.push(wonPercentage)
  Total.push(wonLoss)
  Total.push("-")
  Total.push(total/totalVol)
  Total.push("-")
 return Total
}

const GetAvgDiscount = () =>{
  const avgDiscount =["Average Discount"]

  
  let AllProposed = opportunities.filter(x=>x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
 
  let WonTotalProposal = opportunities.filter(x=>x.status==4 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let WonTotalContracted = opportunities.filter(x=>x.status==4 && x.scope==0).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0) 


  avgDiscount.push("-")
  avgDiscount.push("-")
  avgDiscount.push("-")
  avgDiscount.push("-")
  avgDiscount.push(Math.round((WonTotalProposal/WonTotalContracted)*100))
  avgDiscount.push("-")
  avgDiscount.push(Math.round((AllProposed/WonTotalContracted)*100))
  avgDiscount.push("-")
  avgDiscount.push("-")
  avgDiscount.push("-")
  avgDiscount.push("-")
  avgDiscount.push("-")
 return avgDiscount
}

const GetValueContractedDirect = () =>{
  const ValueContracted =["Value Contracted Direct"]

  
  let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.source==1 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
 return ValueContracted
}

const GetValueContractedReferral = () =>{
  const ValueContracted =["Value Contracted Referral"]

  
  let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.source==0  && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
 return ValueContracted
}

const GetValueContractedFaceBook = () =>{
  const ValueContracted =["Value Contracted Facebook"]

  
  let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.source==2  && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
 return ValueContracted
}

const GetValueContractedWebsite = () =>{
  const ValueContracted =["Value Contracted Website"]

  
  let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.source==3 && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
 return ValueContracted
}

const GetValueContractedTotal = () =>{
  const ValueContracted =["Value Contracted Total"]

  
  let WonTotalContracted = opportunities.filter(x=>x.status==4  && x.scope==0).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)


  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push(Math.round((WonTotalContracted)*100))
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
  ValueContracted.push("-")
 return ValueContracted
}



//////////////////////////////

  const exportClickWithYTDClientSegVol =  () => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Opportunities-Export-YTD-ClientSeg-Vol",
        sheet: "Opportunities",
        tablePayload: {
          header: GetHeaderYTDClientSegProjectVolume(),
          body: GetBodyYTDClientSegProjectVolume()
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  }

  const GetHeaderYTDClientSegProjectVolume = () =>{
    const header = ["Project Volume","New","Funnel","Proposed","Approved","Won","Lost","T. Channel","Won%","Won/Loss","Channel%"]
   
    return header
  }

const GetBodyYTDClientSegProjectVolume = () =>{
  const body =[GetDirectVolumes(),GetReferralVolumes(),GetFacebookVolumes(),GetWebsiteVolumes(),GetTotalVolumes()]
  let totalDirect = body[0][7]
  let totalReferral = body[1][7]
  let totalFacebook = body[2][7]
  let totalWebsite = body[3][7]
  let totalAll = body[4][7]
  body[0][10] = Math.round((totalDirect/totalAll)*100)
  body[1][10] = Math.round((totalReferral/totalAll)*100)
  body[2][10] = Math.round((totalFacebook/totalAll)*100)
  body[3][10] = Math.round((totalWebsite/totalAll)*100)
  body[4][10] = Math.round((totalAll/totalAll)*100)
  return body
}



const GetDirectVolumes = () =>{
  const ProposalBacklog =["Direct"]

  let New = opportunities.filter(x=>x.status==0 && x.source==1 &&x.scope==0).length
  let Funnel = opportunities.filter(x=>x.status==1 && x.source==1 &&x.scope==0).length
  let Approved = opportunities.filter(x=>x.status==2 && x.source==1 &&x.scope==0).length
  let Proposed = opportunities.filter(x=>x.status==3 && x.source==1 &&x.scope==0).length
  let Won = opportunities.filter(x=>x.status==4 && x.source==1 &&x.scope==0).length
  let Lost = opportunities.filter(x=>x.status==5 && x.source==1 &&x.scope==0).length
  let total = New + Funnel +Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)
  ProposalBacklog.push(New)
  ProposalBacklog.push(Funnel)
  ProposalBacklog.push(Approved)
  ProposalBacklog.push(Proposed)
  ProposalBacklog.push(Won)
  ProposalBacklog.push(Lost)
  ProposalBacklog.push(total)
  ProposalBacklog.push(wonPercentage)
  ProposalBacklog.push(wonLoss)
  ProposalBacklog.push("-")
 return ProposalBacklog
}

const GetReferralVolumes = () =>{
  const ProposalBacklog =["Referral"]

  let New = opportunities.filter(x=>x.status==0 && x.source==0 &&x.scope==0).length
  let Funnel = opportunities.filter(x=>x.status==1 && x.source==0 &&x.scope==0).length
  let Approved = opportunities.filter(x=>x.status==2 && x.source==0 &&x.scope==0).length
  let Proposed = opportunities.filter(x=>x.status==3 && x.source==0 &&x.scope==0).length
  let Won = opportunities.filter(x=>x.status==4 && x.source==0 &&x.scope==0).length
  let Lost = opportunities.filter(x=>x.status==5 && x.source==0 &&x.scope==0).length
  let total = New + Funnel +Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)
  ProposalBacklog.push(New)
  ProposalBacklog.push(Funnel)
  ProposalBacklog.push(Approved)
  ProposalBacklog.push(Proposed)
  ProposalBacklog.push(Won)
  ProposalBacklog.push(Lost)
  ProposalBacklog.push(total)
  ProposalBacklog.push(wonPercentage)
  ProposalBacklog.push(wonLoss)
  ProposalBacklog.push("-")
 return ProposalBacklog
}


const GetFacebookVolumes = () =>{
  const ProposalBacklog =["Facebook"]

  let New = opportunities.filter(x=>x.status==0 && x.source==2 &&x.scope==0).length
  let Funnel = opportunities.filter(x=>x.status==1 && x.source==2 &&x.scope==0).length
  let Approved = opportunities.filter(x=>x.status==2 && x.source==2 &&x.scope==0).length
  let Proposed = opportunities.filter(x=>x.status==3 && x.source==2 &&x.scope==0).length
  let Won = opportunities.filter(x=>x.status==4 && x.source==2 &&x.scope==0).length
  let Lost = opportunities.filter(x=>x.status==5 && x.source==2 &&x.scope==0).length
  let total = New + Funnel +Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)
  ProposalBacklog.push(New)
  ProposalBacklog.push(Funnel)
  ProposalBacklog.push(Approved)
  ProposalBacklog.push(Proposed)
  ProposalBacklog.push(Won)
  ProposalBacklog.push(Lost)
  ProposalBacklog.push(total)
  ProposalBacklog.push(wonPercentage)
  ProposalBacklog.push(wonLoss)
  ProposalBacklog.push("-")
 return ProposalBacklog
}




const GetWebsiteVolumes = () =>{
  const ProposalBacklog =["Website"]

  let New = opportunities.filter(x=>x.status==0 && x.source==3 &&x.scope==0).length
  let Funnel = opportunities.filter(x=>x.status==1 && x.source==3 &&x.scope==0).length
  let Approved = opportunities.filter(x=>x.status==2 && x.source==3 &&x.scope==0).length
  let Proposed = opportunities.filter(x=>x.status==3 && x.source==3 &&x.scope==0).length
  let Won = opportunities.filter(x=>x.status==4 && x.source==3 &&x.scope==0).length
  let Lost = opportunities.filter(x=>x.status==5 && x.source==3 &&x.scope==0).length
  let total = New + Funnel +Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)
  ProposalBacklog.push(New)
  ProposalBacklog.push(Funnel)
  ProposalBacklog.push(Approved)
  ProposalBacklog.push(Proposed)
  ProposalBacklog.push(Won)
  ProposalBacklog.push(Lost)
  ProposalBacklog.push(total)
  ProposalBacklog.push(wonPercentage)
  ProposalBacklog.push(wonLoss)
  ProposalBacklog.push("-")
 return ProposalBacklog
}


const GetTotalVolumes = () =>{
  const ProposalBacklog =["T. Status"]

  let New = opportunities.filter(x=>x.status==0 &&x.scope==0).length
  let Funnel = opportunities.filter(x=>x.status==1 &&x.scope==0).length
  let Approved = opportunities.filter(x=>x.status==2 &&x.scope==0).length
  let Proposed = opportunities.filter(x=>x.status==3 &&x.scope==0).length
  let Won = opportunities.filter(x=>x.status==4 &&x.scope==0).length
  let Lost = opportunities.filter(x=>x.status==5 &&x.scope==0).length
  let total = New + Funnel +Approved+Proposed+Won+Lost
  let wonPercentage = Math.round((Won/total)*100)
  let wonLoss = Math.round((Won/Lost)*100)
  ProposalBacklog.push(New)
  ProposalBacklog.push(Funnel)
  ProposalBacklog.push(Approved)
  ProposalBacklog.push(Proposed)
  ProposalBacklog.push(Won)
  ProposalBacklog.push(Lost)
  ProposalBacklog.push(total)
  ProposalBacklog.push(wonPercentage)
  ProposalBacklog.push(wonLoss)
  ProposalBacklog.push("-")
 return ProposalBacklog
}

//////////////////////


  const exportClickWithFWBackLogAmount =  () => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Opportunities-Export-FW-Backlog-Amount",
        sheet: "Opportunities",
        tablePayload: {
          header: GetHeaderFW(),
          body: GetBodyFWBacklogAmount()
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  }


const GetBodyFWBacklogAmount = () =>{
  const body =[GetProposalBacklogFWAmount(),GetLostProposalFWAmount(),GetNetProposalBacklogFWAmount()]
  return body
}



const GetProposalBacklogFWAmount = () =>{
  const ProposalBacklog =["Proposal Backlog"]
  //ProposalBacklog.push("-")
  let amountProposalLY = opportunities.filter(x=>calculateFY(x.firstProposalDate)<year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let amountContractLY = opportunities.filter(x=> calculateFY(x.contractSignatureDate)<year).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
  ProposalBacklog.push(amountProposalLY-amountContractLY)
  let amountProposal = 0;
  let amountContract = 0;
  for (let index = 1; index < 53; index++) {
    
    amountProposal += opportunities.filter(x=>calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).reduce(function(y, z) { return y+ (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
    amountContract += opportunities.filter(x=>calculateFW(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate)==year).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
    //lostContract += opportunities.filter(x=>x.status==5 && calculateFW(x.lostDate)==index).length
    ProposalBacklog.push(amountProposal-amountContract)
 }
 let amountProposalNY = opportunities.filter(x=> calculateFY(x.firstProposalDate)>year).reduce(function(y, z) { return y+ (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let amountContractNY = opportunities.filter(x=> calculateFY(x.contractSignatureDate)>year).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
  ProposalBacklog.push(amountProposalNY-amountContractNY)
 return ProposalBacklog
}

const GetLostProposalFWAmount = () =>{
  const LostProposal =["Lost Proposals"]
  //LostProposal.push("-")
  let lostContractLY = opportunities.filter(x=>x.status==5  && calculateFY(x.lostDate)<year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  LostProposal.push(lostContractLY)
  let lostContract = 0;
  for (let index = 1; index < 53; index++) {
    lostContract += opportunities.filter(x=>x.status==5 && calculateFW(x.lostDate)==index && calculateFY(x.lostDate)==year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
    LostProposal.push(lostContract)
 }
 let lostContractNY = opportunities.filter(x=>x.status==5  && calculateFY(x.lostDate)>year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  LostProposal.push(lostContractNY)
 return LostProposal
}

const GetNetProposalBacklogFWAmount = () =>{
  const NetProposalBacklog =["Net Proposal Backlog"]
  //NetProposalBacklog.push("-")
  let amountProposalLY = opportunities.filter(x=> calculateFY(x.firstProposalDate)<year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  let amountContractLY = opportunities.filter(x=>calculateFY(x.contractSignatureDate)<year).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
  let lostContractLY = opportunities.filter(x=>x.status==5 && calculateFY(x.lostDate)<year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
  NetProposalBacklog.push(amountProposalLY-amountContractLY-lostContractLY)
  let amountProposal = 0;
  let amountContract = 0;
  let lostContract = 0;
  for (let index = 1; index < 53; index++) {
    
    amountProposal += opportunities.filter(x=>calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
    amountContract += opportunities.filter(x=>calculateFW(x.contractSignatureDate)==index  && calculateFY(x.contractSignatureDate)==year).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
    lostContract += opportunities.filter(x=>x.status==5 && calculateFW(x.lostDate)==index && calculateFY(x.lostDate)==year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
    NetProposalBacklog.push(amountProposal-amountContract-lostContract)
 }
 let amountProposalNY = opportunities.filter(x=> calculateFY(x.firstProposalDate)>year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
 let amountContractNY = opportunities.filter(x=> calculateFY(x.contractSignatureDate)>year).reduce(function(y, z) { return y + (z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
 let lostContractNY = opportunities.filter(x=>x.status==5 &&  calculateFY(x.lostDate)>year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
 NetProposalBacklog.push(amountProposalNY-amountContractNY-lostContractNY)
 return NetProposalBacklog
}

///////////////////////////


  const exportClickWithFWBackLogVolume =  () => {
    setActionLoading(true)
    showLoadingMessage('loading...')
      //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
      downloadExcel({
        fileName: "Opportunities-Export-FW-Backlog-Volume",
        sheet: "Opportunities",
        tablePayload: {
          header: GetHeaderFW(),
          body: GetBodyFWBacklogVolume()
        }
      });
      showMessage('Report downloaded successfully!')
      setActionLoading(false)
  }


const GetBodyFWBacklogVolume = () =>{
  const body =[GetLeadBacklogFWVolume(), GetProposalBacklogFWVolume(),GetLostProposalFWVolume(),GetNetProposalBacklogFWVolume()]
  return body
}

const GetLeadBacklogFWVolume = () =>{
   const LeadBacklog =["Lead Backlog"]
   //LeadBacklog.push("-")
   let volumeLeadLY = opportunities.filter(x=> calculateFY(x.firstContactDate)<year).length
   let volumeProposalLY = opportunities.filter(x=>calculateFY(x.firstProposalDate)<year).length
   LeadBacklog.push(volumeLeadLY-volumeProposalLY)
   let volumeLead = 0;
   let volumeProposal = 0;
   for (let index = 1; index < 53; index++) {
    volumeLead += opportunities.filter(x=>calculateFW(x.firstContactDate)==index && calculateFY(x.firstContactDate)==year).length
    volumeProposal += opportunities.filter(x=>calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).length
    LeadBacklog.push(volumeLead-volumeProposal)
  }
  let volumeLeadNY = opportunities.filter(x=> calculateFY(x.firstContactDate)>year).length
  let volumeProposalNY = opportunities.filter(x=> calculateFY(x.firstProposalDate)>year).length
  LeadBacklog.push(volumeLeadNY-volumeProposalNY)
  return LeadBacklog
}

const GetProposalBacklogFWVolume = () =>{
  const ProposalBacklog =["Proposal Backlog"]
  //ProposalBacklog.push("-")
  let volumeProposalLY = opportunities.filter(x=> calculateFY(x.firstProposalDate)<year).length
  let volumeContractLY = opportunities.filter(x=>calculateFY(x.contractSignatureDate)<year).length
  //lostContract += opportunities.filter(x=>x.status==5 && calculateFW(x.lostDate)==index).length
  ProposalBacklog.push(volumeProposalLY-volumeContractLY)
  let volumeProposal = 0;
  let volumeContract = 0;
  for (let index = 1; index < 53; index++) {
    
    volumeProposal += opportunities.filter(x=>calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).length
    volumeContract += opportunities.filter(x=>calculateFW(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate)==year).length
    //lostContract += opportunities.filter(x=>x.status==5 && calculateFW(x.lostDate)==index).length
    ProposalBacklog.push(volumeProposal-volumeContract)
 }
 let volumeProposalNY = opportunities.filter(x=> calculateFY(x.firstProposalDate)>year).length
 let volumeContractNY = opportunities.filter(x=> calculateFY(x.contractSignatureDate)>year).length
 //lostContract += opportunities.filter(x=>x.status==5 && calculateFW(x.lostDate)==index).length
 ProposalBacklog.push(volumeProposalNY-volumeContractNY)
 return ProposalBacklog
}

const GetLostProposalFWVolume = () =>{
  const LostProposal =["Lost Proposal"]
 // LostProposal.push("-")
 let lostContractLY = opportunities.filter(x=>x.status==5  && calculateFY(x.lostDate)<year).length
 LostProposal.push(lostContractLY)
  let lostContract = 0;
  for (let index = 1; index < 53; index++) {
    lostContract += opportunities.filter(x=>x.status==5 && calculateFW(x.lostDate)==index && calculateFY(x.lostDate)==year).length
    LostProposal.push(lostContract)
 }
 let lostContractNY = opportunities.filter(x=>x.status==5  && calculateFY(x.lostDate)>year).length
 LostProposal.push(lostContractNY)
 return LostProposal
}


const GetNetProposalBacklogFWVolume = () =>{
  const NetProposalBacklog =["Net Proposal Backlog"]
 // NetProposalBacklog.push("-")
 let volumeProposalLY = opportunities.filter(x=> calculateFY(x.firstProposalDate)<year).length
 let volumeContractLY = opportunities.filter(x=> calculateFY(x.contractSignatureDate)<year).length
 let lostContractLY = opportunities.filter(x=>x.status==5 && calculateFY(x.lostDate)<year).length
 NetProposalBacklog.push(volumeProposalLY-volumeContractLY-lostContractLY)

  let volumeProposal = 0;
  let volumeContract = 0;
  let lostContract = 0;
  for (let index = 1; index < 53; index++) {
    
    volumeProposal += opportunities.filter(x=>calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).length
    volumeContract += opportunities.filter(x=>calculateFW(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate)==year).length
    lostContract += opportunities.filter(x=>x.status==5 && calculateFW(x.lostDate)==index && calculateFY(x.lostDate)==year).length
    NetProposalBacklog.push(volumeProposal-volumeContract-lostContract)
 }

 let volumeProposalNY = opportunities.filter(x=> calculateFY(x.firstProposalDate)<year).length
 let volumeContractNY = opportunities.filter(x=> calculateFY(x.contractSignatureDate)>year).length
 let lostContractNY = opportunities.filter(x=>x.status==5 &&  calculateFY(x.lostDate)>year).length
 NetProposalBacklog.push(volumeProposalNY-volumeContractNY-lostContractNY)
 return NetProposalBacklog
}

/////////////////////////////////

const exportClickWithFWVolume =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-FW-Volume",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderFW(),
        body: GetBodyFWVolume()
      }
    });
    showMessage('Report downloaded successfully!')
    setActionLoading(false)
}

const GetHeaderFW = () =>{
  const header = ["Type/FW"]
  header.push("LY")
  for (let index = 1; index < 53; index++) {
    // if(index==1)
    // {
    //   header.push("LY")
    // }else{
    header.push(`FW${index}`)
   // }
  }
  header.push("NY")
  return header
}

const GetBodyFWVolume = () =>{
  const body =[GetNewLeadFWVolume(), GetNewProposalFWVolume(),GetNewContractFWVolume()]
  return body
}

const GetNewLeadFWVolume = () =>{
   const NewLeadVolume =["New Lead"]
  // NewLeadVolume.push(0)
  NewLeadVolume.push(opportunities.filter(x=> calculateFY(x.firstContactDate) < year).length)
   for (let index = 1; index < 53; index++) {
    NewLeadVolume.push(opportunities.filter(x=>calculateFW(x.firstContactDate)==index && calculateFY(x.firstContactDate) == year).length)
  }

  NewLeadVolume.push(opportunities.filter(x=> calculateFY(x.firstContactDate) > year).length)
  return NewLeadVolume
}

const GetNewProposalFWVolume = () =>{
  const NewProposalVolume =["New Proposal"]
  //NewProposalVolume.push(0)
  NewProposalVolume.push(opportunities.filter(x=> calculateFY(x.firstProposalDate) < year).length)
  for (let index = 1; index < 53; index++) {
    NewProposalVolume.push(opportunities.filter(x=>calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate) == year).length)
 }
 NewProposalVolume.push(opportunities.filter(x=> calculateFY(x.firstProposalDate) > year).length)
 return NewProposalVolume
}

const GetNewContractFWVolume = () =>{
  const NewContractVolume =["New Contract"]
  //NewContractVolume.push(0)
  NewContractVolume.push(opportunities.filter(x=> calculateFY(x.contractSignatureDate) < year).length)
  for (let index = 1; index < 53; index++) {
    NewContractVolume.push(opportunities.filter(x=>calculateFW(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate) == year).length)
 }
 NewContractVolume.push(opportunities.filter(x=>calculateFY(x.contractSignatureDate) > year).length)
 return NewContractVolume
}



const exportClickWithFWAmount =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-FW-Amount",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderFW(),
        body: GetBodyFWAmount()
      }
    });
    showMessage('Report downloaded successfully!')
    setActionLoading(false)
}

const GetBodyFWAmount = () =>{
  const body =[GetNewProposalAmount(),GetNewContractAmount()]
  return body
}



const GetNewProposalAmount = () =>{
  const NewProposalAmount =["New Proposal"]
 // NewProposalAmount.push(0)
 NewProposalAmount.push(Math.round(opportunities.filter(x=> calculateFY(x.firstProposalDate)<year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0))
 
//  .toLocaleString('en-US', {
//   style: 'currency',
//   currency: mapCurrency(currency),
// })
)

  for (let index = 1; index < 53; index++) {
    NewProposalAmount.push(opportunities.filter(x=>calculateFW(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0))
 }
 NewProposalAmount.push(opportunities.filter(x=> calculateFY(x.firstProposalDate)>year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0))
 return NewProposalAmount
}

const GetNewContractAmount = () =>{
  const NewContractAmount =["New Contract"]
 // NewContractAmount.push(0)
 NewContractAmount.push(opportunities.filter(x=> calculateFY(x.contractSignatureDate)<year).reduce(function(y, z) { return y +(z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0))
  for (let index = 1; index < 53; index++) {
    NewContractAmount.push(opportunities.filter(x=>calculateFW(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate)==year).reduce(function(y, z) { return y +(z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0))
 }
 NewContractAmount.push(opportunities.filter(x=>calculateFY(x.contractSignatureDate)>year).reduce(function(y, z) { return y +(z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0))
 return NewContractAmount
}




///////////////////////////



const exportClickWithFMVolume =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-FM-Volume",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderFM(),
        body: GetBodyFMVolume()
      }
    });
    showMessage('Report downloaded successfully!')
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

const GetBodyFMVolume = () =>{
  const body =[GetNewLeadFMVolume(), GetNewProposalFMVolume(),GetNewContractFMVolume()]
  return body
}

const GetNewLeadFMVolume = () =>{
   const NewLeadVolume =["New Lead"]
   NewLeadVolume.push("-")
   for (let index = 1; index < 13; index++) {
    NewLeadVolume.push(opportunities.filter(x=>calculateFM(x.firstContactDate)==index && calculateFY(x.firstContactDate)==year).length)
  }
  return NewLeadVolume
}

const GetNewProposalFMVolume = () =>{
  const NewProposalVolume =["New Proposal"]
  NewProposalVolume.push("-")
  for (let index = 1; index < 13; index++) {
    NewProposalVolume.push(opportunities.filter(x=>calculateFM(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).length)
 }
 return NewProposalVolume
}

const GetNewContractFMVolume = () =>{
  const NewContractVolume =["New Contract"]
  NewContractVolume.push("-")
  for (let index = 1; index < 13; index++) {
    NewContractVolume.push(opportunities.filter(x=>calculateFM(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate)==year).length)
 }
 return NewContractVolume
}



const exportClickWithFMAmount =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-FM-Amount",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderFM(),
        body: GetBodyFMAmount()
      }
    });
    showMessage('Report downloaded successfully!')
    setActionLoading(false)
}

const GetBodyFMAmount = () =>{
  const body =[GetNewProposalFMAmount(),GetNewContractFMAmount()]
  return body
}



const GetNewProposalFMAmount = () =>{
  const NewProposalAmount =["New Proposal"]
  NewProposalAmount.push("-")
  for (let index = 1; index < 13; index++) {
    NewProposalAmount.push(opportunities.filter(x=>calculateFM(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0))
 }
 return NewProposalAmount
}

const GetNewContractFMAmount = () =>{
  const NewContractAmount =["New Contract"]
  NewContractAmount.push("-")
  for (let index = 1; index < 13; index++) {
    NewContractAmount.push(opportunities.filter(x=>calculateFM(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate)==year).reduce(function(y, z) { return y +(z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0))
 }
 return NewContractAmount
}

//////////////////////////////////////////


const exportClickWithYTDVolume =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-YTD-Volume",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderYTD(),
        body: GetBodyYTDVolume()
      }
    });
    showMessage('Report downloaded successfully!')
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

const GetBodyYTDVolume = () =>{
  const body =[GetNewLeadYTDVolume(), GetNewProposalYTDVolume(),GetNewContractYTDVolume()]
  return body
}

const GetNewLeadYTDVolume = () =>{
   const NewLeadVolume =["New Lead"]
   NewLeadVolume.push("-")
   let volume = 0;
   for (let index = 1; index < 13; index++) { 
    volume += opportunities.filter(x=>calculateFM(x.firstContactDate)==index && calculateFY(x.firstContactDate)==year).length
    NewLeadVolume.push(volume)
  }
  return NewLeadVolume
}

const GetNewProposalYTDVolume = () =>{
  const NewProposalVolume =["New Proposal"]
  NewProposalVolume.push("-")
  let volume = 0;
  for (let index = 1; index < 13; index++) {
    volume += opportunities.filter(x=>calculateFM(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).length
    NewProposalVolume.push(volume)
 }
 return NewProposalVolume
}

const GetNewContractYTDVolume = () =>{
  const NewContractVolume =["New Contract"]
  NewContractVolume.push("-")
  let volume = 0;
  for (let index = 1; index < 13; index++) {
    volume += opportunities.filter(x=>calculateFM(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate)==year).length
    NewContractVolume.push(volume)
 }
 return NewContractVolume
}



const exportClickWithYTDAmount =  () => {
  setActionLoading(true)
  showLoadingMessage('loading...')
    //await exportOpportunities({ status:searchStatus ,lineOfBusinessesIds:searchLineOfBusinessIds,fromDate:searchDateFrom!=""? searchDateFrom:null,toDate:searchDateTo!=""?searchDateTo:null}).unwrap()
    downloadExcel({
      fileName: "Opportunities-Export-YTD-Amount",
      sheet: "Opportunities",
      tablePayload: {
        header: GetHeaderYTD(),
        body: GetBodyYTDAmount()
      }
    });
    showMessage('Report downloaded successfully!')
    setActionLoading(false)
}

const GetBodyYTDAmount = () =>{
  const body =[GetNewProposalYTDAmount(),GetNewContractYTDAmount()]
  return body
}



const GetNewProposalYTDAmount = () =>{
  const NewProposalAmount =["New Proposal"]
  NewProposalAmount.push("-")
  let amount =0;
  for (let index = 1; index < 13; index++) {
    amount+= opportunities.filter(x=>calculateFM(x.firstProposalDate)==index && calculateFY(x.firstProposalDate)==year).reduce(function(y, z) { return y + (z.firstProposalValue ? convertCurrency(z.firstProposalValue,z.firstProposalValueCurrency,toCurrency) : 0) }, 0)
    NewProposalAmount.push(amount)
 }
 return NewProposalAmount
}

const GetNewContractYTDAmount = () =>{
  const NewContractAmount =["New Contract"]
  NewContractAmount.push("-")
  let amount =0;
  for (let index = 1; index < 13; index++) {
    amount+=opportunities.filter(x=>calculateFM(x.contractSignatureDate)==index && calculateFY(x.contractSignatureDate)==year).reduce(function(y, z) { return y +(z.finalContractValue ? convertCurrency(z.finalContractValue,z.finalContractValueCurrency,toCurrency) : 0) }, 0)
    NewContractAmount.push(amount)
 }
 return NewContractAmount
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
          FirstContractToProposalCCT1:x.firstProposalDate?subtractTwoDates(x.firstContactDate,x.firstProposalDate):"", 
          PorposalToContractCCT2:x.contractSignatureDate?subtractTwoDates(x.firstProposalDate,x.contractSignatureDate):"", 
          DiscountRate:x.finalContractValue? `${Math.round((1 - (x.finalContractValue /x.firstProposalValue))*100)}%` :"", 
          RunRate:x.retainerValidatity!=null && x.retainerValidatity!=""? x.finalContractValue/x.retainerValidatity:"", 
          RunWay:x.retainerValidatity!=null && x.retainerValidatity!=""?x.retainerValidatity/12:"", 
          ProposalCNC:x.firstProposalValueCurrency?Currencies.find(y=>y.value==x.firstProposalValueCurrency).label:"", 
          ContractCNC:x.finalContractValueCurrency?Currencies.find(y=>y.value==x.finalContractValueCurrency).label:""
        }))
      }
    });
    showMessage('Report downloaded successfully!')
    setActionLoading(false)
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

const handleChangeInputDate =   (date, dateString) => {
  // setWeek(calculateFW(dateString))
  // setMonth(calculateFM(dateString))
  setYear(calculateFY(dateString))
}
 


  return (
    <>
    <Descriptions title="Opportunities Listing for calculations"></Descriptions>
 
 
         
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
         <Col className="gutter-row" span={4}>
         <Form.Item>
         <Select name="searchStatus"
      allowClear
      options= {OpportunityStatuses}
      onChange={handleSearchStatus}
      placeholder="Select status to search with"
    />
             </Form.Item>
         
           </Col>

           <Col className="gutter-row" span={4}>
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
       <Form.Item
         label=""
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

           <Col className="gutter-row" span={4}>
         <Form.Item>
         <RangePicker name="searchDates" onChange={handleChangeSearchDates} />
             </Form.Item>
         
           </Col>

           {allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','CommercialManager']) ? (<>
           <Col className="gutter-row" span={3}> 
        


<Button  onClick={exportClickWithCalc}   disabled={actionLoading} type="primary" >Basic calculation</Button>

</Col>
{/* 
<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithFWVolume}   disabled={actionLoading} type="primary" >FW volume</Button>

</Col>

<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithFWAmount}   disabled={actionLoading} type="primary" >FW amount</Button>

</Col>

<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithFMVolume}   disabled={actionLoading} type="primary" >FM volume</Button>

</Col>

<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithFMAmount}   disabled={actionLoading} type="primary" >FM amount</Button>

</Col>

<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithYTDVolume}   disabled={actionLoading} type="primary" >YTD volume</Button>

</Col>

<Col className="gutter-row" span={2.5}> 

<Button  onClick={exportClickWithYTDAmount}   disabled={actionLoading} type="primary" >YTD amount</Button>

</Col> 



<Col className="gutter-row" span={3}> 

<Button  onClick={exportClickWithFWBackLogVolume}   disabled={actionLoading} type="primary" >Backlog FW Vol</Button>

</Col> 

<Col className="gutter-row" span={3}> 

<Button  onClick={exportClickWithFWBackLogAmount}   disabled={actionLoading} type="primary" >Backlog FW Amount</Button>

</Col> 

<Col className="gutter-row" span={4}> 

<Button  onClick={exportClickWithYTDClientSegVol}   disabled={actionLoading} type="primary" >YTD Client Segmentation Vol</Button>

</Col> 

<Col className="gutter-row" span={5}> 

<Button  onClick={exportClickWithYTDClientSegAmount}   disabled={actionLoading} type="primary" >YTD Client Segmentation Amount</Button>

</Col> 

<Col className="gutter-row" span={5}> 

<Button  onClick={exportClickWithOpportunitiesFunnel}   disabled={actionLoading} type="primary" >Opprotunities projects Funnel</Button>

</Col> 

<Col className="gutter-row" span={5}> 

<Button  onClick={exportClickWithYTDClientSegAmountRetainer}   disabled={actionLoading} type="primary" >YTD Client Segmentation Retainer</Button>

</Col> 

<Col className="gutter-row" span={5}> 

<Button  onClick={exportClickWithOpportunitiesFunnelRetainer}   disabled={actionLoading} type="primary" >Opprotunities Retainer Funnel</Button>

</Col> 

<Col className="gutter-row" span={5}> 

<Button  onClick={exportClickWithOpportunitiesCCTPercentile}   disabled={actionLoading} type="primary" >Opprotunities CCT1/2 percentile</Button>

</Col> 

<Col className="gutter-row" span={5}> 

<Button  onClick={exportClickWithOpportunitiesCCTPercentileRetainer}   disabled={actionLoading} type="primary" >Opprotunities CCT1/2 percentile Retainer</Button>

</Col>  */}

<Col className="gutter-row" span={2}> 

<Button  onClick={exportAll}   disabled={actionLoading} type="primary" >Commercial Engine</Button>

</Col> 

       
</>
):null}
          
          
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

export default CommercialCalculations
