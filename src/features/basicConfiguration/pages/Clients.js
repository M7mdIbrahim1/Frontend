import {useRef, useState, useEffect, React} from 'react'
import { useGetCompaniesMutation,useGetClientsMutation,useSaveClientMutation,useDeleteClientMutation,useUpdateClientMutation, useUnloadMutation } from "../slices/clientApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm, Checkbox,Cascader,Upload } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons';

import { Country, State, City }  from 'country-state-city';
import axios from "axios";


import CountryPhoneInput, {
  CountryPhoneInputValue,
  ConfigProvider,
} from 'antd-country-phone-input';
import en from 'world_countries_lists/data/countries/en/world.json';

function Clients() {

  const roles = useSelector(selectCurrentUserRoles);
  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      width: '20%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '30%',
    },
    {
      title: 'Line of business',
      dataIndex: 'Lob',
      render: (_, record) => (renderLineOfBusinesses(record.lineOfBusinesses)),
      width: '20%',
    },
    {
      title: 'Action',
      dataIndex: 'i',
      key: 'i',
      render: (_, record) =>  (allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin']) ? <><Button disabled={isEdit || actionLoading} type="link" htmlType="button" onClick={()=>editClick(record.id)}>
      <EditOutlined />edit
       </Button>
       <Popconfirm title="Sure to delete?" onConfirm={() => deleteClick(record.id)}>
       <Button disabled={isEdit || actionLoading} type="link" htmlType="button" danger >
       <DeleteOutlined />Delete
       </Button>
       </Popconfirm>
       </>:null),
    },
  ];


  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: [1,5,10,20,50,100],
    position: 'bottomCenter'
  });

  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

      const [clientFileList, setClientFileList] = useState(
        []
      );

     

     


     

      const props = {
       
        action:  async ( file ) => {
        
          const formData = new FormData()
          formData.append("formFile",file)
          formData.append("fileName",`client${clientEditId}/${file.name}`)
          const res = await axios.post("http://3.75.83.162/api/Upload", formData)
          //await upload(formData).unwrap()
          setClientFileList([...clientFileList,{uid:file.uid, 
            name:file.name, 
            url:`http://3.75.83.162/api/Download/?fileName=client${clientEditId}/${file.name}`,
            status:"done",
          }])
        },
        onChange({ file, fileList }) {
          if (file.status !== 'uploading') {
            console.log(file, fileList);
           
          }
        },
        onRemove: async (file) => {
          await unload({Name:`client${clientEditId}/${file.name}`}).unwrap()
          setClientFileList([...clientFileList.filter(x=>x.name!=file.name)])
        }
      };
 
  const [form] = Form.useForm();
  const key = 'updatable';


  const [isEdit, setIsEdit] = useState(false);
  const [clientEditId, setClientEditId] = useState(-1);
  const [actionLoading, setActionLoading] = useState(false)

const [save ] = useSaveClientMutation();
const [update] = useUpdateClientMutation()
const [deleteClient] = useDeleteClientMutation()
const [unload ] = useUnloadMutation();

const [getClients , { isLoading }] = useGetClientsMutation();
const [clients, setClients] = useState([])
const [getCompanies] = useGetCompaniesMutation();
const [companies, setCompanies] = useState([])
const [companiesOptions, setCompaniesOptions] = useState([])






const nameRef = useRef()
const [name, setName] = useState('')
const [desc, setDesc] = useState('')
const [lineOfBusinessIds, setLineOfBusinessIds] = useState([])

const [clientFileDirectory, setClientFileDirectory] = useState('')
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

const [searchLineOfBusinessIds, setSearchLineOfBusinessIds] = useState([])
const [searchName, setSearchName] = useState('')




