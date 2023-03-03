

import {useRef, useState, useEffect, React} from 'react'
import { useLocation } from 'react-router-dom'
import { useGetCompaniesMutation,useGetProjectByIdMutation,useGetProjectByOpportunityIdMutation,useUpdateProjectMutation } from "../slices/projectApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select,Cascader,DatePicker,Collapse,Checkbox,Divider,InputNumber,Upload } from 'antd';
import {ProjectStatuses,ProjectMilestoneStatuses,ClientStatuses,ProjectScopes, Currencies} from "../../Common/lookups";
import moment from 'moment';

import { CaretRightOutlined,
  UploadOutlined
} from '@ant-design/icons';

import { Country, State, City }  from 'country-state-city';
import axios from "axios";

import CountryPhoneInput, {
  CountryPhoneInputValue,
  ConfigProvider,
} from 'antd-country-phone-input';
import en from 'world_countries_lists/data/countries/en/world.json';


function ProgressProject() {


  const { Panel } = Collapse;

  const location = useLocation()
  const { OpportunityId } = location.state
  const { ProjectId } = location.state


  const { Option } = Select;

  const roles = useSelector(selectCurrentUserRoles);
  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }


  

  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

 
     

  const [clientFileList, setClientFileList] = useState(
    []
  )


     

      const props = {
       
        action:  async ( file ) => {
        
          const formData = new FormData()
          formData.append("formFile",file)
          formData.append("fileName",`client${clientId}/${file.name}`)
          const res = await axios.post("http://localhost:5093/Upload", formData)
          //await upload(formData).unwrap()
          setClientFileList([...clientFileList,{uid:file.uid, 
            name:file.name, 
            url:`http://localhost:5093/Download/?fileName=client${clientId}/${file.name}`,
            status:"done",
          }])
        },
        onChange({ file, fileList }) {
          if (file.status !== 'uploading') {
            console.log(file, fileList);
           
          }
        },
        // onRemove: async (file) => {
        //   await unload({Name:`client${clientId}/${file.name}`}).unwrap()
        //   setClientFileList([...clientFileList.filter(x=>x.name!=file.name)])
        // }
      };

  
 
  const [form] = Form.useForm();
  const key = 'updatable';


  const [isEdit, setIsEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState(false)

//const [save ] = useSaveMilestoneMutation();
//const [deleteOpportunity] = useDeleteOpportunityMutation()
const [updateProject] = useUpdateProjectMutation()

const [getProjectByOpportunityId , { isLoading }] = useGetProjectByOpportunityIdMutation();
const [getProjectById ] = useGetProjectByIdMutation();
//const [opportunity, setOpportunity] = useState(opportunitiesList[id-1])
const [getCompanies] = useGetCompaniesMutation();
const [companiesOptions, setCompaniesOptions] = useState([])
const [companies, setCompanies] = useState([])


const [projectId, setProjectId] = useState(-1)
const [projectName, setProjectName] = useState('')
const [status, setStatus] = useState(-1)
const [statusOptions, setStatusOptions] = useState([])

const [clientId, setClientId] = useState(-1)
const [clients, setClients] = useState([])
const [clientStatus, setClientStatus] = useState(-1)
const [scope, setScope] = useState(-1)

const [isRetainer, setIsRetainer] = useState(false)

const [opportunityId, setOpportunityId] = useState(-1)
const [contractSignatureDate, setContractSignatureDate] = useState('')
const [contractValue, setContractValue] = useState(0)
const [contractValueCurrency, setContractValueCurrency] = useState(0)


const [kickOffDateScheduled, setKickOffDateScheduled] = useState('')
const [kickOffDateActual, setKickOffDateActual] = useState('')
const [clientApprovalDate, setClientApprovalDate] = useState('')
const [completionDateScheduled, setCompletionDateScheduled] = useState('')
const [completionDateActual, setCompletionDateActual] = useState('')
const [currentProjectMilestoneId, setCurrentProjectMilestoneId] = useState(-1)
const [currentProjectMilestoneIndex, setCurrentProjectMilestoneIndex] = useState(-1)
const [projectMilestones, setProjectMilestones] = useState([])

const [retainerValidatity, setRetainerValidatity] = useState(0)
const [note, setNote] = useState('')

const [lineOfBusinessId, setLineOfBusinessId] = useState(-1)

const [isProjectStarted, setIsProjectStarted] = useState(false)
const [isProjectInProgress, setIsProjectInProgress] = useState(false)
const [isProjectCompleted, setIsProjectCompleted] = useState(false)


const [commercialRegistrationNumber, setCommercialRegistrationNumber] = useState("")
const [addressLine1, setAddressLine1] = useState("")
const [addressLine2, setAddressLine2] = useState("")
const [city, setCity] = useState("")
const [state, setState] = useState("")
const [country, setCountry] = useState("")
const [email, setEmail] = useState("")
const [contactNumber, setContactNumber] = useState("")
const [phoneNumberValue, setPhoneNumberValue] = useState({short:'EG'})
const [contactPerson, setContactPerson] = useState("")
const [taxCardNumber, setTaxCardNumber] = useState("")
const [postCode, setPostCode] = useState("")


const handleChangeClient =   (value) => setClientId(value[0])

const handleChangeScope =   (value) => {
  setScope(value)}


const handleChangeProjectName =   (e) => setProjectName(e.target.value)


const handleChangeClientStatus =   (value) => setClientStatus(value)

const handleChangeNote =   (e) => setNote(e.target.value)

const handleChangeContractSignatureDate =   (date, dateString) => setContractSignatureDate(dateString)
const handleChangeContractValue =   (e) => setContractValue(e.target.value)
const handleChangeContractValueCurrency =   (value) => setContractValueCurrency(value)



//const handleChangeKickOffDateScheduled =   (date, dateString) => setKickOffDate(dateString)
const handleChangeClientApprovalDate =   (date, dateString) => setClientApprovalDate(dateString)
const handleChangeCompletionDateScheduled =   (date, dateString) => setCompletionDateScheduled(dateString)
const handleChangeCompletionDateActual =   (date, dateString) => setCompletionDateActual(dateString)

const handleChangeRetainerValidatity =   (e) => setRetainerValidatity(e.target.value)

const handleChangeStatus =   (value) => {
  
  if(value==ProjectStatuses.find(x=>x.label=="Started").value){
    setIsProjectStarted(true)
    setIsProjectCompleted(false)
  }
  else if(value==ProjectStatuses.find(x=>x.label=="InProgress").value){
    setIsProjectInProgress(true)
    setIsProjectCompleted(false)
  }
  else if(value==ProjectStatuses.find(x=>x.label=="Completed").value){
    setIsProjectCompleted(true)
  } else{
    setIsProjectStarted(false)
    setIsProjectInProgress(false)
    setIsProjectCompleted(false)
  }
  setStatus(value)
  }


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

const handleChangeMilestoneName =   (i,e) => {
  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      return {...obj, milestoneName: e.target.value};
    }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);
}

