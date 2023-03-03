

import {useRef, useState, useEffect, React} from 'react'
import { useLocation } from 'react-router-dom'
import { useGetCompaniesMutation,useGetOpportunityByIdMutation,useUpdateOpportunityMutation } from "../slices/opportunityApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select,Cascader,DatePicker,InputNumber } from 'antd';
import {OpportunityStatuses,OpportunitySources,ClientStatuses,OpportunityScopes, Currencies} from "../../Common/lookups";
import moment from 'moment';


function ProgressOpportunity() {
  const location = useLocation()
  const { id } = location.state

  console.log(id)

  const { Option } = Select;

  const roles = useSelector(selectCurrentUserRoles);
  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }


  


  
 
  const [form] = Form.useForm();
  const key = 'updatable';


  const [isEdit, setIsEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState(false)

//const [save ] = useSaveMilestoneMutation();
//const [deleteOpportunity] = useDeleteOpportunityMutation()
const [updateOpportunity] = useUpdateOpportunityMutation()

const [getOpportunityById , { isLoading }] = useGetOpportunityByIdMutation();
//const [opportunity, setOpportunity] = useState(opportunitiesList[id-1])
const [getCompanies] = useGetCompaniesMutation();
const [companiesOptions, setCompaniesOptions] = useState([])
const [companies, setCompanies] = useState([])



const [projectName, setProjectName] = useState('')
const [status, setStatus] = useState(-1)
const [statusOptions, setStatusOptions] = useState([])

const [clientId, setClientId] = useState(-1)
const [clients, setClients] = useState([])
const [clientStatus, setClientStatus] = useState(-1)
const [source, setSource] = useState('')
const [scope, setScope] = useState(-1)
const [firstContactDate, setFirstContactDate] = useState('')
const [firstProposalDate, setFirstProposalDate] = useState('')
const [firstProposalValue, setFirstProposalValue] = useState(0)
const [firstProposalValueCurrency, setFirstProposalValueCurrency] = useState(0)
const [currentProposalValue, setCurrentProposalValue] = useState(0)
const [currentProposalValueCurrency, setCurrentProposalValueCurrency] = useState(0)
const [contractSignatureDate, setContractSignatureDate] = useState('')
const [finalContractValue, setFinalContractValue] = useState(0)
const [finalContractValueCurrency, setFinalContractValueCurrency] = useState(0)
const [retainerValidatity, setRetainerValidatity] = useState(0)
const [note, setNote] = useState('')

const [lineOfBusinessId, setLineOfBusinessId] = useState(-1)




const [fromStatus, setFromStatus] = useState("")
const [fromStatusValue, setFromStatusValue] = useState(0)
const [toStatus, setToStatus] = useState("")

const [isFunnel, setIsFunnel] = useState(false)
const [isApproved, setIsApproved] = useState(false)
const [isProposed, setIsProposed] = useState(false)
const [isWon, setIsWon] = useState(false)
const [isLost, setIsLost] = useState(false)
const [isRetainer, setIsRetainer] = useState(false)

const handleChangeClient =   (value) => setClientId(value[0])

const handleChangeSource =   (value) => setSource(value)

const handleChangeScope =   (value) => {
  setScope(value)}

const handleChangeFirstContactDate =   (date, dateString) => setFirstContactDate(dateString)
const handleChangeProjectName =   (e) => setProjectName(e.target.value)


const handleChangeClientStatus =   (value) => setClientStatus(value)

const handleChangeNote =   (e) => setNote(e.target.value)

const handleChangeContactSignatureDate =   (date, dateString) => setContractSignatureDate(dateString)
const handleChangeFinalContractValue =   (e) => setFinalContractValue(e)
const handleChangeFinalContractValueCurrency =   (value) => setFinalContractValueCurrency(value)

const handleChangeCurrentProposalValue =   (e) => setCurrentProposalValue(e)
const handleChangeCurrentProposalValueCurrency =   (value) => setCurrentProposalValueCurrency(value)

const handleChangeFirstProposalDate =   (date, dateString) => setFirstProposalDate(dateString)
const handleChangeFirstProposalValue =   (e) => setFirstProposalValue(e)
const handleChangeFirstProposalValueCurrency =   (value) => setFirstProposalValueCurrency(value)
const handleChangeRetainerValidatity =   (e) => setRetainerValidatity(e.target.value)


const handleChangeLineOfBusiness =   (value) => {
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
  
  setClients(lob1.clients.map(x=> ({label:x.name,value:x.id})))
  }else{
    setClients([])
  }
}



