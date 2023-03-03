import {useRef, useState, useEffect, React} from 'react'
import { useGetCompaniesMutation,useGetMilestonesMutation,useSaveMilestoneMutation,useDeleteMilestoneMutation,useUpdateMilestoneMutation } from "../slices/milestoneApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm, Checkbox,Cascader,Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

function Milestones() {

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
      render: (_, record) => (`${record.lineOfBusiness.company.name} - ${record.lineOfBusiness.name}`),
      width: '20%',
    },
    {
      title: 'Need payment',
      dataIndex: 'needPayment',
      render: (needPayment) => (needPayment? "Yes" : "No"),
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


  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: [1,5,10,20,50,100],
    position: 'bottomCenter'
  });
 
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const key = 'updatable';


  const [isEdit, setIsEdit] = useState(false);
  const [isRetainer, setIsRetainer] = useState(false);
  const [retainer, setRetainer] = useState("");
  const [milestoneEditId, setMilestoneEditId] = useState(-1);
  const [actionLoading, setActionLoading] = useState(false)

const [save ] = useSaveMilestoneMutation();
const [update] = useUpdateMilestoneMutation()
const [deleteMilestone] = useDeleteMilestoneMutation()

const [getMilestones , { isLoading }] = useGetMilestonesMutation();
const [milestones, setMilestones] = useState([])
const [getCompanies] = useGetCompaniesMutation();
const [companiesOptions, setCompaniesOptions] = useState([])






const nameRef = useRef()
const [name, setName] = useState('')
const [desc, setDesc] = useState('')
const [needPayment, setNeedPayment] = useState(false)
const [lineOfBusinessId, setLineOfBusinessId] = useState(-1)

//const [searchLineOfBusinessId, setSearchLineOfBusinessId] = useState(-1)
const [searchName, setSearchName] = useState('')








const handleNameInput =   (e) =>  setName(e.target.value)
const handleDescInput =   (e) =>  setDesc(e.target.value)
const handleNeedPaymentInput =   (e) => { 
  setNeedPayment(!needPayment)
}


const handleSearchNameInput =  async (e) => {
  e.preventDefault()
  setSearchName(e.target.value)
  if(e.target.value.length>3){
    if(lineOfBusinessId!=-1){
    loadMilestones(e.target.value, 1, pagination.pageSize,lineOfBusinessId)
    }else{
      setMilestones([])
    }
  }else{
    if(lineOfBusinessId!=-1){
    loadMilestones("",1, pagination.pageSize,lineOfBusinessId)
    }else{
      setMilestones([])
    }
  }
}




const loadMilestones = async (name,page,pageSize,lineOfBusinessId) =>{

  var lobId = lineOfBusinessId == ""? -1 : lineOfBusinessId
  var milestonesArray = await getMilestones({ name, page, pageSize,lineOfBusinessId:lobId}).unwrap()
  var total = milestonesArray != null && milestonesArray.length>0 ? milestonesArray[0].totalCount : 0

  setMilestones(milestonesArray)

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
  loadMilestones(searchName,newPagination.current,newPagination.pageSize,lineOfBusinessId)
};



useEffect( () =>{ 
  async function fetchMyAPI() {
  
    var companiesArray = await getCompanies({}).unwrap()
   
    transformLineOfBusinesses(companiesArray)
   // loadMilestones("", 1, pagination.pageSize,"")
    
  }
  fetchMyAPI()
}, [])



const handleChangeLineOfBusiness =   (value) => {
  if (value != "" && value !=null && value.length>1){
  setLineOfBusinessId(value[1])
  const ret = companiesOptions.find(x=>x.value==value[0]).children.find(x=>x.value==value[1]).isRetainer
  setIsRetainer(ret)
  if(ret){
    setRetainer("No Milestones for retainer line of business")
  }else{
    setRetainer("")
    loadMilestones(searchName,1, pagination.pageSize,value[1])
  }
  }else{
   // loadMilestones(searchName,1, pagination.pageSize,-1)
   setLineOfBusinessId(-1)
   setSearchName("")
   searchForm.setFieldsValue({
    searchName:""
  });
  setIsRetainer(false)
  setRetainer("")
   setMilestones([])
  }
  // if (value != "" && value !=null && value.length>1){
  //   var lobId = value[1] == "" ? -1 : value[1]
  //   setSearchLineOfBusinessId(lobId)
  //   loadMilestones(searchName,1, pagination.pageSize,lobId)
  //   }else{
  //     setSearchLineOfBusinessId(-1)
  //     loadMilestones(searchName,1, pagination.pageSize,-1)
  //   }
}

// const handleChangeSearchLineOfBusiness =  async (value) => {
//   if (value != "" && value !=null && value.length>1){
//   var lobId = value[1] == "" ? -1 : value[1]
//   setSearchLineOfBusinessId(lobId)
//   loadMilestones(searchName,1, pagination.pageSize,lobId)
//   }else{
//     setSearchLineOfBusinessId(-1)
//     loadMilestones(searchName,1, pagination.pageSize,-1)
//   }
// }


const transformLineOfBusinesses = (comapniesArray) =>{
  var lineOfBusinessesArray = [{label:"",value:""}]
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
    lineOfBusinessesArray.push({label:element.name,value:element.id,disabled:element.isActive,isRetainer:element.isRetainer})
  });
  return lineOfBusinessesArray
}



