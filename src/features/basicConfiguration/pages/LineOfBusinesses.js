import {useRef, useState, useEffect, React} from 'react'
import { useGetLineOfBusinessesMutation,useGetCompaniesMutation,useSaveLOBMutation,useDeleteLobMutation,useUpdateLOBMutation } from "../slices/lineOfBusinessApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm, Checkbox,Popover } from 'antd';
import {
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

function LineOfBusinesses() {

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
        width: '20%',
      },
      {
        title: 'Company',
        dataIndex: 'company',
        render: (_, record) => (record.company.name),
        width: '20%',
      },
      {
        title: 'Retainer',
        dataIndex: 'isRetainer',
        render: (isRetainer) => (isRetainer? "Yes" : "No"),
        width: '10%',
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
    
    const [form] = Form.useForm();
    const key = 'updatable';


    const [isEdit, setIsEdit] = useState(false);
    const [lobEditId, setLobEditId] = useState(-1);
    const [actionLoading, setActionLoading] = useState(false)

    const [save ] = useSaveLOBMutation();
    const [update] = useUpdateLOBMutation()
    const [deleteLob] = useDeleteLobMutation()
    const [getLineOfBusinesses , { isLoading }] = useGetLineOfBusinessesMutation();
    const [getCompanies ] = useGetCompaniesMutation();

  
    const [lineOfBusinesses, setLineOfBusinesses] = useState([])
    const [companiesOptions, setCompaniesOptions] = useState([])
    const [companyGroupOptions, setCompanyGroupOptions] = useState([])
    const [companyGroupId, setCompanyGroupId] = useState(-1)
    const [companyGroupName, setCompanyGroupName] = useState("")


    const nameRef = useRef()
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
   // const [grouping, setGrouping] = useState('')
    const [companyId, setCompanyId] = useState(-1)
    const [isActive, setIsActive] = useState(true)
    const [isRetainer, setIsRetainer] = useState(false)

    const [searchCompanyId, setSearchCompanyId] = useState(-1)
    const [searchName, setSearchName] = useState()
    const [invalid, setInvalid] = useState(false);
  
//#endregion

//#region Handle events 

      const handleChangeName =   (e) =>  setName(e.target.value)
      
      const handleClientCompanyGroupNameInput =   (e) =>  setCompanyGroupName(e.target.value)
      const handleChangeDesc =   (e) =>  setDesc(e.target.value)

      const handleChangeIsActive =   (e) => { 
        setIsActive(!isActive)
      }

      const handleChangeIsRetainer =   (e) => { 
        setIsRetainer(!isRetainer)
      }

      const handleChangeSearchName =  async (e) => {
        e.preventDefault()
        setSearchName(e.target.value)
        if(e.target.value.length>3){
          loadLineOfBusinesses(e.target.value, 1, pagination.pageSize,searchCompanyId)
        
        }else{
          loadLineOfBusinesses("",1, pagination.pageSize,searchCompanyId)
        
        }
      }

      const handleChangeCompany =   (value) => {
        setCompanyGroupId(-1)
        setCompanyGroupOptions([])
        form.setFieldsValue({
          companyGroupId: null,
        });
        if(value){
        
        setCompanyId(value)
        const company = companiesOptions.find(x=>x.value==value)
        if(company.companyGroups && company.companyGroups.length>0){
        setCompanyGroupOptions(company.companyGroups.map(x=>({label: x.name, value: x.id})))
        }else{
          setCompanyGroupOptions([])
        }
        }else{
          setCompanyId(-1)
        }
        
      }

      const handleChangeCompanyGroup = (value) => {
        setCompanyGroupId(value)
      }

      const handleChangeSearchCompany =  async (value) => {
        var compId = value == "" ? -1 : value
        setSearchCompanyId(compId)
        console.log(compId)
        loadLineOfBusinesses(searchName,1, pagination.pageSize,compId)
      }

      const onSearch = (value) => {
        console.log('search:', value);
      };


  const addCompanyGroup = () => {
    
    setInvalid(false)
    if(companyGroupName!= "" && companyId!=-1){
      if(companyGroupOptions && companyGroupOptions.length>0){
    var c = companyGroupOptions.filter(x=>x.value!=-2)
    setCompanyGroupOptions(c)
    setCompanyGroupOptions([...c,{label:companyGroupName,value:-2}])
      }else{
        setCompanyGroupOptions([{label:companyGroupName,value:-2}])
      }

    

    setCompanyGroupId(-2)

    form.setFieldsValue({
      companyGroupId: -2,
    });
    hide()
  }else{
    setInvalid(true)
  }

   

  }

  const [open, setOpen] = useState(false);

  const hide = () => {
    console.log("hide")
    setOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };
  
//#endregion

//#region Load functions and paging
  
      
    const loadLineOfBusinesses = async (name,page,pageSize,companyId) =>{

      var compId = companyId == ""? -1 : companyId
      console.log({ name, page, pageSize,compId})
      var lobArray = await getLineOfBusinesses({ name, page, pageSize,companyId:compId}).unwrap()
      var total = lobArray != null && lobArray.length>0 ? lobArray[0].totalCount : 0

      setLineOfBusinesses(lobArray)

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
      loadLineOfBusinesses(searchName,newPagination.current,newPagination.pageSize,searchCompanyId)
    };



    useEffect( () =>{ 
      async function fetchMyAPI() {
      
        var companiesArray = await getCompanies({}).unwrap()
      
        transformCompanies(companiesArray)
        loadLineOfBusinesses("", 1, pagination.pageSize,"")

        form.setFieldsValue({
          isActive: true,
        });
        
      }
      fetchMyAPI()
    }, [])


    const transformCompanies = (companies) =>{
      var comapniesArray = []
      companies.forEach((element, index) => {
        comapniesArray.push({label: element.name, value: element.id,disabled:!element.isActive,companyGroups:element.companyGroups? element.companyGroups: []})
      });
      setCompaniesOptions(comapniesArray)
    }

    // const transformCompanyGroups = (companies) =>{
    //   var comapnyGroupsArray = []
    //   companies.forEach((element, index) => {
    //     element.companyGroups.forEach(cg => {
    //       comapnyGroupsArray.push({label: cg.name, value: cg.id})
    //     });
    //   });
    //   setCompanyGroupOptions(comapnyGroupsArray)
    // }

//#endregion

//#region actions 

      const editClick =  (id) => {
       
        const lob = lineOfBusinesses.find(x=>x.id==id)
        console.log(lob)
        if(lob != null){
          const company = companiesOptions.find(x=>x.value==lob.companyId)
          if(company.companyGroups && company.companyGroups.length>0){
            console.log(companyGroupOptions)
          setCompanyGroupOptions(company.companyGroups.map(x=>({label: x.name, value: x.id})))
          console.log(companyGroupOptions)
          
          }

        console.log(lob.companyGroupId)

      setIsEdit(true)

      form.setFieldsValue({
        name: lob.name,
        desc: lob.description,
        companyId: lob.companyId,
        isActive: lob.isActive,
        isRetainer: lob.isRetainer,
        companyGroupId: lob.companyGroupId
      });

      setName(lob.name)
      setCompanyGroupId(lob.CompanyGroupId)
      setDesc(lob.description)
      setCompanyId(lob.companyId)
      setLobEditId(lob.id)
      setIsActive(lob.isActive)
      setIsRetainer(lob.isRetainer)
        }
        
      }

      const cancelEditClick =  (e) => {
        setIsEdit(false)
        form.setFieldsValue({
          name: "",
          desc: "",
          companyId: null,
          isActive:true,
          isRetainer:false,
          companyGroupId:null
        });
        setName("")
        setCompanyGroupId(-1)
        setCompanyGroupOptions([])
        setDesc("")
        setCompanyId(-1)
        setLobEditId(-1)
        setIsActive(true)
        setIsRetainer(false)
        }

      const deleteClick = async (id) => {

        setActionLoading(true)
        showLoadingMessage('loading...')
          await deleteLob({Id: id}).unwrap()
          showMessage('Line of business deleted successfully!')
          loadLineOfBusinesses("", 1, pagination.pageSize,"")
          reset()
          
        }

        const onFinishFailed = (errorInfo) => {
          console.log('Failed:', errorInfo);
        };

      const onFinish = async (values) => {
        
        
                setActionLoading(true)
                showLoadingMessage('loading...')
              if(lobEditId!=-1){
                var lob = {Id: lobEditId,Name: name, Description: desc, CompanyId: companyId, isActive,isRetainer,CompanyGroupId:companyGroupId,CompanyGroup:null}
                if(companyGroupId==-2){
                  lob.CompanyGroup = {Name:companyGroupName,CompanyId:companyId}
                }
                await update(lob).unwrap()
                setIsEdit(false)
                setLobEditId(-1)
                showMessage('Line of business updated successfully!')
                
              }else{
                var lob = {Name: name, Description: desc, CompanyId: companyId, isActive,isRetainer,CompanyGroupId:companyGroupId,CompanyGroup:null}
                if(companyGroupId==-2){
                  lob.CompanyGroup = {Name:companyGroupName,CompanyId:companyId}
                }
              await save(lob).unwrap()
                showMessage('Line of business created successfully!')
              }
              
              loadLineOfBusinesses("", 1, pagination.pageSize,"")
            
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
        setCompanyGroupId(-1)
        setCompanyGroupOptions([])
        setCompanyId(-1)
        setSearchName("")
        setSearchCompanyId(-1)
        setActionLoading(false)
        setIsActive(true)
        setIsRetainer(false)
        form.setFieldsValue({
          name: "",
          desc: "",
          companyId: null,
          isActive: true,
          isRetainer: false,
          companyGroupId:null
        });
      }

//#endregion

//#region JSX Ant

const addNewCompanyGroup =  (
  
  <Popover
      content={<>
      <Input disabled={companyId==-1} placeholder='Name' name="companyGroupName" onChange={handleClientCompanyGroupNameInput}></Input>
      
      <Button disabled={companyGroupName===''&&companyId==-1} type="primary" onClick={addCompanyGroup}>Add</Button>
      {/* <a onClick={hide}>Close</a> */}
      {invalid? <Descriptions size="small" contentStyle={{color:"red"}}>Please fill company group name</Descriptions> : null}
      </>}
      title="New Company Group"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Button style={{marginTop:39}} disabled={companyId==-1} type="primary">+</Button>
    </Popover>
    
  );

    return (
      <>
        <Descriptions title="Manage Line of businesses"></Descriptions>

        {allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin']) ? (
            <div
              className="site-layout-background"
              style={{
                padding: 24,
                minHeight: 150,
              }}
            >
              
              <Descriptions title="Create Line of business"></Descriptions>
                
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
                                label="Line of business Name"
                                name="name"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please input Line of business name!',
                                  },
                                ]}
                              >
                                    <Input onChange={handleChangeName} placeholder="Enter Line of business name"  />
                               </Form.Item>
                    
                      </Col>

                      <Col className="gutter-row" span={6}> 
                          <Form.Item
                          label="Line of business Description"
                          name="desc"
                          rules={[
                            {
                              required: true,
                              message: 'Please input Line of business description!',
                            },
                          ]}
                          >
                              <Input onChange={handleChangeDesc} placeholder="Enter Line of business description" />
                          </Form.Item>
                      </Col>      

                      <Col className="gutter-row" span={6}> 
                          <Form.Item
                            label="Company"
                            name="companyId"
                            rules={[
                              {
                                required: true,
                                message: 'Please select company!',
                              },
                            ]}
                          >
                                <Select
                                  showSearch
                                  placeholder="Select company"
                                  optionFilterProp="label"
                                  onChange={handleChangeCompany}
                                  onSearch={onSearch}
                                  options={companiesOptions}
                                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                  allowClear
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
                          label="Grouping"
                          name="companyGroupId"
                         
                          >
                             <Select
                                  showSearch
                                  placeholder="Select Line of business grouping"
                                  optionFilterProp="label"
                                  onChange={handleChangeCompanyGroup}
                                  onSearch={onSearch}
                                  options={companyGroupOptions}
                                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                  allowClear
                                
                                />
                               
                          </Form.Item>
                      </Col>    

                      <Col className="gutter-row" span={3}> 
                          {addNewCompanyGroup}
                      </Col>

                    <Col className="gutter-row" span={3}> 
                        <Form.Item
                          label=""
                          valuePropName="checked"
                          name="isActive"
                        >
                            <Checkbox style={{marginTop:39}}  value={isActive} onChange={handleChangeIsActive}>Active</Checkbox>
                        </Form.Item>
                    </Col>

                    <Col className="gutter-row" span={3}> 
                        <Form.Item
                          label=""
                          valuePropName="checked"
                          name="isRetainer"
                        >
                          <Checkbox style={{marginTop:39}}  value={isRetainer} onChange={handleChangeIsRetainer}>Retainer</Checkbox>
                        </Form.Item>
                    </Col>

                    <Col className="gutter-row" span={6}> 
                      
                      <Button style={{width:"100px",marginTop:39}}  disabled={actionLoading} type="primary" htmlType="submit">
                      {!isEdit? 'Save' : 'Update'} 
                      </Button>
                    
                      {isEdit? (
                        <Button style={{width:"100px",marginLeft:5}}  disabled={actionLoading} type="primary" danger  onClick={cancelEditClick}>
                          cancel
                        </Button> ):null}
                    </Col>
                </Row>
             </Form>   
          </div>)  : null}


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
          
                <Descriptions title="Line of businesses list"></Descriptions>

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
                                              autoComplete="off" placeholder="Search with line of business name" 
                                              disabled={isEdit}
                                              />
                                              </Form.Item>
                                      </Col>

                                      <Col className="gutter-row" span={6}>
                                            <Form.Item>
                                                  <Select
                                                      showSearch
                                                      placeholder="Search with Company"
                                                      optionFilterProp="label"
                                                      onChange={handleChangeSearchCompany}
                                                      options={companiesOptions}
                                                      name="searchCompanyId"
                                                      filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                                      disabled={isEdit}
                                                      allowClear
                                                  />
                                            </Form.Item>
                                    
                                      </Col> 
                              </Row>
                        </Form>

            
                  <Table
                      columns={columns}
                      rowKey={(record) => record.id}
                      dataSource={lineOfBusinesses}
                      pagination={pagination}
                      loading={isLoading}
                      onChange={handleTableChange}
                      size="default"
                      rowClassName="editable-row"
                  />
            </div>
      </div>
    </>)

//#endregion
 
}

export default LineOfBusinesses