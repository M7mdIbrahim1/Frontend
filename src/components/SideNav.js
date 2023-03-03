
import React, { useState } from 'react';
import { Link } from "react-router-dom";
//import 'antd/dist/antd.css';
import '../index.css';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  DashboardOutlined,
  HomeOutlined,
  BuildOutlined,
  BankOutlined,
  ApartmentOutlined,
  FunnelPlotOutlined,
  AppstoreAddOutlined,
  EditOutlined,
  OrderedListOutlined,
  CalculatorOutlined,
  DollarOutlined,
  ProjectOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  AreaChartOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  UserSwitchOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import logo from '../assets/logo.png'

import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../features/auth/slices/authSlice'

const {  Sider } = Layout;







function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

function SideNav({darkTheme}) {

    const [collapsed, setCollapsed] = useState(true);

    const roles = useSelector(selectCurrentUserRoles);
 // const permissions = useSelector(selectCurrentUserPermissions);

  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }


    const items = [
        allowedRoles(['SuperAdmin']) ? getItem('Main Dashboard', '1', <Link to="/companies"><DashboardOutlined /></Link>):null,
        allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin'])? getItem('Basic configuration', 'sub1', <HomeOutlined />,[
            getItem('Companies', '3', <Link to="/companies"><BankOutlined /></Link>),
            getItem('LineOfBusinesses', '4',<Link to="/line-of-businesses"><ApartmentOutlined /></Link> ),
            getItem('Clients', '5', <Link to="/clients"><UsergroupAddOutlined /></Link>),
            getItem('Milestones', '6', <Link to="/milestones"><BuildOutlined /></Link>),
        ]) : null,
        allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','CommercialManager','CommercialUser'])? getItem('Commercial', 'sub2', <FunnelPlotOutlined />,[
            getItem('Create Opportunity', '7', <Link to="/create-opportunity"><AppstoreAddOutlined /></Link>),
            getItem('progress Opportunity', '8',<Link to="/Opportunities"><EditOutlined /></Link> ),
            getItem('Opportunity listing', '23', <Link to="/Opportunities"><OrderedListOutlined /></Link>),
            allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','CommercialManager']) ?getItem('Calculations', '9', <Link to="/commercial-calculations"><CalculatorOutlined /></Link>):null,
            allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','CommercialManager'])?getItem('Dashboard', '10', <Link to="/commercial-dashboard"><PieChartOutlined /></Link>):null,
        ]) : null,
        allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','OperationManager','OperationUser'])? getItem('Operation', 'sub3', <ProjectOutlined />,[
             getItem('Create Project', '11', <Link to="/create-project"><AppstoreAddOutlined /></Link>),
             getItem('Progress Project', '12',<Link to="/Projects"><EditOutlined /></Link> ),
             getItem('Project listing', '13', <Link to="/Projects"><OrderedListOutlined /></Link>),
            allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','OperationManager']) ?getItem('Project Invoices', '14', <Link to="/projects-invoices"><DollarOutlined /></Link>):null,
            allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','OperationManager']) ?getItem('Calculations', '15', <Link to="/operation-calculations"><CalculatorOutlined /></Link>):null,
            allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','OperationManager'])?getItem('Dashboard', '16', <Link to="/operation-dashboard"><BarChartOutlined /></Link>):null,
        ]) : null,
        allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','FinancialManager','FinancialUser'])? getItem('Finance', 'sub4',<CreditCardOutlined />,[
            getItem('Finance Invoices', '17', <Link to="/finance-invoices"><DollarOutlined /></Link>),
            allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','FinancialManager']) ?getItem('Calculations', '18', <Link to="/finance-calculations"><CalculatorOutlined /></Link>):null,
            allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin','FinancialManager'])?getItem('Dashboard', '19', <Link to="/finance-dashboard"><AreaChartOutlined /></Link>):null,
        ]) : null,
        allowedRoles(['SuperAdmin','FDBAdmin','CompanyAdmin'])? getItem('Users', 'sub5',<TeamOutlined />,[
           getItem('Assign Users', '20', <Link to="/assign-roles"><UserAddOutlined /></Link>),
           allowedRoles(['SuperAdmin','FDBAdmin']) ? getItem('Assign Company', '21', <Link to="/assign-company"><UserSwitchOutlined /></Link>):null,
           getItem('Users', '22', <Link to="/users-list"><UserOutlined /></Link>),
           allowedRoles(['SuperAdmin','FDBAdmin']) ? getItem('Import Opportunities', '23', <Link to="/import-Opportunities"><ImportOutlined /></Link>):null,
           allowedRoles(['SuperAdmin','FDBAdmin']) ? getItem('Import Projects', '24', <Link to="/import-Projects"><ImportOutlined /></Link>):null,
        ]) : null,
      ];

    const setLogoStyle = !collapsed ? {marginLeft:10, marginTop:10,height: 40, width: 140} : {marginLeft:1, marginTop:10,height: 35, width: 78}
     

  return (
    
    <Sider collapsedWidth={75} width='230'  style={!darkTheme?{backgroundColor:'white',marginTop:60}:{marginTop:60}}  collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} >
    {/* <div className="logo" ><img src={logo} alt="Logo" style={setLogoStyle} /></div> */}
    <Menu theme={darkTheme?"dark":"light"} defaultSelectedKeys={['1']} mode="inline" items={items} />
  </Sider>
  
  )
}

export default SideNav