const loadOpportunity = async () =>{

 const opportunity = await getOpportunityById({id}).unwrap()

 console.log(opportunity)
 
 setLineOfBusinessId(opportunity.lineOFBusinessId)
 
  setFirstContactDate(opportunity.firstContactDate)
  setProjectName(opportunity.projectName)
  setNote(opportunity.note)
  setScope(opportunity.scope)
  setSource(opportunity.source)
  setStatus(opportunity.status)
  setClientStatus(opportunity.clientStatus)
  setClients([{label:opportunity.client.name,value:opportunity.client.id}])
  setClientId(opportunity.clientId)
  setFirstProposalDate(opportunity.firstProposalDate !=null?opportunity.firstProposalDate:"")
  setFirstProposalValue(opportunity.firstProposalValue)
  setFirstProposalValueCurrency(opportunity.firstProposalValueCurrency != null?opportunity.firstProposalValueCurrency:0)
  setContractSignatureDate(opportunity.contractSignatureDate !=null?opportunity.contractSignatureDate:"")
  setCurrentProposalValue(opportunity.currentProposalValue)
  setCurrentProposalValueCurrency(opportunity.currentProposalValueCurrency!= null?opportunity.currentProposalValueCurrency:0)
  setFinalContractValue(opportunity.finalContractValue)
  setFinalContractValueCurrency(opportunity.finalContractValueCurrency!= null?opportunity.finalContractValueCurrency:0)
  setRetainerValidatity(opportunity.retainerValidatity)
  
  getToAndFromStatus(opportunity.status)

  setStatusOptions(OpportunityStatuses.map(x=>({label:x.label,value:x.value,disabled:x.value<opportunity.status})))

  console.log(opportunity.scope)
  console.log(OpportunityScopes.find(x=>x.label=="Retainer").value)
  console.log(isRetainer)
  if(opportunity.lineOfBusiness.isRetainer || opportunity.scope==OpportunityScopes.find(x=>x.label=="Retainer").value){
    console.log(isRetainer)
    setIsRetainer(true)
  }

  form.setFieldsValue({
    lineOfBusinessId:[opportunity.lineOfBusiness.company.id,opportunity.lineOfBusinessId],
    scope:opportunity.scope,
    source:opportunity.source,
    firstContactDate:moment(opportunity.firstContactDate),
    note:opportunity.note,
    clientStatus:opportunity.clientStatus,
    clientId:opportunity.clientId,
    projectName: opportunity.projectName,
   firstProposalDate:opportunity.firstProposalDate !=null?moment(opportunity.firstProposalDate):"",
    firstProposalValue:opportunity.firstProposalValue,
    //firstProposalValueCurrency:opportunity.firstProposalValueCurrency!= null?opportunity.firstProposalValueCurrency:0,
    contractSignatureDate:opportunity.contractSignatureDate !=null?moment(opportunity.contractSignatureDate):"" ,
  currentProposalValue:opportunity.currentProposalValue,
 // currentProposalValueCurrency:opportunity.currentProposalValueCurrency!= null?opportunity.currentProposalValueCurrency:0,
  finalContractValue:opportunity.finalContractValue,
  //finalContractValueCurrency:opportunity.finalContractValueCurrency!= null?opportunity.finalContractValueCurrency:0,
  retainerValidatity:opportunity.retainerValidatity,
  });
  
}







useEffect( () =>{ 
  async function fetchMyAPI() {

    console.log(id)
   

    console.log(fromStatus)
    console.log(toStatus)
  
    var companiesArray = await getCompanies({}).unwrap()
    setCompanies(companiesArray)
   
    transformLineOfBusinesses(companiesArray)
    loadOpportunity()
    
  }
  fetchMyAPI()
}, [])


