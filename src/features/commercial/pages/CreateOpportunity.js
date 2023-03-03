import {useRef, useState, useEffect, React} from 'react'
import { useGetCompaniesMutation,useGetOpportunitiesMutation,useSaveOpportunityMutation,useDeleteOpportunityMutation,useUpdateOpportunityMutation,useSaveClientMutation } from "../slices/opportunityApiSlice"
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

function CreateOpportunity() {

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
      title: 'Retainer Vaidity (# of months)',
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
    pageSizeOptions: [1,5,10,20,50,100],
    position: 'bottomCenter'
  });
 
  const [form] = Form.useForm();
  const key = 'updatable';


  const [invalid, setInvalid] = useState(false);
  const [actionLoading, setActionLoading] = useState(false)

const [saveOpportunity ] = useSaveOpportunityMutation();
//const [saveClient] = useSaveClientMutation();
const [deleteOpportunity] = useDeleteOpportunityMutation()
//const [updateOpportunity] = useUpdateOpportunityMutation()

const [getOpportunities , { isLoading }] = useGetOpportunitiesMutation();
const [opportunities, setOpportunities] = useState([])
const [getCompanies] = useGetCompaniesMutation();
const [companiesOptions, setCompaniesOptions] = useState([])
const [clientCompaniesOptions, setClientCompaniesOptions] = useState([])
const [companies, setCompanies] = useState([])

const [clientName, setClientName] = useState('')
const [clientDescription, setClientDescription] = useState('')


//const [status, setStatus] = useState(-1)
const [projectName, setProjectName] = useState('')

const [clientId, setClientId] = useState(-1)
const [clients, setClients] = useState([])
const [clientStatus, setClientStatus] = useState(-1)
const [source, setSource] = useState('')
const [scope, setScope] = useState(-1)
const [firstContactDate, setFirstContactDate] = useState('')
// const [firstProposalDate, setFirstProposalDate] = useState('')
// const [firstProposalValue, setFirstProposalValue] = useState(0)
// const [FirstProposalValueCurrncey, setFirstProposalValueCurrncey] = useState(-1)
// const [currentProposalValue, setCurrentProposalValue] = useState(0)
// const [currentProposalValueCurrncey, setCurrentProposalValueCurrncey] = useState(-1)
// const [contractSignatureDate, setContractSignatureDate] = useState('')
// const [finalContractValue, setFinalContractValue] = useState(0)
// const [finalContractValueCurrncey, setFinalContractValueCurrncey] = useState(-1)
// const [retainerValidatity, setRetainerValidatity] = useState(0)
const [note, setNote] = useState('')

const [lineOfBusinessId, setLineOfBusinessId] = useState(-1)



const [searchLineOfBusinessIds, setSearchLineOfBusinessIds] = useState([])
const [clientLineOfBusinessIds, setClientLineOfBusinessIds] = useState([])

const [searchDateFrom, setSearchDateFrom] = useState("")
const [searchDateTo, setSearchDateTo] = useState("")
const [searchStatus, setSearchStatus] = useState(-1)


//const handleNameInput =   (e) =>  setName(e.target.value)

const handleClientNameInput =   (e) =>  setClientName(e.target.value)
const handleClientDescInput =   (e) =>  setClientDescription(e.target.value)


const handleChangeClient =   (value) => {
  if(value[0]>0){
    setClientStatus(1)
    form.setFieldsValue({
      clientStatus:1
    });
  }else{
    setClientStatus(0)
    form.setFieldsValue({
      clientStatus:0
    });
  }
  setClientId(value[0])}

const handleChangeSource =   (value) => setSource(value)

const handleChangeScope =   (value) => setScope(value)

const handleChangeClientStatus =   (value) => setClientStatus(value)
const handleChangeFirstContactDate =   (date, dateString) => setFirstContactDate(dateString)
const handleChangeProjectName =   (e) => setProjectName(e.target.value)
const handleChangeNote =   (e) => setNote(e.target.value)

const handleChangeSearchDates = (dates, datesString) => {
  setSearchDateFrom(datesString[0])
  setSearchDateTo(datesString[1])
  loadOpportunties(searchStatus,pagination.current,pagination.pageSize,searchLineOfBusinessIds,datesString[0],datesString[1])
  }



