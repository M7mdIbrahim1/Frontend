
import {useRef, useState, useEffect, React} from 'react'
import { useGetAdminUsersMutation,useGetCompaniesMutation,useSaveCompanyMutation,useDeleteCompanyMutation,useUpdateCompanyMutation,useUnloadMutation } from "../slices/companyApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm, Checkbox,Upload } from 'antd';
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


function Companies() {

//#region grid columns
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
      title: 'Owner',
      dataIndex: 'ownerId',
      render: (ownerId) => (adminUsersOptions.length>1 ? adminUsersOptions.find(x=>x.value==ownerId).label : null),
      width: '20%',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      render: (isActive) => (isActive? "Yes" : "No"),
      width: '10%',
    },
    {
      title: 'Action',
      dataIndex: 'i',
      key: 'i',
      render: (_, record) =>  (allowedRoles(['SuperAdmin','FDBAdmin']) ? <><Button disabled={isEdit || actionLoading} type="link" htmlType="button" onClick={()=>editClick(record.id)}>
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
//#endregion

//#region setters and use functions

  const roles = useSelector(selectCurrentUserRoles);
  const allowedRoles = (checkRoles) => {
        return roles?.find(role => checkRoles?.includes(role))
  }

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

      const [companyFileList, setCompanyFileList] = useState(
        []
      );

     

     


     

      const props = {
       
        action:  async ( file ) => {
        
          const formData = new FormData()
          formData.append("formFile",file)
          formData.append("fileName",`company${companyEditId}/${file.name}`)
          const res = await axios.post("https://leveragefc-backend.onrender.com/Upload", formData)
          //await upload(formData).unwrap()
          setCompanyFileList([...companyFileList,{uid:file.uid, 
            name:file.name, 
            url:`https://leveragefc-backend.onrender.com/Download/?fileName=company${companyEditId}/${file.name}`,
            status:"done",
          }])
        },
        onChange({ file, fileList }) {
          if (file.status !== 'uploading') {
            console.log(file, fileList);
           
          }
        },
        onRemove: async (file) => {
          await unload({Name:`company${companyEditId}/${file.name}`}).unwrap()
          setCompanyFileList([...companyFileList.filter(x=>x.name!=file.name)])
        }
      };

  const [form] = Form.useForm();
  const key = 'updatable';

  const [isEdit, setIsEdit] = useState(false);
  const [companyEditId, setCompanyEditId] = useState(-1);
  const [actionLoading, setActionLoading] = useState(false)

  const [save ] = useSaveCompanyMutation();
  const [update] = useUpdateCompanyMutation()
  const [deleteCompany] = useDeleteCompanyMutation()
  const [unload ] = useUnloadMutation();
  const [getCompanies , { isLoading }] = useGetCompaniesMutation();
  const [getAdminUsers] = useGetAdminUsersMutation();

  const [companies, setCompanies] = useState([])
  const [adminUsersOptions, setAdminUsersOptions] = useState([])

  const nameRef = useRef()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [searchOwnerId, setSearchOwnerId] = useState('')
  const [searchName, setSearchName] = useState('')


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
//#endregion

//#region Handle events
  const handleChangeName =   (e) =>  setName(e.target.value)
  const handleChangeDesc =   (e) =>  setDesc(e.target.value)

  const handleChangeIsActive =   (e) => { 
    console.log(isActive)
    setIsActive(!isActive)
  }

  const handleChangeSearchName =  async (e) => {
    e.preventDefault()
    setSearchName(e.target.value)
    if(e.target.value.length>3){
      loadCompanies(e.target.value, 1, pagination.pageSize,searchOwnerId)
    
    }else{
      loadCompanies("",1, pagination.pageSize,searchOwnerId)
    
    }
  }

  const handleChangeOwner =   (value) => {
    setOwnerId(value)
  }

  const handleChangeSearchOwner =  async (value) => {
    setSearchOwnerId(value)
    loadCompanies(searchName,1, pagination.pageSize,value)
  }

  const onSearch = (value) => {
    console.log('search:', value);
  };


const handleChangeCommercialRegistrationNumber =   (e) => setCommercialRegistrationNumber(e.target.value)

const handleChangeAddressLine1 =   (e) => setAddressLine1(e.target.value)

const handleChangeAddressLine2 =   (e) => setAddressLine2(e.target.value)


const handleChangeContactNumber =   (e) => {
  console.log(e)
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

const handleChangePostCode =   (e) => setPostCode(e.target.value)

const handleChangeEmail =   (e) => setEmail(e.target.value)


//#endregion

//#region Load functions and paging

  const loadCompanies = async (name,page,pageSize,ownerId) =>{

    var companiesArray = await getCompanies({ name, page, pageSize,ownerId}).unwrap()
    var total = companiesArray != null && companiesArray.length>0 ? companiesArray[0].totalCount : 0

    setCompanies(companiesArray)

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
    loadCompanies(searchName,newPagination.current,newPagination.pageSize,searchOwnerId)
  };

  useEffect( () =>{ 
    async function fetchMyAPI() {


    const countriesOptions = Country.getAllCountries()
    setCountries(countriesOptions.map(x=>({label:`${x.flag}${x.name}`,value:x.isoCode})))
    
      var userArray = await getAdminUsers({}).unwrap()
    
      transformAdminUsers(userArray)
      loadCompanies("", 1, pagination.pageSize,"")

      form.setFieldsValue({
        isActive: true,
      });
      
    }
    fetchMyAPI()
  }, [])


  const transformAdminUsers = (adminUsers) =>{
    var adminUsersArray = []
    adminUsers.forEach((element, index) => {
      adminUsersArray.push({label: element.userName, value: element.id,disabled:!element.isActive})
    });
    setAdminUsersOptions(adminUsersArray)
  }
//#endregion

//#region actions 

  const editClick =  (id) => {
    const comp = companies.find(x=>x.id==id)
    if(comp != null){
      setIsEdit(true)
      form.setFieldsValue({
        name: comp.name,
        desc: comp.description,
        ownerId: comp.ownerId,
        addressLine1:comp.addressLine1,
        addressLine2:comp.addressLine2,
        phoneNumberValue:comp.contactNumber != undefined && comp.contactNumber != ''? {short:comp.contactNumber.split("-")[0],code:comp.contactNumber.split("-")[1],phone:comp.contactNumber.split("-")[2]}: {short:'EG'},
        contactPerson:comp.contactPerson,
        country:comp.country,
        state:comp.state,
        city:comp.city,
        email:comp.email,
        postCode:comp.postCode,
        commercialRegistrationNumber:comp.commercialRegistrationNumber,
        taxCardNumber:comp.taxCardNumber,
        isActive:comp.isActive
      });
      setName(comp.name)
      setDesc(comp.description)
      setOwnerId(comp.ownerId)
      setCompanyEditId(comp.id)
      setIsActive(comp.isActive)
      setAddressLine1(comp.addressLine1)
 setAddressLine2(comp.addressLine2)
 setContactNumber(comp.contactNumber)
 setContactPerson(comp.contactPerson)
 setTaxCardNumber(comp.taxCardNumber)
 setCommercialRegistrationNumber(comp.commercialRegistrationNumber)
 setCompanyFileList(comp.files.map(x=>({
  uid:x.id,
  name:x.name,
  url:x.url,
  status:x.status
 })))
 setEmail(comp.email)
 setPostCode(comp.postCode)
 setCountry(comp.country)
 setState(comp.state)
 setCity(comp.city)
 setPhoneNumberValue(comp.contactNumber != undefined && comp.contactNumber != ''? {short:comp.contactNumber.split("-")[0],code:comp.contactNumber.split("-")[1],phone:comp.contactNumber.split("-")[2]}: {short:'EG'})

    }
  }

  const cancelEditClick =  (e) => {
    setIsEdit(false)
    form.setFieldsValue({
      name: "",
      desc: "",
      ownerId: "",
      addressLine1:"",
      addressLine2:"",
     // contactNumber:"",
      phoneNumberValue:"",
      contactPerson:"",
      email:"",
      postCode:"",
      commercialRegistrationNumber:"",
      taxCardNumber:"",
      city:null,
      state:null,
      country:null,
      isActive:true
    });
    setName("")
    setDesc("")
    setOwnerId("")
    setAddressLine1("")
 setAddressLine2("")
 setContactNumber("")
 setPhoneNumberValue({short:'EG'})
 setContactPerson("")
 setTaxCardNumber("")
 setCommercialRegistrationNumber("")
 setCompanyFileList([])
 setEmail("")
 setPostCode("")
 setCountry("")
 setState("")
 setCity("")
    setCompanyEditId(-1)
    setIsActive(true)
  }

  const deleteClick = async (id) => {
    console.log(id)
    setActionLoading(true)
    showLoadingMessage('loading...')
      await deleteCompany({Id: id}).unwrap()
      showMessage('Company deleted successfully!')
      loadCompanies("", 1, pagination.pageSize,"")
      reset()
  }

  function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
  }

  
  const onFinishFailed = (errorInfo) => {
    console.log(phoneNumberValue)
    console.log('Failed:', errorInfo);
  };

  const onFinish = async (values) => {
      setActionLoading(true)
      showLoadingMessage('loading...')

      if(companyEditId!=-1){
        console.log({Files:companyFileList.map(x=>({
          Id:Number(x.uid)?x.uid:-1,
          Name:x.name,
          Url:x.url,
          Status:x.status
        }))})
       
        await update({Id: companyEditId,Name: name, Description: desc, OwnerId: ownerId,IsActive:isActive,
          AddressLine1:addressLine1,
          AddressLine2:addressLine2,
          PostCode:postCode,
          Email:email,
          ContactNumber:contactNumber,
          ContactPerson:contactPerson,
          CommercialRegistrationNumber: commercialRegistrationNumber,
          TaxCardnumber: taxCardNumber,
          Files: companyFileList.map(x=>({
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
        setCompanyEditId(-1)
        showMessage('Company updated successfully!')
        
      }else{
        console.log({IsActive:isActive})
      await save({Name: name, Description: desc, OwnerId: ownerId,IsActive:isActive,
        AddressLine1:addressLine1,
        AddressLine2:addressLine2,
        PostCode:postCode,
        Email:email,
        ContactNumber:contactNumber,
        ContactPerson:contactPerson,
        CommercialRegistrationNumber: commercialRegistrationNumber,
        TaxCardnumber: taxCardNumber,
        Files: companyFileList.map(x=>({
          Id:Number(x.uid)?x.uid:-1,
          Name:x.name,
          Url:x.url,
          Status:x.status
        })),
        City:city,
        State:state,
        Country:country
      }).unwrap()
        showMessage('Company created successfully!')
      }
      
      loadCompanies("", 1, pagination.pageSize,"")
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
    setOwnerId("")
    setIsActive(true)
    setSearchName("")
    setSearchOwnerId("")
    setActionLoading(false)
    setAddressLine1("")
    setAddressLine2("")
    setContactNumber("")
    setPhoneNumberValue({short:'EG'})
    setContactPerson("")
    setTaxCardNumber("")
    setCommercialRegistrationNumber("")
    setCompanyFileList([])
    setEmail("")
    setPostCode("")
    setCountry("")
    setState("")
    setCity("")

    form.setFieldsValue({
      name: "",
      desc: "",
      addressLine1:"",
      addressLine2:"",
      phoneNumberValue:"",
     // contactPerson:"",
      email:"",
      postCode:"",
      commercialRegistrationNumber:"",
      taxCardNumber:"",
      city:null,
  state:null,
  country:null,
      ownerId: null,
      isActive:true
    });
  }
  //#endregion

//#region JSX Ant
  return (
        <>
          <Descriptions title="Manage Companies"></Descriptions>
        
          {allowedRoles(['SuperAdmin','FDBAdmin']) ? (
            <>    
              <div
                className="site-layout-background"
                style={{
                  padding: 24,
                  minHeight: 150,
                }}
              >
              
                <Descriptions title="Create Company"></Descriptions>
              
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
                                label="Company Name"
                                name="name"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please input your company name!',
                                  },
                                ]}
                              >
                                <Input ref={nameRef} onChange={handleChangeName} placeholder="Enter company name"  
                                    />
                                </Form.Item>
                        
                            </Col>

                            <Col className="gutter-row" span={6}> 
                                <Form.Item
                                  label="Company Description"
                                  name="desc"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please input your company description!',
                                    },
                                  ]}
                                >
                                  <Input onChange={handleChangeDesc} placeholder="Enter company description"/>
                                </Form.Item>      
                          
                            </Col>

                            <Col className="gutter-row" span={6}> 
                                <Form.Item
                                  label="Company Owner"
                                  name="ownerId"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please select your company owner!',
                                    },
                                  ]}
                                >
                                    <Select
                                      showSearch
                                      placeholder="Select an owner"
                                      optionFilterProp="label"
                                      onChange={handleChangeOwner}
                                      onSearch={onSearch}
                                      options={adminUsersOptions}
                                      filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                      allowClear
                                    />
                                </Form.Item>
                            
                            </Col>

                            <Col className="gutter-row" span={6}> 
                                <Form.Item
                                  label=""
                                  valuePropName="checked"
                                  name="isActive"
                                >
                                  <Checkbox style={{marginTop:50}} value={isActive} onChange={handleChangeIsActive}>Active</Checkbox>
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
          <Upload {...props} fileList={companyFileList} >
    <Button disabled={companyEditId==-1} icon={<UploadOutlined />}>Click to Upload</Button>
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
                  
                        
              </div></>)  : null}


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
              
                    <Descriptions title="Companies list"></Descriptions>

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
                                          onChange={handleChangeSearchName}
                                          autoComplete="off" placeholder="Search with company name" 
                                          disabled={isEdit}
                                          />
                                    </Form.Item>
                                </Col>

                                {allowedRoles(['SuperAdmin','FDBAdmin']) ? ( <Col className="gutter-row" span={6}>
                                    <Form.Item>
                                          <Select
                                            showSearch
                                            placeholder="Search with Onwer"
                                            optionFilterProp="label"
                                            onChange={handleChangeSearchOwner}
                                            options={adminUsersOptions}
                                            name="searchOwnerId"
                                            filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                            disabled={isEdit}
                                            allowClear
                                          />
                                    </Form.Item>
                                </Col> ):null}

                              </Row>


                            
                        </Form>
              
                
              <Table
                columns={columns}
                rowKey={(record) => record.id}
                dataSource={companies}
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
//#endregion

}
export default Companies