const handleChangeIsPayment =   (i) => {
  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      return {...obj, needPayment: !projectMilestones[i].needPayment};
    }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);
}

const handleChangePaymentValue =   (i,e) => {
  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      return {...obj, paymentValue: e.target.value};
    }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);
}




const handleChangeCurrency =   (i,value) => {
  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      return {...obj, contractValueCurrency: value};
    }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);
  }

  const handleChangeProjectMilestoneStatus =   (i,value) => {
    const newState = projectMilestones.map((obj,index) => {
      // 👇️ if id equals 2, update country property
      if (index === i) {
        return {...obj, status: value};
      }
  
      // 👇️ otherwise return object as is
      return obj;
    });
  
    setProjectMilestones(newState);
    }


const handleChangeDateScheduled =   (i,date, dateString) => {
 

  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      return {...obj, dateScheduled: dateString};
    }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);
  }

  const handleChangeDateActual =   (i,date, dateString) => {
 

    const newState = projectMilestones.map((obj,index) => {
      // 👇️ if id equals 2, update country property
      if (index === i) {
        return {...obj, dateActual: dateString};
      }
  
      // 👇️ otherwise return object as is
      return obj;
    });
  
    setProjectMilestones(newState);
    }


const handleChangeCommercialRegistrationNumber =   (e) => setCommercialRegistrationNumber(e.target.value)