const handleSearchStatus = (args) => {
  console.log(args)
  setSearchStatus(args)
  loadOpportunties(args,pagination.current,pagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
}



// const handleSearchProjectNameInput =  async (e) => {
//   e.preventDefault()
//   setSearchProjectName(e.target.value)
//   if(e.target.value.length>3){
//     loadOpportunties(e.target.value, 1, pagination.pageSize,searchLineOfBusinessIds)
//   }else{
//     loadOpportunties("",1, pagination.pageSize,searchLineOfBusinessIds)
//   }
// }




const loadOpportunties = async (status,page,pageSize,lineOfBusinessesIds,fromDate,toDate) =>{

  console.log({ status, page, pageSize,lineOfBusinessesIds,fromDate,toDate})

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



const handleChangeLineOfBusiness =   (value) => {
  console.log(value)
  if (value != "" && value !=null && value.length>1){
    console.log(value[1])
  setLineOfBusinessId(value[1])
  var lob1
  companies.forEach(element => {
    var lob=element.lineOfBusinesses.find(x=>x.id===value[1])
    if(lob){
      lob1=lob
    }
  });
  console.log(lob1.clients)

  if(lob1.isRetainer==true){
    setScope(OpportunityScopes.find(x=>x.label=="Retainer").value)

    form.setFieldsValue({
      scope:OpportunityScopes.find(x=>x.label=="Retainer").value
    });

  }else if(lob1.isRetainer==false){
    setScope(OpportunityScopes.find(x=>x.label=="Project").value)

    form.setFieldsValue({
      scope:OpportunityScopes.find(x=>x.label=="Project").value
    });
  }else{
    setScope(-1)

    form.setFieldsValue({
      scope:null
    });
  }
  
  setClients(lob1.clients.map(x=> ({label:x.name,value:x.id})))
  transformLineOfBusinesses2([...companies.filter(x=>x.id == value[0])])
  }else{
    setClients([])
    setScope(-1)

    form.setFieldsValue({
      scope:null
    });
  }
}

const handleChangeClientLineOfBusinessesIds = (value) =>{
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
  setClientLineOfBusinessIds(lobIds)
  }else{
    setClientLineOfBusinessIds([])
  }
}

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

const transformLineOfBusinesses2 = (comapniesArray) =>{
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
  setClientCompaniesOptions(lineOfBusinessesArray)
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
    await deleteOpportunity({Id: id}).unwrap()
    showMessage('Opportunity deleted successfully!')
   loadOpportunties(-1, 1, pagination.pageSize,[],"","")
    reset()
    
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const addClient = async () => {
    setInvalid(false)
    if(clientName!= "" && clientDescription!="" && lineOfBusinessId!=-1 && clientLineOfBusinessIds != "" &&  clientLineOfBusinessIds != null && clientLineOfBusinessIds != []){
    
    var c = clients.filter(x=>x.value!=-2)
    setClients(c)
    setClients([...c,{label:clientName,value:-2}])
    console.log(c)
    setClientId(-2)
    setClientStatus(0)

    form.setFieldsValue({
      clientId: -2,
      clientStatus: 0,
    });
    hide()
  }else{
    setInvalid(true)
  }

   
    // var lobId = lineOfBusinessId
    //   setActionLoading(true)
    //       showLoadingMessage('loading...')
       
    //     await saveClient({Name:clientName, Description:clientDescription, lineOfBusinessId}).unwrap()
    //       showMessage('Client created successfully!')

    //       var companiesArray = await getCompanies({}).unwrap()
    //       setCompanies(companiesArray)
   
    //       transformLineOfBusinesses(companiesArray)

    //       setLineOfBusinessId(lobId)
    //       //set client id
    //       setClientId(companies)

    //       //set form 

  }


const onFinish = async (values) => {
  
  
          setActionLoading(true)
          showLoadingMessage('loading...')

          const opportunity = {
            ProjectName:projectName,
            LineOfBusinessId:lineOfBusinessId,
            ClientId:clientId,
            FirstContactDate:firstContactDate,
            ClientStatus:clientStatus,
            Scope:scope,
            Source:source,
            //Client:null,
            Note:note
          }

          if(clientId==-2){
            opportunity.Client={Name:clientName, Description:clientDescription, LineOfBusinesses: clientLineOfBusinessIds.map(x=>({Id:x}))}
          }

          console.log(opportunity)

       
        await saveOpportunity(opportunity).unwrap()
          showMessage('Opportunity created successfully!')
        
          var companiesArray = await getCompanies({}).unwrap()
          setCompanies(companiesArray)
         
          transformLineOfBusinesses(companiesArray)
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
  
  setLineOfBusinessId(-1)
  setClientId(-1)
  setClientName("")
  setClientStatus(-1)
  setFirstContactDate("")
  setClientDescription("")
  setProjectName("")
  setNote("")
  setScope(-1)
  setSource(-1)

  setSearchStatus(-1)
  setSearchLineOfBusinessIds([])
  setSearchDateFrom("")
  setSearchDateTo("")

  setActionLoading(false)

  form.setFieldsValue({
    lineOfBusinessId: null,
    searchLineOfBusinessIds:[],
    searchStatus:null,
    scope:null,
    source:null,
    firstContactDate:null,
    note:"",
    clientName:"",
    clientDescription:"",
    clientStatus:null,
    clientId:null,
    projectName: "",
    searchDates:null
  });
}


const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);


  const [open, setOpen] = useState(false);

  const hide = () => {
    console.log("hide")
    setOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };


  return (
    <>
    <Descriptions title="Create New Opportunity"></Descriptions>
 
 
              
         <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 150,
           }}
         >
        
         <Descriptions title="New Opportunity"></Descriptions>
        
         <Form
         style={{paddingLeft:15}}
       name="basic"
       labelCol={{
         span: 24,
       }}
       wrapperCol={{
         span: 24,
       }}
       initialValues={{
         remember: true,
       }}
       form={form}
       onFinish={onFinish}
       onFinishFailed={onFinishFailed}
       autoComplete="off"
     >
         <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}>