const onSearch = (value) => {
  console.log('search:', value);
};


const editClick =  (id) => {
  const milestone = milestones.find(x=>x.id==id)
  console.log(milestone.needPayment)
  if(milestone != null){
setIsEdit(true)
form.setFieldsValue({
  name: milestone.name,
  desc: milestone.description,
  lineOfBusinessId: [milestone.lineOfBusiness.company.id, milestone.lineOfBusinessId],
  needPayment: milestone.needPayment
});
 setName(milestone.name)
 setDesc(milestone.description)
 setLineOfBusinessId(milestone.lineOfBusinessId)
 setNeedPayment(milestone.needPayment)
 setMilestoneEditId(milestone.id)
  }
  
}

const cancelEditClick =  (e) => {
  setIsEdit(false)
  form.setFieldsValue({
    name: "",
    desc: "",
   // lineOfBusinessId: null,
    needPayment: false
  });
   setName("")
   setDesc("")
   setNeedPayment(false)
  // setLineOfBusinessId(-1)
   setMilestoneEditId(-1)
  }

const deleteClick = async (id) => {

  setActionLoading(true)
  showLoadingMessage('loading...')
    await deleteMilestone({Id: id}).unwrap()
    showMessage('Milestone deleted successfully!')
    loadMilestones("", 1, pagination.pageSize,"")
    reset()
    
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

const onFinish = async (values) => {
  
  
          setActionLoading(true)
          showLoadingMessage('loading...')
        if(milestoneEditId!=-1){
          await update({Id: milestoneEditId,Name: name, Description: desc, LineOfBusinessId: lineOfBusinessId, needPayment}).unwrap()
          setIsEdit(false)
          setMilestoneEditId(-1)
          showMessage('Milestone updated successfully!')
          
        }else{
        await save({Name: name, Description: desc, LineOfBusinessId: lineOfBusinessId, needPayment}).unwrap()
          showMessage('Milestone created successfully!')
        }
        
        loadMilestones(searchName, 1, pagination.pageSize,lineOfBusinessId)
       
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
 // setLineOfBusinessId(-1)
 // setSearchName("")
  //setSearchLineOfBusinessId(-1)
  setActionLoading(false)
  setNeedPayment(false)
  form.setFieldsValue({
    name: "",
    desc: "",
  //  lineOfBusinessId: [],
    needPayment:false,
    //searchName:""
  });
  // searchForm.setFieldsValue({
  //   searchName:""
  // });
}


const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);


  return (
    <>
    <Descriptions title="Manage Milestones"></Descriptions>
 
   {allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin']) ? (
     <>
              
         <div
           className="site-layout-background"
           style={{
             padding: 24,
             minHeight: 150,
           }}
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

<Descriptions title="Choose Line of business"></Descriptions>

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
        </Row>

         <Row gutter={{
         xs: 8,
         sm: 16,
         md: 24,
         lg: 32,
       }}>

<Descriptions title="Milestone details"></Descriptions>
       <Col className="gutter-row" span={6}>
       <Form.Item
         label="Milestone Name"
         name="name"
         rules={[
           {
             required: true,
             message: 'Please input Milestone name!',
           },
         ]}
       >
          <Input onChange={handleNameInput} placeholder="Enter Milestone name"  
             />
          </Form.Item>
    
           </Col>
       <Col className="gutter-row" span={6}> 
       <Form.Item
         label="Milestone Description"
         name="desc"
         rules={[
           {
             required: true,
             message: 'Please input Milestone description!',
           },
         ]}
       >
          <Input onChange={handleDescInput} placeholder="Enter Milestone description"/>
          </Form.Item>
      
           </Col>
      


        <Col className="gutter-row" span={4}> 
       <Form.Item
       
         label=""
         name="needPayment"
       >
      <Checkbox style={{marginTop:50}} value={needPayment} onChange={handleNeedPaymentInput}>Need payment</Checkbox>
   </Form.Item>
       
        </Col>

        
        <Col className="gutter-row" span={6}> 
        <Tooltip title={retainer}>
          <Button style={{width:"100px",marginTop:40}}  disabled={actionLoading || isRetainer} type="primary" htmlType="submit">
         {!isEdit? 'Add' : 'Update'} 
        </Button>
        </Tooltip>
         {isEdit? (
 <Button style={{width:"100px",marginTop:40,marginLeft:5}}  disabled={actionLoading} type="primary" danger  onClick={cancelEditClick}>
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
       
       <Descriptions title="Milestones list"></Descriptions>
 
       <div  style={{paddingLeft:15}}>
       <Form
        form={searchForm}
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
        
         <Form.Item
       
       label=""
       name="searchName"
     >
         <Input name="searchName"
             onChange={handleSearchNameInput}
             autoComplete="off" placeholder="Search with milestone name" 
             disabled={isEdit}
             />
             </Form.Item>
         
           </Col>
          {/* <Col className="gutter-row" span={6}>
         <Form.Item>
         <Cascader
    options={companiesOptions}
    onChange={handleChangeSearchLineOfBusiness}
    placeholder="Please select line of business"
    showSearch={{
      filter,
    }}
    onSearch={(value) => console.log(value)}
    disabled={isEdit}
  />
   </Form.Item>
         
       </Col>  */}
       </Row>
       </Form>
  
   
  <Table
       columns={columns}
       rowKey={(record) => record.id}
       dataSource={milestones}
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

export default Milestones