const handleChangeAddressLine1 =   (e) => setAddressLine1(e.target.value)

const handleChangeAddressLine2 =   (e) => setAddressLine2(e.target.value)

const handleChangeCity =   (value) => {
  setCity(value);
}

const handleChangeState=   (value) => {
  setState(value);
  console.log( City
    .getCitiesOfState(country,value)
    )
  setCities(
  City
    .getCitiesOfState(country,value)
    .map((city) => ({ label: city.name, value: city.name })))

  
}

const handleChangeCountry=   (value) => {
  console.log(value)
  setCountry(value);
  const statesOptions = State
  .getStatesOfCountry(value)
  .map((state) => ({ label: state.name, value: state.isoCode }))

  console.log(statesOptions)

  setStates(
    statesOptions)


}

const handleChangePostCode =   (e) => setPostCode(e.target.value)

const handleChangeEmail =   (e) => setEmail(e.target.value)

const handleChangeContactNumber =   (e) => {
  setPhoneNumberValue(e)
  setContactNumber(`${e.short}-${e.code}-${e.phone}`)}

const handleChangeContactPerson =   (e) => setContactPerson(e.target.value)

const handleChangeTaxCardNumber =   (e) => setTaxCardNumber(e.target.value)

    



const loadProject = async () =>{

  let project;
  console.log(OpportunityId)
  console.log(ProjectId)
if(OpportunityId!=-1){
  project = await getProjectByOpportunityId({OpportunityId:OpportunityId}).unwrap()
}else{
  project = await getProjectById({Id:ProjectId}).unwrap()
}

console.log(project)

setProjectId(project.id)
 setLineOfBusinessId(project.lineOFBusinessId)
 
  setProjectName(project.projectName)
  setNote(project.note)
  setScope(project.scope)
  setStatus(project.status)

  setClientStatus(project.opportunity.clientStatus)
  setClients([{label:project.client.name,value:project.client.id}])
  setClientId(project.clientId)

  setKickOffDateScheduled(project.kickOffDateScheduled !=null?project.kickOffDateScheduled:"")
  setKickOffDateActual(project.kickOffDateActual !=null?project.kickOffDateActual:"")
  //setClientApprovalDate(project.clientApprovalDate !=null?project.clientApprovalDate:"")
  setCompletionDateScheduled(project.completionDateScheduled !=null?project.completionDateScheduled:"")
  setCompletionDateActual(project.completionDateActual !=null?project.completionDateActual:"")

  setCurrentProjectMilestoneId(project.currentProjectMilestoneId)
  setCurrentProjectMilestoneIndex(project.currentProjectMilestoneIndex)
  setProjectMilestones(project.projectMilestones)


  setContractSignatureDate(project.contractSignatureDate !=null?project.contractSignatureDate:"")
  setContractValue(project.contractValue)
  setContractValueCurrency(project.contractValueCurrency!=null?project.contractValueCurrency:0)
  setRetainerValidatity(project.retainerValidatity)

  setAddressLine1(project.client.addressLine1)
 setAddressLine2(project.client.addressLine2)
 setContactNumber(project.client.contactNumber)
 setPhoneNumberValue(project.client.contactNumber != undefined && project.client.contactNumber != ''? {short:project.client.contactNumber.split("-")[0],code:project.client.contactNumber.split("-")[1],phone:project.client.contactNumber.split("-")[2]}: {short:'EG'})
 setContactPerson(project.client.contactPerson)
 setTaxCardNumber(project.client.taxCardNumber)
 setCommercialRegistrationNumber(project.client.commercialRegistrationNumber)
 setClientFileList(project.client.files.map(x=>({
  uid:x.id,
  name:x.name,
  url:x.url,
  status:x.status
 })))
 setEmail(project.client.email)
 setPostCode(project.client.postCode)
 setCountry(project.client.country)
 setState(project.client.state)
 setCity(project.client.city)
  
  if(project.lineOfBusiness.isRetainer || project.scope==ProjectScopes.find(x=>x.label=="Retainer").value){
    setIsRetainer(true)
  }

  form.setFieldsValue({
    lineOfBusinessId:[project.lineOfBusiness.company.id,project.lineOfBusinessId],
    scope:project.scope,
    status:project.status,
    
    note:project.note,
    clientStatus:project.opportunity.clientStatus,
    clientId:project.clientId,
    projectName: project.projectName,

   kickOffDateScheduled:project.kickOffDateScheduled !=null?moment(project.kickOffDateScheduled):"",
   kickOffDateActual:project.kickOffDateActual !=null?moment(project.kickOffDateActual):"",
   //clientApprovalDate:project.clientApprovalDate !=null?moment(project.clientApprovalDate):"",
   completionDateScheduled:project.completionDateScheduled !=null?moment(project.completionDateScheduled):"",
   completionDateActual:project.completionDateActual !=null?moment(project.completionDateActual):"",

    contractSignatureDate:project.contractSignatureDate !=null?moment(project.contractSignatureDate):"" ,

 
  contractValue:project.contractValue,
  contractValueCurrency:project.contractValueCurrency!=null?project.contractValueCurrency:0,
  retainerValidatity:project.retainerValidatity,
  addressLine1:project.client.addressLine1,
 addressLine2:project.client.addressLine2,
 //contactNumber:opportunity.client.contactNumber,
 phoneNumberValue:project.client.contactNumber != undefined && project.client.contactNumber != ''? {short:project.client.contactNumber.split("-")[0],code:project.client.contactNumber.split("-")[1],phone:project.client.contactNumber.split("-")[2]}: {short:'EG'},
 contactPerson:project.client.contactPerson,
 email:project.client.email,
 postCode:project.client.postCode,
 commercialRegistrationNumber:project.client.commercialRegistrationNumber,
 taxCardNumber:project.client.taxCardNumber,
 city:project.client.city,
 state:project.client.state,
 country:project.client.country,
  });

  project.projectMilestones.forEach((element,i) => {
    form.setFieldsValue({
      ['milestoneName'+i]:element.name,
      ['milestoneStatus'+i]:element.status,
      ['milestoneIndex'+i]:element.milestoneIndex,
      ['needPayment'+i]:element.needPayment,
      ['paymentValue'+i]:element.paymentValue,
      ['paymentValueCurrency'+i]:element.paymentValueCurrency!=null?element.paymentValueCurrency:0,
      ['dateScheduled'+i]:element.dateScheduled!=null?moment(element.dateScheduled):null,
      ['dateActual'+i]:element.dateActual!=null?moment(element.dateActual):null,
      //['MilestoneStatus'+i]:element.status,
    });
  });
  
}