const renderLineOfBusinesses = (lineOfBusinesses) =>{
  console.log(lineOfBusinesses)
  var lobs = ""
  const comps = []
  lineOfBusinesses.forEach(element => {
    if(!comps.find(x=>x.id == element.company.id)){
        comps.push({id:element.company.id,name:element.company.name})
    }
  });
  console.log(comps)
  comps.forEach((element,i) => {
    if(i==0){
      lobs =    `(${element.name} - ${returnCompanyLOBs(element.id,lineOfBusinesses)})\n`
    }else{
       lobs +=    `(${element.name} - ${returnCompanyLOBs(element.id,lineOfBusinesses)})\n`
    }
  })
  console.log(lobs)
  return lobs  
}

const returnCompanyLOBs = (compId, lineOfBusinesses) =>{
  var lobs = ""
  var companyLOBs = [...lineOfBusinesses.filter(x=>x.company.id==compId)]
  console.log(companyLOBs)
  companyLOBs.forEach((element, index) => {
    if(index==0){
      lobs += `${element.name}`
    }else{
    lobs += `, ${element.name}`
    }
  });
  console.log(lobs)
  return lobs 
}


const handleNameInput =   (e) => { 
  setName(e.target.value)
}
const handleDescInput =   (e) =>  setDesc(e.target.value)


const handleChangeCommercialRegistrationNumber =   (e) => setCommercialRegistrationNumber(e.target.value)

const handleChangeAddressLine1 =   (e) => setAddressLine1(e.target.value)

const handleChangeAddressLine2 =   (e) => setAddressLine2(e.target.value)


const handleChangePostCode =   (e) => setPostCode(e.target.value)

const handleChangeEmail =   (e) => setEmail(e.target.value)

const handleChangeContactNumber =   (e) => {
  setPhoneNumberValue(e)
  setContactNumber(`${e.short}-${e.code}-${e.phone}`)}

const handleChangeContactPerson =   (e) => setContactPerson(e.target.value)

const handleChangeTaxCardNumber =   (e) => setTaxCardNumber(e.target.value)


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


const handleSearchNameInput =  async (e) => {
  e.preventDefault()
  setSearchName(e.target.value)
  if(e.target.value.length>3){
    loadClients(e.target.value, 1, pagination.pageSize,searchLineOfBusinessIds)
  }else{
    loadClients("",1, pagination.pageSize,searchLineOfBusinessIds)
  }
}





const loadClients = async (name,page,pageSize,lineOfBusinessIds) =>{

  //var lobId = lineOfBusinessId == ""? -1 : lineOfBusinessId
  var clientsArray = await getClients({ name, page, pageSize,lineOfBusinessIds}).unwrap()
  var total = clientsArray != null && clientsArray.length>0 ? clientsArray[0].totalCount : 0

  setClients(clientsArray)

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
  loadClients(searchName,newPagination.current,newPagination.pageSize,searchLineOfBusinessIds)
};



useEffect( () =>{ 
  async function fetchMyAPI() {

    const countriesOptions = Country.getAllCountries()
    setCountries(countriesOptions.map(x=>({label:`${x.flag}${x.name}`,value:x.isoCode})))
  
    var companiesArray = await getCompanies({}).unwrap()
    setCompanies(companiesArray)

    transformLineOfBusinesses(companiesArray)
    loadClients("", 1, pagination.pageSize,[])
    
  }
  fetchMyAPI()
}, [])