const getToAndFromStatus = (status) => {
  if(status!=4&& status!=5){
  setFromStatus(status)
  setToStatus(status+1)
  setStatus(status+1)
  setIsFunnel(status+1 == OpportunityStatuses.find(x=>x.label=="Funnel").value)
  setIsProposed(status+1 == OpportunityStatuses.find(x=>x.label=="Proposed").value)
  setIsApproved(status+1 ==OpportunityStatuses.find(x=>x.label=="Approved").value)
  setIsWon(status+1 == OpportunityStatuses.find(x=>x.label=="Won").value)
  setIsLost(status+1 == OpportunityStatuses.find(x=>x.label=="Lost").value)
  
  form.setFieldsValue({
    fromStatus: status,
    toStatus: status+1,
  });
}else{
  setFromStatus(status)
  setToStatus(status)
  setStatus(status)
  setIsWon(status == OpportunityStatuses.find(x=>x.label=="Won").value)
  setIsLost(status == OpportunityStatuses.find(x=>x.label=="Lost").value)

  form.setFieldsValue({
    fromStatus: status,
    toStatus: status,
  });
}
  // if (status=="New"){
  //   setFromStatus(status)
  //   setFromStatusValue(0)
  //   setToStatus("Funnel")
  //   setIsFunnel(true)
  //   form.setFieldsValue({
  //     fromStatus: "New",
  //     toStatus: "Funnel",
  //   });
  // }else if (status=="Funnel"){
  //   setFromStatus("Funnel")
  //   setFromStatusValue(1)
  //   setToStatus("Approved")
  //   setIsApproved(true)
  //   form.setFieldsValue({
  //     fromStatus: "Funnel",
  //     toStatus: "Approved",
  //   });
  // }else if (status=="Approved"){
  //   setFromStatus("Approved")
  //   setFromStatusValue(2)
  //   setToStatus("Proposed")
  //   setIsProposed(true)
  //   form.setFieldsValue({
  //     fromStatus: "Approved",
  //     toStatus: "Proposed",
  //   });
  // }else if (status=="Proposed"){
  //   setFromStatus("Proposed")
  //   setFromStatusValue(3)
  //   setToStatus("Won")
  //   setIsWon(true)
  //   form.setFieldsValue({
  //     fromStatus: "Proposed",
  //     toStatus: "Won",
  //   });
   
  // }
  console.log(fromStatus)
  console.log(toStatus)
  console.log(fromStatusValue)
}