const selectContractValueAfter =  (
  

<Select
      options={Currencies}
      style={{ width: 60 }}
      name="contractValueCurrency"
      onChange={handleChangeContractValueCurrency}
    //  placeholder="Select Contract value currency"
      disabled
      value={contractValueCurrency}
      defaultValue="0"
    />
);

const selectBefore = (element,i)=> (<>
  <Form.Item
       name={`needPayment${i}`}
       valuePropName="checked"
       style={{ height: 6 }}
     >
      <Checkbox name={`needPayment${i}`} disabled={element.status!=1 && element.status!=2 && element.milestoneIndex != currentProjectMilestoneIndex} onChange={()=>handleChangeIsPayment(i)} ></Checkbox>
        </Form.Item>
  {/* <Select defaultValue="add" style={{ width: 50 }}>
    <Option value="add">+</Option>
    <Option value="minus">-</Option>
  </Select> */}
  
  </>
);
const selectAfter = (element,i)=> (
  <Form.Item
  name={`paymentValueCurrency${i}`}
  style={{ height: 6 }}
>
  <Select disabled={!element.needPayment && element.milestoneIndex != currentProjectMilestoneIndex || (element.status!=1 && element.status!=2)}  name={`paymentValueCurrency${i}`} defaultValue="0" style={{ width: 60 }}  options={Currencies}
  onChange={(value)=>handleChangeCurrency(i,value)} 
 >
    
  </Select>
  </Form.Item>
);