const handleChangeLineOfBusiness =   (value) => {
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
  setLineOfBusinessIds(lobIds)
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
  loadClients(searchName,1, pagination.pageSize,lobIds)
  }else{
    setSearchLineOfBusinessIds([])
    loadClients(searchName,1, pagination.pageSize,[])
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


const editClick =  (id) => {
  const client = clients.find(x=>x.id==id)
  console.log(client)
  if(client != null){
    var lobIds = []
    client.lineOfBusinesses.forEach(element => {
     // if(lobIds.length==0){
        lobIds.push([element.company.id, element.id])
      // }
      // else if(lobIds.length>0)
      // {
      //   var index = lobIds.findIndex(x=>x[0]== element.company.id)
      //   if(index>=0){
      //     lobIds[index] = [...lobIds[index], element.id]
      //   }else{
      //     lobIds.push([element.company.id, element.id])
      //   }
      // }
    })
    console.log(lobIds)
setIsEdit(true)
form.setFieldsValue({
  name: client.name,
  desc: client.description,
  addressLine1:client.addressLine1,
  addressLine2:client.addressLine2,
  phoneNumberValue:client.contactNumber != undefined && client.contactNumber != ''? {short:client.contactNumber.split("-")[0],code:client.contactNumber.split("-")[1],phone:client.contactNumber.split("-")[2]}: {short:'EG'},
  contactPerson:client.contactPerson,
   email:client.email,
 postCode:client.postCode,
   commercialRegistrationNumber:client.commercialRegistrationNumber,
   taxCardNumber:client.taxCardNumber,
   city:client.city,
   state:client.state,
   country:client.country,
  lineOfBusinessIds: lobIds,
});
 setName(client.name)
 setDesc(client.description)
 setAddressLine1(client.addressLine1)
 setAddressLine2(client.addressLine2)
 setContactNumber(client.contactNumber)
 setContactPerson(client.contactPerson)
 setTaxCardNumber(client.taxCardNumber)
 setCommercialRegistrationNumber(client.commercialRegistrationNumber)
 setClientFileList(client.files.map(x=>({
  uid:x.id,
  name:x.name,
  url:x.url,
  status:x.status
 })))
 setEmail(client.email)
 setPostCode(client.postCode)
 setCountry(client.country)
 setState(client.state)
 setCity(client.city)
 setClientEditId(client.id)
 setLineOfBusinessIds(client.lineOfBusinesses.map(x=>x.id))

 setPhoneNumberValue(client.contactNumber != undefined && client.contactNumber != ''? {short:client.contactNumber.split("-")[0],code:client.contactNumber.split("-")[1],phone:client.contactNumber.split("-")[2]}: {short:'EG'})
  }
  
}

const cancelEditClick =  (e) => {
  setIsEdit(false)
  form.setFieldsValue({
    name: "",
    desc: "",
    addressLine1:"",
  addressLine2:"",
  //contactNumber:"",
  contactPerson:"",
  phoneNumberValue:{short:"EG"},
  email:"",
  postCode:"",
  commercialRegistrationNumber:"",
  taxCardNumber:"",
  city:null,
  state:null,
  country:null,
    lineOfBusinessIds: null,
  });
   setName("")
   setDesc("")
   setAddressLine1("")
 setAddressLine2("")
 setContactNumber("")
 setContactPerson("")
 setTaxCardNumber("")
 setCommercialRegistrationNumber("")
 setClientFileList([])
 setEmail("")
 setPostCode("")
 setCountry("")
 setState("")
 setCity("")
   setLineOfBusinessIds([])
   setClientEditId(-1)
   setPhoneNumberValue({short:'EG'})
  }

const deleteClick = async (id) => {

  setActionLoading(true)
  showLoadingMessage('loading...')
    await deleteClient({Id: id}).unwrap()
    showMessage('Client deleted successfully!')
    loadClients("", 1, pagination.pageSize,[])
    reset()
    
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

const onFinish = async (values) => {
  
  
          setActionLoading(true)
          showLoadingMessage('loading...')
        if(clientEditId!=-1){
          console.log(lineOfBusinessIds)
          console.log(clientFileList)
          
          await update({Id: clientEditId,Name: name, Description: desc, LineOfBusinesses: lineOfBusinessIds.map(x=>({Id:x})),
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
          }).unwrap()
          setIsEdit(false)
          setClientEditId(-1)
          showMessage('Client updated successfully!')
          
        }else{
        await save({Name: name, Description: desc, LineOfBusinesses: lineOfBusinessIds.map(x=>({Id:x})),
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
        }).unwrap()
          showMessage('Client created successfully!')
        }
        
        loadClients("", 1, pagination.pageSize,[])
       
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
  setName("")
  setDesc("")
  setAddressLine1("")
  setAddressLine2("")
  setContactNumber("")
  setContactPerson("")
  setTaxCardNumber("")
  setCommercialRegistrationNumber("")
  setClientFileList([])
  setEmail("")
  setPostCode("")
  setCountry("")
  setState("")
  setCity("")
  setLineOfBusinessIds([])
  setSearchName("")
  setSearchLineOfBusinessIds([])
  setActionLoading(false)
  setPhoneNumberValue({short:'EG'})
  form.setFieldsValue({
    name: "",
    desc: "",
    addressLine1:"",
    addressLine2:"",
    phoneNumberValue:{short:'EG'},
    contactPerson:"",
    email:"",
    postCode:"",
    commercialRegistrationNumber:"",
    taxCardNumber:"",
    city:null,
  state:null,
  country:null,
    lineOfBusinessIds: null,
   // needPayment:false
  });
}


const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);


  return (
    <>
    <Descriptions title="Manage Clients"></Descriptions>
 
   {allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin']) ? (
     <>
              
         <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 150,
           }}
         >
        
         <Descriptions title="Create Client"></Descriptions>
        
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
         label="Client Name"
         name="name"
         rules={[
           {
             required: true,
             message: 'Please input Client name!',
           },
         ]}
       >
          <Input onChange={handleNameInput} placeholder="Enter Client name"  
             />
          </Form.Item>
    
           </Col>
       <Col className="gutter-row" span={6}> 
       <Form.Item
         label="Client Description"
         name="desc"
         rules={[
           {
             required: true,
             message: 'Please input Client description!',
           },
         ]}
       >
          <Input onChange={handleDescInput} placeholder="Enter Client description"/>
          </Form.Item>
      
           </Col>
       <Col className="gutter-row" span={12}> 
       <Form.Item
         label="Line Of Business"
         name="lineOfBusinessIds"
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
    multiple
    maxTagCount="responsive"
    showSearch={{
      filter,
    }}
    onSearch={(value) => console.log(value)}
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
        value={phoneNumberValue}
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
    <Button disabled={clientEditId==-1} icon={<UploadOutlined />}>Click to Upload</Button>
  </Upload>
          </Form.Item>
    
           </Col>

           <Col className="gutter-row" span={6}> 
        
        <Button style={{width:"100px"}}  disabled={actionLoading} type="primary" htmlType="submit">
       {!isEdit? 'Save' : 'Update'} 
      </Button>
     
       {isEdit? (
<Button style={{width:"100px",marginLeft:5}}  disabled={actionLoading} type="primary" danger  onClick={cancelEditClick}>
cancel
</Button> ):null}
</Col>
        </Row>
     </Form>

     
        
             
             </div>
             </>)  : null}
 
 
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
       
       <Descriptions title="Clients list"></Descriptions>
 
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
         <Input name="searchName"
             onChange={handleSearchNameInput}
             autoComplete="off" placeholder="Search with client name" 
             disabled={isEdit}
             />
             </Form.Item>
         
           </Col>
          <Col className="gutter-row" span={12}>
         <Form.Item>
         <Cascader
    options={companiesOptions}
    onChange={handleChangeSearchLineOfBusiness}
    placeholder="Please select line of business"
    showSearch={{
      filter,
    }}
    multiple
    maxTagCount="responsive"
    onSearch={(value) => console.log(value)}
    disabled={isEdit}
  />
   </Form.Item>
         
       </Col> 
       </Row>

       </Form>
  
   
  <Table
       columns={columns}
       rowKey={(record) => record.id}
       dataSource={clients}
       pagination={pagination}
       loading={isLoading}
       onChange={handleTableChange}
       size="default"
       rowClassName="editable-row"
     />
     </div>
   
 </div>
 </>
  )
}

export default Clients