const handleToStatusChange = (value) =>{
  setToStatus(value)
  setStatus(value)
  setIsFunnel(value == OpportunityStatuses.find(x=>x.label=="Funnel").value)
  setIsProposed(value == OpportunityStatuses.find(x=>x.label=="Proposed").value)
  setIsApproved(value ==OpportunityStatuses.find(x=>x.label=="Approved").value)
  setIsWon(value == OpportunityStatuses.find(x=>x.label=="Won").value)
  setIsLost(value == OpportunityStatuses.find(x=>x.label=="Lost").value)
  // if (value=="Funnel"){
  //   setIsFunnel(true)
  //   setIsApproved(false)
  //   setIsProposed(false)
  //   setIsWon(false)
  //   setIsLost(false)
  // }else if (value=="Approved"){
  //   setIsApproved(true)
  //   setIsFunnel(false)
  //   setIsProposed(false)
  //   setIsWon(false)
  //   setIsLost(false)
  // }else if (value=="Proposed"){
  //   setIsProposed(true)
  //   setIsFunnel(false)
  //   setIsApproved(false)
  //   setIsWon(false)
  //   setIsLost(false)
  // }else if (value=="Won"){
  //   setIsWon(true)
  //   setIsFunnel(false)
  //   setIsApproved(false)
  //   setIsProposed(false)
  //   setIsLost(false)
  // }else if (value=="Lost"){
  //   setIsLost(true)
  //   setIsFunnel(false)
  //   setIsApproved(false)
  //   setIsProposed(false)
  //   setIsWon(false)
  // }
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







  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

const onFinish = async (values) => {
  
  
          setActionLoading(true)
          showLoadingMessage('loading...')

          const opportunity = {
            Id:id,
            ProjectName:projectName,
            LineOfBusinessId:lineOfBusinessId,
            ClientId:clientId,
            FirstContactDate:firstContactDate,
            ClientStatus:clientStatus,
            Scope:scope,
            Source:source,
            Status:status,
    Note:note,
    FirstProposalDate:firstProposalDate!=""?firstProposalDate:null,
    FirstProposalValue:firstProposalValue!=""?firstProposalValue:null,
    FirstProposalValueCurrency:firstProposalValue!=""?firstProposalValueCurrency:null,
    ContractSignatureDate:contractSignatureDate!=""?contractSignatureDate:null,
    CurrentProposalValue:currentProposalValue!=""?currentProposalValue:null,
    CurrentProposalValueCurrency:currentProposalValue!=""?currentProposalValueCurrency:null,
    FinalContractValue:finalContractValue!=""?finalContractValue:null,
    FinalContractValueCurrency:finalContractValue!=""?finalContractValueCurrency:null,
    RetainerValidatity:retainerValidatity!=""?retainerValidatity:null,
          }

          console.log(opportunity)

        await updateOpportunity(opportunity).unwrap()
        showMessage('opportunity updated successfully!')
        setActionLoading(false)

        loadOpportunity()
       
        // update from and to statuses
    
   
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

  const selectFirstProposalValueAfter =  (
    

    <Select
          options={Currencies}
          style={{ width: 60 }}
          name="firstProposalValueCurrency"
          onChange={handleChangeFirstProposalValueCurrency}
         // placeholder="Select Contract value currency"
         disabled={fromStatus>1}
         value={firstProposalValueCurrency}
          defaultValue="0"
        />
       
    );

    const selectCurrentProposalValueAfter =  (
    
      
      <Select
            options={Currencies}
            style={{ width: 60 }}
            name="currentProposalValueCurrency"
            onChange={handleChangeCurrentProposalValueCurrency}
            //placeholder="Select Contract value currency"
            disabled={fromStatus>2}
            value={currentProposalValueCurrency}
            defaultValue="0"
          />
         
      );

      const selectFinalContractValueAfter =  (
      

        <Select
              options={Currencies}
              style={{ width: 60 }}
              name="finalContractValueCurrency"
              onChange={handleChangeFinalContractValueCurrency}
             // placeholder="Select Contract value currency"
             disabled={fromStatus>3}
             value={finalContractValueCurrency}
              defaultValue="0"
            />
           
        );




const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);


  return (
    <>
    <Descriptions title="Progress Opportunity"></Descriptions>
 
 
              
         <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 150,
           }}
         >
        
         <Descriptions title="Opportunity"></Descriptions>
        
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
         label="From"
         name="fromStatus"
       >
        <Select
      allowClear
     // onChange={handleToStatusChange}
      options={OpportunityStatuses}
      disabled
    />
   </Form.Item>
       
        </Col>



       <Col className="gutter-row" span={6}>
       <Form.Item
         label="To"
         name="toStatus"
         rules={[
           {
             required: true,
             message: 'Please enter new status!',
           },
         ]}
       >
           <Select
      allowClear
      onChange={handleToStatusChange}
      options={statusOptions}
      disabled={fromStatus>3}
    />
          </Form.Item>
    
           </Col>

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
    disabled
    placeholder="Select line of business"
    showSearch={{
      filter,
    }}
    onSearch={(value) => console.log(value)}
    onChange={handleChangeLineOfBusiness}
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
    placeholder="Select client"
    disabled
    showSearch={{
      filter,
    }}
    onSearch={(value) => console.log(value)}
  />
          </Form.Item>
    
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
      allowClear
      options={ClientStatuses}
      onChange={handleChangeClientStatus}
      disabled
   />
     
          </Form.Item>
         
           </Col>

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
          <Input onChange={handleChangeProjectName} disabled  placeholder="Enter Project name"  
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
      disabled
      allowClear
      options= {OpportunitySources}
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
      disabled
      allowClear
      options={OpportunityScopes}
      onChange={handleChangeScope}
    />
    
          </Form.Item>
    
           </Col>
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
          <DatePicker style={{ width: 295 }} placeholder="Enter first contact date" onChange={handleChangeFirstContactDate} disabled  />
          </Form.Item>
    
           </Col>
         
           
    
           
</Row>