useEffect( () =>{ 
  async function fetchMyAPI() {

    
  
    var companiesArray = await getCompanies({}).unwrap()
    setCompanies(companiesArray)
   
    transformLineOfBusinesses(companiesArray)
    loadProject()
    
  }
  fetchMyAPI()
}, [])


let content = (projectMilestones.map((element,i) => {return (<>
  <Collapse
    bordered={true}
    defaultActiveKey={`[${i}]`}
    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    className="site-collapse-custom-collapse"
  >

    <Panel header={`milestone ${i+1}`} key={i+1} className="site-collapse-custom-panel">
    
        <Row gutter={{
        xs: 8,
        sm: 16,
        md: 24,
        lg: 32,
      }}>


<Col className="gutter-row" span={3}>
<Form.Item
         label="Milestone Index"
         name={`milestoneIndex${i}`}
       >
    <InputNumber disabled   />
    </Form.Item>
    </Col>

<Col className="gutter-row" span={6}>
       <Form.Item
         label="Milestone Name"
         name={`milestoneName${i}`}
         rules={[
           {
             required: element.status>0 && element.milestoneIndex != currentProjectMilestoneIndex,
             message: 'Please input Milestone name!',
           },
         ]}
       >
        <Input onChange={(e)=>handleChangeMilestoneName(i,e)} placeholder="Enter milestone name" disabled={element.status!=1 && element.status!=2 && element.milestoneIndex != currentProjectMilestoneIndex}></Input>
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Milestone Status"
         name={`milestoneStatus${i}`}
         rules={[
           {
             required: element.status>0 && element.milestoneIndex != currentProjectMilestoneIndex,
             message: 'Please enter milestone status!',
           },
         ]}
       >
           <Select
           disabled={element.status==0 && element.milestoneIndex != currentProjectMilestoneIndex}
           placeholder="Select milestone status"
      allowClear
      onChange={(value)=>handleChangeProjectMilestoneStatus(i,value)}
      options={ProjectMilestoneStatuses}
    />
          </Form.Item>
    
           </Col>

           {/* <Col className="gutter-row" span={6}>
       <Form.Item
         name={`needPayment${i}`}
         valuePropName="checked"
         label="Need payment?"
       >
        <Checkbox disabled={element.status!=1 && element.status!=2 && element.milestoneIndex != currentProjectMilestoneIndex} onChange={()=>handleChangeIsPayment(i)} ></Checkbox>
          </Form.Item>
    
           </Col> */}

           

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Payment value"
         name={`paymentValue${i}`}
         rules={[
           {
             required: element.needPayment && (element.status==1 || element.status==2) && element.milestoneIndex != currentProjectMilestoneIndex,
             message: 'Please input payment value!',
           },
         ]}
       >
        <InputNumber disabled={(!element.needPayment && element.milestoneIndex != currentProjectMilestoneIndex) || (element.status!=1 && element.status!=2)} onChange={(e)=>handleChangePaymentValue(i,e)} placeholder="Enter payment value" addonBefore={selectBefore(element,i)} addonAfter={selectAfter(element,i)}  />
        {/* <Input  disabled={(!element.needPayment && element.milestoneIndex != currentProjectMilestoneIndex) || (element.status!=1 && element.status!=2)} onChange={(e)=>handleChangePaymentValue(i,e)} placeholder="Enter payment value"></Input> */}
          </Form.Item>
    
           </Col>

           {/* <Col className="gutter-row" span={6}>
       <Form.Item
         label="Currency"
         name={`paymentValueCurrency${i}`}
         rules={[
           {
             required: element.needPayment && (element.status==1 || element.status==2) && element.milestoneIndex != currentProjectMilestoneIndex,
             message: 'Please input currency!',
           },
         ]}
       >
           <Select 
     disabled={!element.needPayment && element.milestoneIndex != currentProjectMilestoneIndex || (element.status!=1 && element.status!=2)}
      allowClear
      options={Currencies}
      onChange={(value)=>handleChangeCurrency(i,value)}
      placeholder="Select currency"
    />
     
          </Form.Item>
    
           </Col> */}
      
           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Date scheduled"
         name={`dateScheduled${i}`}
         rules={[
           {
             required: (element.status==1 ||element.status==2) && element.milestoneIndex != currentProjectMilestoneIndex,
             message: 'Please input scheduled date!',
           },
         ]}
       > 
          <DatePicker  style={{ width: 295 }} disabled={element.status!=1 && element.status!=2 && element.milestoneIndex != currentProjectMilestoneIndex} placeholder="Enter milestone scheduled date" onChange={(date,dateString)=>handleChangeDateScheduled(i,date,dateString)}   />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Date actual"
         name={`dateActual${i}`}
         rules={[
           {
             required:  element.status==2 && element.milestoneIndex != currentProjectMilestoneIndex,
             message: 'Please input actual date!',
           },
         ]}
       > 
          <DatePicker  style={{ width: 295 }} disabled={element.status!=1 && element.status!=2 && element.milestoneIndex != currentProjectMilestoneIndex} placeholder="Enter milestone actual date" onChange={(date,dateString)=>handleChangeDateActual(i,date,dateString)}   />
          </Form.Item>
    
           </Col>
       </Row>
       </Panel>
       <Divider></Divider>
       


       </Collapse><div
           className="site-layout-background"
           style={{
             padding: 10,
           }}
         ></div></>)
      
    }))










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

          const project = {
            Id:projectId,
            ProjectName:projectName,
            LineOfBusinessId:lineOfBusinessId,
            ClientId:clientId,
            ClientStatus:clientStatus,
            Scope:scope,
            Status:status,
    Note:note,

    kickOffDateScheduled:projectMilestones[0].dateScheduled!=""?projectMilestones[0].dateScheduled:null,
    kickOffDateActual:projectMilestones[0].dateActual!=""?projectMilestones[0].dateActual:null,
    CompletionDateActual:projectMilestones[projectMilestones.length-1].dateActual!=""?projectMilestones[projectMilestones.length-1].dateActual:null,
    CompletionDateScheduled:projectMilestones[projectMilestones.length-1].dateScheduled!=""?projectMilestones[projectMilestones.length-1].dateScheduled:null,
    ClientApprovalDate:clientApprovalDate!=""?clientApprovalDate:null,
   
    ContractSignatureDate:contractSignatureDate!=""?contractSignatureDate:null,
    ContractValue:contractValue!=""?contractValue:null,
    ContractValueCurrency:contractValue!=""?contractValueCurrency:null,
    RetainerValidatity:retainerValidatity!=""?retainerValidatity:null,
    ProjectMilestones:projectMilestones.map(element => ({
      Id:element.id,
      Status:element.status,
      Name:element.name,
      //Description:element.Description,
      NeedPayment:element.needPayment,
     // MilestoneId:element.id,
      PaymentValue:element.paymentValue,
      PaymentValueCurrency:element.PaymentValueCurrency,
      DateScheduled:element.dateScheduled,
      DateActual:element.dateActual
    }))
          }

        await updateProject(project).unwrap()
        showMessage('project updated successfully!')
        setActionLoading(false)

        loadProject()
       
 
    
   
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