<Col className="gutter-row" span={6}> 
       <Form.Item
         label="Line Of Business"
         name="lineOfBusinessId"
         rules={[
           {
             required: true,
             message: 'Please select line of business!',
           },
         ]}
       >
         <Cascader
    options={companiesOptions}
    onChange={handleChangeLineOfBusiness}
    placeholder="Please select line of business"
    showSearch={{
      filter,
    }}
    onSearch={(value) => console.log(value)}
  />
   </Form.Item>
       
        </Col>



       <Col className="gutter-row" span={6}>
       <Form.Item
         label="Client Name"
         name="clientId"
         rules={[
           {
             required: true,
             message: 'Please choose Client!',
           },
         ]}
       >
           <Cascader
    options={clients}
    onChange={handleChangeClient}
    placeholder="Please select client"
    showSearch={{
      filter,
    }}
    onSearch={(value) => console.log(value)}
  />
          </Form.Item>
         
           </Col>
           <Col>
           <Popover
      content={<>
      <Input disabled={lineOfBusinessId==-1} placeholder='Name' name="clientName" onChange={handleClientNameInput}></Input>
      <Input disabled={lineOfBusinessId==-1} placeholder='Description' name="clientDescription" onChange={handleClientDescInput}></Input>
      <Cascader
         name="clientLineOfBusinessIds"
    options={clientCompaniesOptions}
    onChange={handleChangeClientLineOfBusinessesIds}
    placeholder="Please select line of business(es)"
    showSearch={{
      filter,
    }}
    disabled={lineOfBusinessId==-1}
    multiple
    maxTagCount="responsive"
    onSearch={(value) => console.log(value)}
  />
      <Button disabled={clientLineOfBusinessIds==-1&&clientName===''&&clientDescription===''} type="primary" onClick={addClient}>Add</Button>
      {/* <a onClick={hide}>Close</a> */}
      {invalid? <Descriptions size="small" contentStyle={{color:"red"}}>Please fill name and desc and lob</Descriptions> : null}
      </>}
      title="New Client"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Button style={{marginTop:39}}  disabled={lineOfBusinessId==-1} type="primary">Add new client</Button>
    </Popover>
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Client Status"
         name="clientStatus"
         rules={[
           {
             required: true,
             message: 'Please choose Client status!',
           },
         ]}
       >
          <Select
      //defaultValue="New"
      disabled
      allowClear
      options={ClientStatuses}
      placeholder="Please enter client status"
      onChange={handleChangeClientStatus}
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
       <Form.Item
         label="Project Name"
         name="projectName"
         rules={[
           {
             required: true,
             message: 'Please input Project name!',
           },
         ]}
       >
          <Input  placeholder="Enter Project name"  
            onChange={handleChangeProjectName} />
          </Form.Item>
    
           </Col>
           

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Source"
         name="source"
         rules={[
           {
             required: true,
             message: 'Please input opportunity source!',
           },
         ]}
       >
          <Select
      allowClear
      options= {OpportunitySources}
      placeholder="Please enter opportunity source"
      onChange={handleChangeSource}
    />

          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Scope"
         name="scope"
         rules={[
           {
             required: true,
             message: 'Please choose opportunity scope!',
           },
         ]}
       >
          <Select
      allowClear
      options={OpportunityScopes}
      placeholder="Please enter opportunity scope"
      onChange={handleChangeScope}
      disabled
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
       <Form.Item
         label="First Contact date"
         name="firstContactDate"
         rules={[
           {
             required: true,
             message: 'Please input first contact date!',
           },
         ]}
       
       >
          <DatePicker style={{ width: 295 }}
          onChange={handleChangeFirstContactDate}
          />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Note"
         name="note"
       >
          <Input onChange={handleChangeNote}  placeholder="Enter Opportunity note"  
             />
          </Form.Item>
    
           </Col>
        
        <Col className="gutter-row" span={6}> 
        
          <Button style={{width:"100px",marginTop:39}}   disabled={actionLoading} type="primary" htmlType="submit">
         Save
        </Button>
 </Col>
     </Row>
     </Form>
        
             
             </div>
            
 
 
             <div
           
           style={{
             padding: 10,
             minHeight: 20,
           }}
         >
         </div>
         
             <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 150,
           }}
         >
       
       <Descriptions title="Opportunity list"></Descriptions>
 
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

           <Col className="gutter-row" span={8}>
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

export default CreateOpportunity
