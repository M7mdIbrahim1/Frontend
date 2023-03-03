import { Outlet } from "react-router-dom"

import Header from './Header'
//import Nav from './Nav'
//import { useCheckAuthMutation } from '../features/auth/slices/authApiSlice'
// import {useEffect, React} from 'react'
// import { logOut } from '../features/auth/slices/authSlice'
// import { useDispatch } from 'react-redux'

import React, { useState } from 'react';
import 'antd/dist/antd.css';
//import '../menu.css';

import { Breadcrumb, Layout } from 'antd';
import SideNav from './SideNav';

const {  Content, Footer } = Layout;



function Home() {


  const [darkTheme, setDarkTheme] = useState(true)

  // const [checkAuth ] = useCheckAuthMutation();

  // const dispatch = useDispatch()

  // useEffect( () =>{ 
  //   async function fetchMyAPI() {
  //     const result=''
  //     try{
  //     result = await checkAuth().unwrap()
  //     }catch(ex){
  //       console.log(result)
  //     console.log(ex)
  //   if(ex.status=='401'){
  //    //console.log('401')
  //    // const userData = await logout().unwrap()
  //     dispatch(logOut())
  //     }
  //   }
      
  //   }
  //   fetchMyAPI()
    
  
    
    
  // }, [])

  return  (<Layout
    style={{
      minHeight: '100vh',
    }}
  >
   <SideNav darkTheme={darkTheme}/>
    <Layout className="site-layout">
      <Header darkTheme={darkTheme} setDarkTheme={setDarkTheme}/> 
      <Content
        style={{
          margin: '80px 16px',
        }}
      >
        {/* <Breadcrumb
          style={{
            margin: '16px 0',
          }}
        >
          <Breadcrumb.Item>User</Breadcrumb.Item>
          <Breadcrumb.Item>Bill</Breadcrumb.Item>
        </Breadcrumb> */}
        {/* <div
          className="site-layout-background"
          style={{
            padding: 24,
            minHeight: 150,
          }}
        >
          Bill is a cat.
        </div>
        <div
          
          style={{
            padding: 24,
            minHeight: 20,
          }}
        >
        </div>
        <div
          className="site-layout-background"
          style={{
            padding: 24,
            minHeight: 360,
          }}
        >
          Bill is a cat.
        </div> */}
        <Outlet />
      </Content>
      {/* <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Ant Design ©2018 Created by Ant UED
      </Footer> */}
    </Layout>
  </Layout>)
}

export default Home