{ isProposed || isApproved || isWon || isLost ? (<><Row gutter={{
xs: 8,
sm: 16,
md: 24,
lg: 32,
}}>
         
           
          
            <Col className="gutter-row" span={6}>
       <Form.Item
         label="First proposal date"
         name="firstProposalDate"
         rules={[
           {
             required: isProposed || isApproved || isWon,
             message: 'Please input first proposal date!',
           },
         ]}
       > 
          <DatePicker style={{ width: 295 }} placeholder="Enter first proposal date" onChange={handleChangeFirstProposalDate}  disabled={fromStatus>1} />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="First proposal Value"
         name="firstProposalValue"
         rules={[
           {
             required: isProposed || isApproved || isWon,
             message: 'Please input first proposal value!',
           },
         ]}
       >
        <InputNumber style={{width: 295}} disabled={fromStatus>1} onChange={handleChangeFirstProposalValue} placeholder="Enter first proposal value"  addonAfter={selectFirstProposalValueAfter}  />
          {/* <Input placeholder="Enter first proposal value" onChange={handleChangeFirstProposalValue} disabled={fromStatus>1}  /> */}
          </Form.Item>
    
           </Col>
{/* 
           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Currency"
         name="firstProposalValueCurrency"
         rules={[
           {
             required: isProposed || isApproved || isWon,
             message: 'Please input currency!',
           },
         ]}
       >
           <Select
     disabled={fromStatus>1}
      allowClear
      options={Currencies}
      onChange={handleChangeFirstProposalValueCurrency}
      placeholder="Select first proposal value currency"
    />
     
          </Form.Item>
    
           </Col> */}

<Col className="gutter-row" span={6}>
       <Form.Item
         label="Accepted proposal Value"
         name="currentProposalValue"
         rules={[
           {
             required: isApproved || isWon,
             message: 'Please input accepted proposal value!',
           },
         ]}
       >
        <InputNumber  style={{width: 295}} disabled={fromStatus>2} onChange={handleChangeCurrentProposalValue} placeholder="Enter accepted proposal value"  addonAfter={selectCurrentProposalValueAfter}  />
          {/* <Input placeholder="Enter accepted proposal value" onChange={handleChangeCurrentProposalValue} disabled={fromStatus>2}  /> */}
          </Form.Item>
    
           </Col>

           {/* <Col className="gutter-row" span={6}>
       <Form.Item
         label="Currency"
         name="currentProposalValueCurrency"
         rules={[
           {
             required: isApproved || isWon,
             message: 'Please input currency!',
           },
         ]}
       >
           <Select
    disabled={fromStatus>2}
      allowClear
      options={Currencies}
      onChange={handleChangeCurrentProposalValueCurrency}
      placeholder="Select accepted proposal value currency"
    />
     
          </Form.Item>
    
           </Col> */}
           
           
</Row>



</>) :null}





{isWon ? (<Row gutter={{
xs: 8,
sm: 16,
md: 24,
lg: 32,
}}>

  <Col className="gutter-row" span={6}>
       <Form.Item
         label="Contract signature date"
         name="contractSignatureDate"
         rules={[
           {
             required: true,
             message: 'Please input contract signature date!',
           },
         ]}
       >
          <DatePicker style={{ width: 295 }} placeholder="Enter Contract signature date" onChange={handleChangeContactSignatureDate} disabled={fromStatus>3}  />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Final contract Value"
         name="finalContractValue"
         rules={[
           {
             required: true,
             message: 'Please input final contract value!',
           },
         ]}
       >
        <InputNumber style={{width: 295}} disabled={fromStatus>3} onChange={handleChangeFinalContractValue} placeholder="Enter Final Contract value"  addonAfter={selectFinalContractValueAfter}  />
          {/* <Input placeholder="Enter Final Contract value" onChange={handleChangeFinalContractValue} disabled={fromStatus>3}  /> */}
          </Form.Item>
    
           </Col>

           {/* <Col className="gutter-row" span={6}>
       <Form.Item
         label="Currency"
         name="finalContractValueCurrency"
         rules={[
           {
             required: true,
             message: 'Please input currency!',
           },
         ]}
       >
           <Select
     disabled={fromStatus>3}
      allowClear
      options={Currencies}
      onChange={handleChangeFinalContractValueCurrency}
      placeholder="Select Final Contract value currency"
    />
     
          </Form.Item>
    
           </Col> */}

           {isRetainer ? (
             <Col className="gutter-row" span={6}>
             <Form.Item
               label="Retainer Validatity (# of months)"
               name="retainerValidatity"
               rules={[
                 {
                   required: true,
                   message: 'Please input Retainer Validatity!',
                 },
               ]}
             >
                <Input placeholder="Enter Retainer Validatity" onChange={handleChangeRetainerValidatity} disabled={fromStatus>3}  />
                </Form.Item>
          
                 </Col>
           ) : null}
</Row>
) :null}

{isLost ? (<></>) :null}


<Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}>
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
        
          <Button style={{width:"100px",marginTop:39}}  disabled={actionLoading} type="primary" htmlType="submit">
         Submit
        </Button>
 </Col>
     </Row>
     </Form>
        
             
             </div>
            
 </>
  )
}

export default ProgressOpportunity