const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);


  return (
    <>
    <Descriptions title="Progress Project"></Descriptions>
 
 
              
         <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 150,
           }}
         >
        
         <Descriptions title="Project"></Descriptions>
        
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
         label="Status"
         name="status"
         rules={[
           {
             required: true,
             message: 'Please enter status!',
           },
         ]}
       >
           <Select
      allowClear
      onChange={handleChangeStatus}
      options={ProjectStatuses}
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
   // onChange={handleChangeLineOfBusiness}
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
          <Input onChange={handleChangeProjectName} disabled  placeholder="Enter Project name"  
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
             message: 'Please choose project scope!',
           },
         ]}
       >
          <Select
      allowClear
      options={ProjectScopes}
      placeholder="Please enter project scope"
      onChange={handleChangeScope}
      disabled
    />
    
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Contract Signature Date"
         name="contractSignatureDate"
         rules={[
           {
             required: true,
             message: 'Please input contract signature date!',
           },
         ]}
        
       >
          <DatePicker  style={{ width: 295 }}
          onChange={handleChangeContractSignatureDate}
          disabled
          />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Contract Value"
         name="contractValue"
         rules={[
           {
             required: true,
             message: 'Please input Contract Value!',
           },
         ]}
       >
         <InputNumber style={{width: 295}} disabled onChange={handleChangeContractValue} placeholder="Enter payment value"  addonAfter={selectContractValueAfter}  />
          {/* <Input disabled placeholder="Enter contract value" onChange={handleChangeContractValue}   /> */}
          </Form.Item>
    
           </Col>

           {/* <Col className="gutter-row" span={6}>
       <Form.Item
         label="Currency"
         name="contractValueCurrency"
         rules={[
           {
             required: true,
             message: 'Please input currency!',
           },
         ]}
       >
           <Select
      allowClear
      options={Currencies}
      onChange={handleChangeContractValueCurrency}
      placeholder="Select Contract value currency"
      disabled
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
                <Input disabled placeholder="Enter Retainer Validatity" onChange={handleChangeRetainerValidatity}  />
                </Form.Item>
          
                 </Col>
           ) : null}

{isProjectStarted || isProjectInProgress || isProjectCompleted?<>

<Col className="gutter-row" span={6}>
       <Form.Item
         label="Kick off date scheduled"
         name="kickOffDateScheduled"
       
        
       >
          <DatePicker  style={{ width: 295 }}
         // onChange={handleChangeKickOffDateScheduled}
          disabled
          />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Kick off date actual"
         name="kickOffDateActual"
       
        
       >
          <DatePicker  style={{ width: 295 }}
         // onChange={handleChangeKickOffDateActual}
          disabled
          />
          </Form.Item>
    
           </Col>

           {/* <Col className="gutter-row" span={6}>
       <Form.Item
         label="Client Approval date"
         name="clientApprovalDate"
         rules={[
           {
             required: true,
             message: 'Please input client approval date!',
           },
         ]}
         
       >
          <DatePicker   style={{ width: 295 }}
          onChange={handleChangeClientApprovalDate}
          />
          </Form.Item>
    
           </Col> */}

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Completion date scheduled"
         name="completionDateScheduled"
       
        
       >
          <DatePicker  style={{ width: 295 }}
          onChange={handleChangeCompletionDateScheduled}
          disabled
          />
          </Form.Item>
    
           </Col>
           
           
           </>:null}
           {isProjectCompleted? <Col className="gutter-row" span={6}>
       <Form.Item
         label="Completion date actual"
         name="completionDateActual"
         
        
       >
          <DatePicker  style={{ width: 295 }}
          onChange={handleChangeCompletionDateActual}
          disabled
          />
          </Form.Item>
    
           </Col>:null}

