
import { useState, useEffect, React} from 'react'
import { useGetUsersMutation,useGetCompaniesMutation,useGetRolesMutation,useEditUserMutation } from "../slices/userApiSlice"
import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../../auth/slices/authSlice'
import { Col, Row,Button,message,Descriptions, Form , Input, Select, Table, Popconfirm,Cascader } from 'antd';
import {
  EditOutlined
} from '@ant-design/icons';

function UsersList() {

  const roles = useSelector(selectCurrentUserRoles);
  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'userName',
      sorter: true,
      width: '20%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '20%',
    },
    {
      title: 'Company - Line of businesses',
      dataIndex: 'company',
      render: (_, record) => (`${record.company.name ? record.company.name : ""} - ${record.lineOfBusinesses.map(x=>x.name).join()}`),
      width: '30%',
    },
    {
      title: 'Roles',
      dataIndex: 'userRoles',
      render: (_, record) => (record.userRoles.join()),
      width: '20%',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      render: (isActive) => (isActive? "Yes" : "No"),
    },
    {
      title: 'Action',
      dataIndex: 'i',
      key: 'i',
      render: (_, record) =>  (allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin']) ? <>
       <Popconfirm title={record.isActive? "sure to deactivate?" : "sure to activate?"} onConfirm={() => editClick(record.id,!record.isActive)}>
       <Button disabled={actionLoading} type="link" htmlType="button" danger >
       <EditOutlined />{record.isActive? "Deactivate" : "Activate"}
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

  const key = 'updatable';

  const [actionLoading, setActionLoading] = useState(false)

const [getUsers, { isLoading }] = useGetUsersMutation();
const [getCompanies] = useGetCompaniesMutation();
const [getRoles] = useGetRolesMutation();
const [editUser] = useEditUserMutation()

const [users, setUsers] = useState([])

const [companiesOptions, setCompaniesOptions] = useState([])
const [companies, setCompanies] = useState([])

const [rolesOptions, setRolesOptions] = useState([])

//const emailRef = useRef()
const [email, setEmail] = useState('')
const [selectedLOBs, setSelectedLOBs] = useState([])
const [selectedCompanies, setSelectedCompanies] = useState([])
const [selectedRoles, setSelectedRoles] = useState([])


const handleEmailInput =  async (e) => {
  setEmail(e.target.value)
  if(e.target.value.length>3){
    loadUsers(e.target.value,1,pagination.pageSize,selectedRoles, selectedLOBs, selectedCompanies)
    //setUsers( await getUsers({ emailOrUserName: e.target.value, Page:1, PageSize:pageSize,roles:role != '' ? [role] :[], lineOfBusinessesIds:companies, companiesIds:companies.length>0?[companies[0]]:[]}).unwrap());
  }else{
    loadUsers("",1,pagination.pageSize,selectedRoles, selectedLOBs, selectedCompanies)
    //setUsers( await getUsers({ Page:1, PageSize:pageSize,roles:role != '' ? [role] :[], lineOfBusinessesIds:companies, companiesIds:companies.length>0?[companies[0]]:[]}).unwrap());
  }
}


const handleChangeCompanies =  async (value) => {
  // searchInput.current.querySelector("input").value = "";
 // setCompanies(args[0])
 // setUsers( await getUsers({ emailOrUserName: email, Page:1, PageSize:pageSize, roles:role != '' ? [role] :[], lineOfBusinessesIds:args[0], companiesIds:args[0].length>0?[args[0][0]]:[] }).unwrap());

  console.log(value)
  if (value !=null && value.length>0){
    var lobIds = []
    var compIds = []
    value.forEach(element => {
      if(element.length==1){
        companies.find(x=>x.id==element[0]).lineOfBusinesses.map(x=>x.id).forEach( item =>{
          lobIds.push(item)
        })
        compIds.push(element[0])
      }else{
        element.forEach((item, index) => {
          if(index==0){
            compIds.push(item)
            
          } else{
            lobIds.push(item)
          }
        });
      }
      
    });
  setSelectedCompanies(compIds)
  setSelectedLOBs(lobIds)
  loadUsers(email,1, pagination.pageSize,selectedRoles,lobIds,compIds)
  }else{
    setSelectedCompanies([])
    setSelectedLOBs([])
    loadUsers(email,1, pagination.pageSize,selectedRoles,[],[])
  }
};

const handleChangeRoles =  async (value) => {
 // setRole(args[0])
 // setUsers( await getUsers({ emailOrUserName: email, Page:1, PageSize:pageSize, roles:args[0] != '' ? [args[0]] :[], lineOfBusinessesIds:companies, companiesIds:companies.length>0?[companies[0]]:[]}).unwrap());
  var roles = []
  value.forEach(element => {
    roles.push(element[0])
  });
  setSelectedRoles(roles)
  loadUsers(email,1, pagination.pageSize,roles,selectedLOBs,selectedCompanies)
};


const loadUsers = async (email,page,pageSize,roles,lineOfBusinessesIds,companiesIds) =>{

  var usersArray = await getUsers({ emailOrUserName: email, page, pageSize, roles, lineOfBusinessesIds, companiesIds}).unwrap()
  var total = usersArray != null && usersArray.length>0 ? usersArray[0].totalCount : 0
  console.log(usersArray)
  setUsers(usersArray)

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
  loadUsers(email,newPagination.current,newPagination.pageSize,selectedRoles,selectedLOBs,selectedCompanies)
};


useEffect( () =>{ 
  async function fetchMyAPI() {
   
  //  setUsers(await getUsers({Page:1, PageSize:pageSize }).unwrap());

    loadUsers("",1,pagination.pageSize,[],[],[])

    var companiesWithLOBs = await getCompanies({}).unwrap();
    setCompanies(companiesWithLOBs)
    transformCompanies(companiesWithLOBs)

    var roles = await getRoles().unwrap();
    
    transformRoles(roles)
    
  }
  fetchMyAPI()
  
}, [])



const transformRoles = (roles) =>{
  var rolesArray = []
  console.log(roles)
  roles.roles.forEach((element, index) => {
    rolesArray.push({label: element, value: element})
  });
  setRolesOptions(rolesArray)
}

const transformCompanies = (comapniesArray) =>{
  var lineOfBusinessesArray = []
  comapniesArray.forEach((company) => {
    if(company.lineOfBusinesses.length>0){
      lineOfBusinessesArray.push({label:company.name,value:company.id,children:
        returnLineOfBusinesses(company.name,company.lineOfBusinesses)
      })
    }else{
      lineOfBusinessesArray.push({label:company.name,value:company.id,disabled:true
      })
    }
  });
  setCompaniesOptions(lineOfBusinessesArray)
}

const returnLineOfBusinesses =    (companyName,lineOfBusinesses) => {
  var lineOfBusinessesArray = []
  lineOfBusinesses.forEach(element => {
    lineOfBusinessesArray.push({label:element.name,value:element.id})
  });
  return lineOfBusinessesArray
}

const filter = (inputValue, path) =>
  path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

  const editClick = async (id,isActive) => {

    setActionLoading(true)
    showLoadingMessage('loading...')
      await editUser({Id: id,IsActive:isActive}).unwrap()
      showMessage(isActive?'User activated successfully!': 'User deactivated successfully!')
      loadUsers(email, pagination.current, pagination.pageSize,selectedRoles,selectedLOBs,selectedCompanies)
      setActionLoading(false)
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

  return (
   <>
   <Descriptions title="Manage Users"></Descriptions>
        
            <div
          className="site-layout-background"
          style={{
            padding: 24,
            minHeight: 150,
          }}
        >
      
      <Descriptions title="Users list"></Descriptions>

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
        <Input name="email"
            onChange={handleEmailInput}
            autoComplete="off" placeholder="Search with user name or email" 
            />
            </Form.Item>
        
          </Col>

          <Col className="gutter-row" span={6}>
          <Form.Item>
        
        <Cascader
   options={rolesOptions}
   onChange={handleChangeRoles}
   placeholder="Search with role"
   showSearch={{
     filter,
   }}
   multiple
   maxTagCount="responsive"
   onSearch={(value) => console.log(value)}
 />
  </Form.Item>
  </Col>

         <Col className="gutter-row" span={12}>
        <Form.Item>
        <Cascader
   options={companiesOptions}
   onChange={handleChangeCompanies}
   placeholder="Search with company or line of business"
   showSearch={{
     filter,
   }}
   multiple
   maxTagCount="responsive"
   onSearch={(value) => console.log(value)}
 />
  </Form.Item>

  
        
      </Col> 
      </Row>
      </Form>
 
  
 <Table
      columns={columns}
      rowKey={(record) => record.id}
      dataSource={users}
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
export default UsersList
