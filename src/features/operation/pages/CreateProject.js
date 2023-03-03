import {useRef, useState, useEffect, React,useCallback} from 'react'
import { useGetCompaniesMutation,useGetOpportunitiesMutation,useDeleteOpportunityMutation } from "../../commercial/slices/opportunityApiSlice"
import { useGetLOBMilestonesMutation,useSaveProjectMutation,useUnloadMutation } from "../slices/projectApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm,Cascader,Popover,DatePicker,Modal, Checkbox, Divider, Collapse,Upload,InputNumber } from 'antd';
import {
  StepForwardOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import {OpportunityStatuses,OpportunitySources,ClientStatuses,OpportunityScopes, Currencies} from "../../Common/lookups";
import moment from 'moment';
import {useNavigate} from 'react-router-dom';

import { CaretRightOutlined } from '@ant-design/icons';

import { Country, State, City }  from 'country-state-city';
import axios from "axios";

import CountryPhoneInput, {
  CountryPhoneInputValue,
  ConfigProvider,
} from 'antd-country-phone-input';
import en from 'world_countries_lists/data/countries/en/world.json';
//import 'antd/dist/antd.css';
//import 'antd-country-phone-input/dist/index.css';

function CreateProject() {

  const { Panel } = Collapse;

  const navigate = useNavigate();

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
      render: (_, record) =>  (allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','OpperationManager','OpperationUser']) ? <>
      <Button type="primary" onClick={()=>showModal(record)}>
      <StepForwardOutlined /> Create project
      </Button>
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
          const res = await axios.post("https://leveragefc-backend.onrender.com/Upload", formData)
          //await upload(formData).unwrap()
          setClientFileList([...clientFileList,{uid:file.uid, 
            name:file.name, 
            url:`https://leveragefc-backend.onrender.com/Download/?fileName=client${clientId}/${file.name}`,
            status:"done",
          }])
        },
        onChange({ file, fileList }) {
          if (file.status !== 'uploading') {
            console.log(file, fileList);
           
          }
        },
        onRemove: async (file) => {
          await unload({Name:`client${clientId}/${file.name}`}).unwrap()
          setClientFileList([...clientFileList.filter(x=>x.name!=file.name)])
        }
      };

    
 
  const [form] = Form.useForm();
  const key = 'updatable';

  

  const [isValid, setIsValid] = useState(true);
  const [isValidDuplicateMilestoneIndex, setIsValidDuplicateMilestoneIndex] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false)

  //const [saveOpportunity ] = useSaveOpportunityMutation();
  const [saveProject] = useSaveProjectMutation();
  //const [deleteOpportunity] = useDeleteOpportunityMutation()
  //const [updateOpportunity] = useUpdateOpportunityMutation()
  
  const [getLOBMilestones ] = useGetLOBMilestonesMutation();
  const [unload ] = useUnloadMutation();
  
  const [getOpportunities , { isLoading }] = useGetOpportunitiesMutation();
  const [opportunities, setOpportunities] = useState([])
  const [getCompanies] = useGetCompaniesMutation();
  const [companiesOptions, setCompaniesOptions] = useState([])
  const [companies, setCompanies] = useState([])
  
  const [projectName, setProjectName] = useState('')
   
  
  const [clientId, setClientId] = useState(-1)
  const [clients, setClients] = useState([])
  const [clientStatus, setClientStatus] = useState(-1)
  
  const [scope, setScope] = useState(-1)
  
  const [lineOfBusinessId, setLineOfBusinessId] = useState(-1)
  
  const [opportunityId, setOpportunityId] = useState("")
  
  const [contractSignatureDate, setContractSignatureDate] = useState("")
  const [contractValue, setContractValue] = useState(0)
  const [contractValueCurrency, setContractValueCurrency] = useState(0)
  const [retainerValidatity, setRetainerValidatity] = useState(0)
  const [maxIndex, setMaxIndex] = useState(1)
  
  const [isRetainer, setIsRetainer] = useState(false)

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
  
  const [note, setNote] = useState('')
  
  
  const [projectMilestones, setProjectMilestones] = useState([])
  
  
  const [checkedState, setCheckedState] = useState(
    new Array(0).fill(false)
  );
  
  
  const [activeKey, setActiveKey] = useState(0)
  
  
  
  const [searchLineOfBusinessIds, setSearchLineOfBusinessIds] = useState([])
  const [searchDateFrom, setSearchDateFrom] = useState("")
  const [searchDateTo, setSearchDateTo] = useState("")

  const selectBefore = (i)=> (<>
    <Form.Item
         name={`needPayment${i}`}
         valuePropName="checked"
         style={{ height: 6 }}
       >
        <Checkbox name={`needPayment${i}`} disabled={!checkedState[i]} onChange={()=>handleChangeIsPayment(i)} ></Checkbox>
          </Form.Item>
    {/* <Select defaultValue="add" style={{ width: 50 }}>
      <Option value="add">+</Option>
      <Option value="minus">-</Option>
    </Select> */}
    
    </>
  );
  const selectAfter = (i)=> (
    <Form.Item
  name={`currency${i}`}
  style={{ height: 6 }}
>
    <Select defaultValue="0" style={{ width: 60 }}  options={Currencies}
    onChange={(value)=>handleChangeCurrency(i,value)}
   >
      
    </Select>
    </Form.Item>
  );


  let content = (projectMilestones.map((element,i) => {return (<>
  <Collapse 
    bordered={true}
    defaultActiveKey={`[${i}]`}
    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    className="site-collapse-custom-collapse"
  >

    <Panel header={`milestone ${i+1}`} key={i+1}  className="site-collapse-custom-panel">
    <Form.Item
         name={`checked${i}`}
         valuePropName="checked"
       >
    <Checkbox  onChange={()=>handelChangeMilestoneChecked(i)}></Checkbox>
    </Form.Item>
    
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
         rules={[
          {
            required: checkedState[i],
            message: 'Please input Milestone index!',
          },
        ]}
       >
    <InputNumber disabled={!checkedState[i]} min={1}    onChange={(e)=>handleChangeMilestoneIndex(i,e)} />
    </Form.Item>
    </Col>

<Col className="gutter-row" span={6}>
       <Form.Item
         label="Milestone Name"
         name={`milestoneName${i}`}
         rules={[
           {
             required: checkedState[i],
             message: 'Please input Milestone name!',
           },
         ]}
       >
        <Input onChange={(e)=>handleChangeMilestoneName(i,e)} placeholder="Enter milestone name" disabled={!checkedState[i]}></Input>
          </Form.Item>
    
           </Col>

           {/* <Col className="gutter-row" span={6}>
       <Form.Item
        label="Need payment?"
         name={`needPayment${i}`}
         valuePropName="checked"
       >
        <Checkbox name={`needPayment${i}`} disabled={!checkedState[i]} onChange={()=>handleChangeIsPayment(i)} ></Checkbox>
          </Form.Item>
    
           </Col> */}

           

           <Col className="gutter-row" span={8}>
       <Form.Item
         label="Payment value"
         name={`paymentValue${i}`}
         rules={[
           {
             required: checkedState[i] && element.needPayment,
             message: 'Please input payment value!',
           },
         ]}
       >
        <InputNumber disabled={!element.needPayment || !checkedState[i]} onChange={(e)=>handleChangePaymentValue(i,e)} placeholder="Enter payment value" addonBefore={selectBefore(i)} addonAfter={selectAfter(i)}  />
        {/* <Input disabled={!element.needPayment || !checkedState[i]} onChange={(e)=>handleChangePaymentValue(i,e)} placeholder="Enter payment value"></Input> */}
          </Form.Item>
    
           </Col>

           {/* <Col className="gutter-row" span={6}>
       <Form.Item
         label="Currency"
         name={`currency${i}`}
         rules={[
           {
             required: checkedState[i] && element.needPayment,
             message: 'Please input currency!',
           },
         ]}
       >
           <Select
     disabled={!element.needPayment || !checkedState[i]}
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
         name={`dateScheculed${i}`}
         rules={[
           {
             required: checkedState[i],
             message: 'Please input scheduled date!',
           },
         ]}
       > 
          <DatePicker style={{ width: 200 }} disabled={!checkedState[i]} placeholder="Enter milestone scheduled date" onChange={(date,dateString)=>handleChangeDateScheduled(i,date,dateString)}   />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Note"
         name={`note${i}`}
       >
          <Input disabled={!checkedState[i]} onChange={(e)=>handleChangeMilestoneNote(i,e)}  placeholder="Enter Project Milestone note"  
             />
          </Form.Item>
    
           </Col>
       </Row>
       </Panel>
       
      <Divider></Divider>

       </Collapse>
        <div
        className="site-layout-background"
        style={{
          padding: 20,
        }}
      ></div></>)
      
    }))

  const showModal = async (opportunity) => {
    setOpen(true);

    //load pop up project

   const countriesOptions = Country.getAllCountries()
    setCountries(countriesOptions.map(x=>({label:`${x.flag}${x.name}`,value:x.isoCode})))
  // setCountries([{label:'Egypt',value:1}])
    console.log(OpportunityScopes.find(x=>x.label=="Retainer").value)
    console.log(opportunity.scope)
    if(opportunity.scope==OpportunityScopes.find(x=>x.label=="Retainer").value){
      console.log(isRetainer)
      setIsRetainer(true)
    }else{
      setIsRetainer(false)
    }

 setLineOfBusinessId(opportunity.lineOfBusinessId)
 
 setProjectName(opportunity.projectName)
 setClientStatus(opportunity.clientStatus)
 setClients([{label:opportunity.client.name,value:opportunity.client.id}])
 setClientId(opportunity.clientId)
 setContractSignatureDate(opportunity.contractSignatureDate !=null?opportunity.contractSignatureDate:"")
 setContractValue(opportunity.finalContractValue)
 setContractValueCurrency(opportunity.finalContractValueCurrency!=null?opportunity.finalContractValueCurrency:0)
 setRetainerValidatity(opportunity.retainerValidatity)
 setOpportunityId(opportunity.id)
 setScope(opportunity.scope)
 setAddressLine1(opportunity.client.addressLine1)
 setAddressLine2(opportunity.client.addressLine2)
 setContactNumber(opportunity.client.contactNumber)
 setPhoneNumberValue(opportunity.client.contactNumber != undefined && opportunity.client.contactNumber != ''? {short:opportunity.client.contactNumber.split("-")[0],code:opportunity.client.contactNumber.split("-")[1],phone:opportunity.client.contactNumber.split("-")[2]}: {short:'EG'})
 setContactPerson(opportunity.client.contactPerson)
 setTaxCardNumber(opportunity.client.taxCardNumber)
 setCommercialRegistrationNumber(opportunity.client.commercialRegistrationNumber)
 setClientFileList(opportunity.client.files.map(x=>({
  uid:x.id,
  name:x.name,
  url:x.url,
  status:x.status
 })))
 setEmail(opportunity.client.email)
 setPostCode(opportunity.client.postCode)
 setCountry(opportunity.client.country)
 setState(opportunity.client.state)
 setCity(opportunity.client.city)
 

 form.setFieldsValue({
   lineOfBusinessId:[opportunity.lineOfBusiness.company.id,opportunity.lineOfBusinessId],
   note:opportunity.note,
   clientStatus:opportunity.clientStatus,
   clientId:opportunity.clientId,
   projectName: opportunity.projectName,
   contractSignatureDate:opportunity.contractSignatureDate !=null?moment(opportunity.contractSignatureDate):"" ,
 contractValue:opportunity.finalContractValue,
 //contractValueCurrency:opportunity.finalContractValueCurrency!=null?opportunity.finalContractValueCurrency:0,
 retainerValidatity:opportunity.retainerValidatity,
 scope:opportunity.scope,
 addressLine1:opportunity.client.addressLine1,
 addressLine2:opportunity.client.addressLine2,
 //contactNumber:opportunity.client.contactNumber,
 phoneNumberValue:opportunity.client.contactNumber != undefined && opportunity.client.contactNumber != ''? {short:opportunity.client.contactNumber.split("-")[0],code:opportunity.client.contactNumber.split("-")[1],phone:opportunity.client.contactNumber.split("-")[2]}: {short:'EG'},
 contactPerson:opportunity.client.contactPerson,
 email:opportunity.client.email,
 postCode:opportunity.client.postCode,
 commercialRegistrationNumber:opportunity.client.commercialRegistrationNumber,
 taxCardNumber:opportunity.client.taxCardNumber,
 city:opportunity.client.city,
 state:opportunity.client.state,
 country:opportunity.client.country,
 });

 

    //load clients 
    //set client
   // getClients(opportunity.lineOfBusinessId)



    //get line of business milestones
    var milestones = await getLOBMilestones({Id:opportunity.lineOfBusinessId}).unwrap()
    setProjectMilestones(milestones)

    setCheckedState(new Array(milestones.length).fill(false))

    milestones.forEach((element,i) => {
      form.setFieldsValue({
        ['checked'+i]:false,
        ['milestoneName'+i]:element.name,
        ['needPayment'+i]:element.needPayment,
        ['currency'+i]:0
      });
    });

    


    //set content on ui through map
  };

  // const handleOk = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //     setOpen(false);
  //   }, 3000);
  // };

  const handleCancel = () => {
    setOpen(false);
  };


 

// const getClients =   (lobId) => {
 
//   var lob1
//   companies.forEach(element => {
//     var lob=element.lineOfBusinesses.find(x=>x.id===lobId)
//     if(lob){
//       lob1=lob
//     }
//   });
//   console.log(lob1.clients)

  
//   setClients(lob1.clients.map(x=> ({label:x.name,value:x.id})))
 
// }


const handleChangeRetainerValidatity =   (e) => setRetainerValidatity(e.target.value)

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

const handleChangeClient =   (value) => setClientId(value[0])



const handleChangeProjectName =   (e) => setProjectName(e.target.value)


const handleChangeClientStatus =   (value) => setClientStatus(value)

const handleChangeScope =   (value) => setScope(value)

const handleChangeNote =   (e) => setNote(e.target.value)

const handleChangeContractSignatureDate =   (date, dateString) => setContractSignatureDate(dateString)
const handleChangeContractValue =   (e) => setContractValue(e.target.value)
const handleChangeContractValueCurrency =   (value) => setContractValueCurrency(value)


const handelChangeMilestoneChecked = (i) =>{
  const updatedCheckedState = checkedState.map((item, index) =>
    index === i ? !item : item
  );

  setIsValid(updatedCheckedState.some(x=>x==true))

  setActiveKey(i)

  setCheckedState(updatedCheckedState);

  setMaxIndex(updatedCheckedState.filter(x=>x==true).length)

  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      if(updatedCheckedState[i]){
      form.setFieldsValue({
    
        ['milestoneIndex'+i]:updatedCheckedState.filter(x=>x==true).length,
        
      });
      return {...obj, milestoneIndex: updatedCheckedState.filter(x=>x==true).length};
    }else{
      form.setFieldsValue({
    
        ['milestoneIndex'+i]:null,
        
      });
      return {...obj, milestoneIndex: null};
    
    }
  }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);

  
}



const handleChangeMilestoneNote =   (i,e) => {
  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      return {...obj, note: e.target.value};
    }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);
}

const handleChangeMilestoneIndex =   (i,value) => {

  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property

    // if(obj.milestoneIndex==value)
    // {
     
    //   form.setFieldsValue({
    
    //     ['milestoneIndex'+index]:projectMilestones[i].milestoneIndex,
        
    //   });
    //   return {...obj, milestoneIndex: projectMilestones[i].milestoneIndex};
    // }

    if (index === i) {
      return {...obj, milestoneIndex: value};
    }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);

 
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
  console.log(e)
  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      return {...obj, paymentValue: e};
    }

    // 👇️ otherwise return object as is
    return obj;
  });

  setProjectMilestones(newState);
}




const handleChangeCurrency =   (i,value) => {
  console.log(i)
  const newState = projectMilestones.map((obj,index) => {
    // 👇️ if id equals 2, update country property
    if (index === i) {
      return {...obj, paymentValueCurrency: value};
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


const handleChangeSearchDates = (dates, datesString) => {
  setSearchDateFrom(datesString[0])
  setSearchDateTo(datesString[1])
  loadOpportunties(pagination.current,pagination.pageSize,searchLineOfBusinessIds,datesString[0],datesString[1])
  }










const loadOpportunties = async (page,pageSize,lineOfBusinessesIds,fromDate,toDate) =>{

  var opportuntiesArray = await getOpportunities({ status:4, page, pageSize,lineOfBusinessesIds,fromDate:fromDate!=""? fromDate:null,toDate:toDate!=""?toDate:null}).unwrap()
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
 loadOpportunties(newPagination.current,newPagination.pageSize,searchLineOfBusinessIds,searchDateFrom,searchDateTo)
};



useEffect( () =>{ 
  async function fetchMyAPI() {
  
    var companiesArray = await getCompanies({}).unwrap()
    setCompanies(companiesArray)
   
    transformLineOfBusinesses(companiesArray)
   loadOpportunties( 1, pagination.pageSize,[],"","")

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
  loadOpportunties(1, pagination.pageSize,lobIds,searchDateFrom,searchDateTo)
  }else{
    setSearchLineOfBusinessIds([])
    loadOpportunties(1, pagination.pageSize,[],searchDateFrom,searchDateTo)
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
  
  


  setSearchLineOfBusinessIds([])
  setSearchDateFrom("")
  setSearchDateTo("")

  setActionLoading(false)

  form.setFieldsValue({
    searchLineOfBusinessIds:[],
    searchDates:"",
  });
}

function checkIfDuplicateExists(arr) {
  return new Set(arr).size !== arr.length
}

const duplicateMilestonesIndex =  () =>{

  return checkIfDuplicateExists(projectMilestones.filter((element,i)=>milestoneChecked(i)).map(x=>x.milestoneIndex))
  // const index=[]
  // projectMilestones.filter((element,i)=>milestoneChecked(i)).forEach(element => {
  //   if(index.filter(x=>x==element.milestoneIndex).length>0){
  //     return true
  //   }else{
  //     index.push(element.milestoneIndex)
  //   }
  // });
  // return false
}

function milestoneChecked(i) {
  return checkedState[i]
}

const handleOk = async (values) => {
  
  setIsValid(true)
  setIsValidDuplicateMilestoneIndex(true)
  if(!checkedState.every(x=>x==false) || isRetainer){

  if(!duplicateMilestonesIndex()){
  setLoading(true);

  
  
  const project = {
    ProjectName:projectName,
    LineOfBusinessId:lineOfBusinessId,
    OpportunityId:opportunityId,
    ClientId:clientId,
    //ClientStatus:clientStatus,
    Client:{
    AddressLine1:addressLine1,
    AddressLine2:addressLine2,
    PostCode:postCode,
    Email:email,
    ContactNumber:contactNumber,
    ContactPerson:contactPerson,
    CommercialRegistrationNumber: commercialRegistrationNumber,
    TaxCardnumber: taxCardNumber,
    Files: clientFileList.map(x=>({
      Id:Number(x.uid)?x.uid:-1,
      Name:x.name,
      Url:x.url,
      Status:x.status
    })),
    City:city,
    State:state,
    Country:country
  },
    Scope:scope,
    Status:0,
    ContractSignatureDate:contractSignatureDate,
    ContractValue:contractValue,
    ContractValueCurrency:contractValueCurrency,
    RetainerValidatity:retainerValidatity,
    Note:note,
    projectMilestones:projectMilestones.filter((element,i)=>milestoneChecked(i)).map(element => ({
      Status:0,
      milestoneIndex:element.milestoneIndex,
      Name:element.name,
      Description:element.Description,
      NeedPayment:element.needPayment,
      MilestoneId:element.id,
      PaymentValue:element.paymentValue,
      PaymentValueCurrency:element.paymentValueCurrency,
      DateScheduled:element.dateScheduled,
      Note:element.note
    })),
  }
  console.log(project)
  // if(commercialRegistrationNumberFile!={}){
  //   await upload({FileName:commercialRegistrationNumberFile.name, FormFile:commercialRegistrationNumberFile}).unwrap()
  // }

  // if(taxCardNumberFile!={}){
  //   await upload({FileName:taxCardNumberFile.name, FormFile:taxCardNumberFile}).unwrap()
  // }
  
  
   await saveProject(project).unwrap()
  showMessage('Project created successfully!')
     setLoading(false);
     setOpen(false);

  callbackFunction()
}else{
  setIsValidDuplicateMilestoneIndex(false)
}
}else{
  setIsValid(false)
}
  }

  const callbackFunction = useCallback(() => navigate('/progress-project', {state:{ OpportunityId: opportunityId, ProjectId:-1 }}));




const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);


  const selectContractValueAfter =  (
  

    <Select
          options={Currencies}
          style={{ width: 60 }}
          name="contractValueCurrency"
          onChange={handleChangeContractValueCurrency}
        //  placeholder="Select Contract value currency"
        value={contractValueCurrency}
          disabled
          defaultValue="0"
        />
    );


  return (
    <>
    <Descriptions title="Won opportunities"></Descriptions>
 
 
         
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
 <Modal
        visible={open}
        title="Create project"
        onOk={handleOk}
        onCancel={handleCancel}
        width='1000px'
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
        
        ]}
      >
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
       onFinish={handleOk}
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
      options={OpportunityScopes}
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
          <DatePicker style={{ width: 210 }}
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
         <InputNumber  disabled onChange={handleChangeContractValue} placeholder="Enter contract value"  addonAfter={selectContractValueAfter}  />
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
                <Input disabled placeholder="Enter Retainer Validatity" onChange={handleChangeRetainerValidatity}   />
                </Form.Item>
          
                 </Col>
           ) : null}

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Note"
         name="note"
       >
          <Input onChange={handleChangeNote}  placeholder="Enter Project note"  
             />
          </Form.Item>
    
           </Col>

           <Button key="submit" style={{marginTop:40,marginLeft:15}} type="primary" htmlType="submit"  loading={loading}  >
            Submit
          </Button>


           </Row>

          {!isValid ? <p style={{color:'red'}}>Please select and fill one milestone at least</p>:null}
          {!isValidDuplicateMilestoneIndex ? <p style={{color:'red'}}>Selected Milestones has duplicate index. Please ensure that all selected milestones have unique milestone index</p>:null}
           
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
          <Input placeholder="Enter contact person" onChange={handleChangeContactPerson}   />
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
          <Input placeholder="Enter Email" onChange={handleChangeEmail}   />
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
          <Input placeholder="Enter Address line 1" onChange={handleChangeAddressLine1}   />
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
          <Input placeholder="Enter Address line 2" onChange={handleChangeAddressLine2}   />
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
          <Input placeholder="Enter post code" onChange={handleChangePostCode}   />
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
          <Input placeholder="Enter Commercial Registration Number" onChange={handleChangeCommercialRegistrationNumber}   />
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
          <Input placeholder="Enter Tax Card Number" onChange={handleChangeTaxCardNumber}   />
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}>
       <Form.Item
         label="Files"
         name="files"
       >
          <Upload {...props} fileList={clientFileList} >
    <Button icon={<UploadOutlined />}>Click to Upload</Button>
  </Upload>
          </Form.Item>
    
           </Col>


        </Row>


           <Divider orientation="left">{isRetainer? "No Milestones for retainer " :"Milestones"}</Divider>

         {content}

     </Form>
      </Modal>
 </>
  )
}

export default CreateProject