<Col className="gutter-row" span={6}>
       <Form.Item
         label="Note"
         name="note"
       >
          <Input onChange={handleChangeNote}  placeholder="Enter Project note"  
             />
          </Form.Item>
    
           </Col>

           <Button key="submit" style={{marginTop:39,marginLeft:15}}  type="primary" htmlType="submit"    >
            Submit
          </Button>

           </Row>

         
           <Divider orientation="left">Client extra details</Divider>
          <div
        className="site-layout-background"
        style={{
          padding: 15,
        }}
      ></div>

          <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}>


           


           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Contact Person"
         name="contactPerson"
         rules={[
           {
             required: true,
             message: 'Please input Contact person!',
           },
         ]}
       >
          <Input disabled placeholder="Enter contact person" onChange={handleChangeContactPerson}   />
          </Form.Item>
    
           </Col>
         

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Email"
         name="email"
         rules={[
           {
             required: true,
             message: 'Please input Email!',
           },
         ]}
       >
          <Input disabled placeholder="Enter Email" onChange={handleChangeEmail}   />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
           <ConfigProvider locale={en}>
       <Form.Item
         label="Contact number"
         name="phoneNumberValue"
         rules={[
          {
            required: true,
            message: 'Please input Contact number!',
          },
        ]}
       >
       
        <CountryPhoneInput
        disabled
        style={{ height: 33 }}
        //value={phoneNumberValue}
        placeholder="Enter Contact number"
        onChange={handleChangeContactNumber}
      />
         
          </Form.Item>
          </ConfigProvider>
    
           </Col>

         

           


           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Address Line 1"
         name="addressLine1"
         rules={[
           {
             required: true,
             message: 'Please input Address line 1!',
           },
         ]}
       >
          <Input disabled placeholder="Enter Address line 1" onChange={handleChangeAddressLine1}   />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Address Line 2"
         name="addressLine2"
         rules={[
           {
             required: true,
             message: 'Please input Address line 2!',
           },
         ]}
       >
          <Input disabled placeholder="Enter Address line 2" onChange={handleChangeAddressLine2}   />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
           <Form.Item
         label="Post Code"
         name="postCode"
         rules={[
           {
             required: true,
             message: 'Please input post code!',
           },
         ]}
       >
          <Input disabled placeholder="Enter post code" onChange={handleChangePostCode}   />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Country"
         name="country"
         rules={[
           {
             required: true,
             message: 'Please input Country!',
           },
         ]}
       >
          <Select
                                      showSearch
                                      placeholder="Select Country"
                                      optionFilterProp="label"
                                      onChange={handleChangeCountry}
                                      onSearch={onSearch}
                                      options={countries}
                                      filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                      allowClear
                                      disabled
                                    />
          
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="State"
         name="state"
         rules={[
           {
             required: true,
             message: 'Please input State!',
           },
         ]}
       >
           <Select
      allowClear
      optionFilterProp="label"
      options={states}
      onChange={handleChangeState}
      placeholder="Select state"
      filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
      showSearch
      onSearch={onSearch}
      disabled
    />
          </Form.Item>
    
           </Col>


           <Col className="gutter-row" span={6}>
       <Form.Item
         label="City"
         name="city"
         rules={[
           {
             required: true,
             message: 'Please input City!',
           },
         ]}
       >
           <Select
      allowClear
      optionFilterProp="label"
      options={cities}
      onChange={handleChangeCity}
      placeholder="Select City"
      filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
      showSearch
      onSearch={onSearch}
      disabled
    />
          </Form.Item>
    
           </Col>


           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Commercial Reg Number"
         name="commercialRegistrationNumber"
         rules={[
           {
             required: true,
             message: 'Please input Commercial Registration Number!',
           },
         ]}
       >
          <Input disabled placeholder="Enter Commercial Registration Number" onChange={handleChangeCommercialRegistrationNumber}   />
          </Form.Item>
    
           </Col>


           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Tax Card Number"
         name="taxCardNumber"
         rules={[
           {
             required: true,
             message: 'Please input Tax Card Number!',
           },
         ]}
       >
          <Input disabled placeholder="Enter Tax Card Number" onChange={handleChangeTaxCardNumber}   />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Files"
         name="files"
       >
          <Upload {...props} fileList={clientFileList} >
    <Button disabled icon={<UploadOutlined />}>Click to Upload</Button>
  </Upload>
          </Form.Item>
    
           </Col>


        </Row>

           <Divider orientation="left">{isRetainer? "No Milestones for retainer " :"Milestones"}</Divider>

         {content}

     </Form>
        
             
             </div>
            
 </>
  )
}

export default ProgressProject