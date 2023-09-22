import React from 'react'
import logo from '../assets/logo.png'

import { useSelector } from "react-redux"
import {selectCurrentUserRoles /*, selectCurrentUserPermissions*/ }from '../features/auth/slices/authSlice'


const Nav = () => {
  const roles = useSelector(selectCurrentUserRoles);
 // const permissions = useSelector(selectCurrentUserPermissions);

  const allowedRoles = (checkRoles) => {
      return roles?.find(role => checkRoles?.includes(role))
  }

  

  return (
    
  
    
    <nav id="sidebarMenu" className="navbar-expand-lg sidebar bg-white" style={{width:290}}>
     
              <div className="position-sticky">
              
                <div className="list-group list-group-flush mx-3 mt-4">

                {allowedRoles(['SuperAdmin']) ? (
                  <a href="/main-dashboard" className="list-group-item list-group-item-action py-2 ripple" aria-current="true" >
                    <i className="fas fa-tachometer-alt fa-fw me-3"></i><span>Main Dashboard</span>
                  </a>) : null}
                 
                  <div className="accordion accordion-flush" id="accordionFlushExample">
                 
                  {allowedRoles(['SuperAdmin','CompanyAdmin','FDBAdmin']) ? (
                    <div className="accordion-item">
                       <h2 className="accordion-header" id="flush-headingOne">
                        <button className="accordion-button collapsed  py-2" type="button" data-mdb-toggle="collapse" data-mdb-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                           <i className="fas fa-house-user  fa-fw me-3"></i><span>Basic configuration</span>
                  
                         </button>
                       </h2>
                       <div id="flush-collapseOne" className="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-mdb-parent="#accordionFlushExample">

                       <div className="accordion-body ms-3"> 

                       {allowedRoles(['SuperAdmin','FDBAdmin']) ? (
                      <div className="mb-2">
                      <a href="/companies" className="list-group-item-action" >
                      <i className="fas fa-building fa-fw me-2"></i><span>Companies</span>
                      </a>
                      </div>) :null}

                      
                      <div className="mb-2">
                      <a href="/line-of-businesses" className="list-group-item-action" >
                      <i className="fas fa-briefcase fa-fw me-2"></i><span>Line of businesses</span>
                      </a>
                      </div>

                      {allowedRoles(['SuperAdmin','CompanyAdmin']) ? (<>
                      <div className="mb-2">
                      <a href="/clients" className="list-group-item-action" >
                      <i className="fas fa-user-tie fa-fw me-2"></i><span>Clients</span>
                      </a>
                      </div>

                      <div className="mb-2">
                      <a href="/milestones" className="list-group-item-action" >
                      <i className="fas fa-bars fa-fw me-2"></i><span>Milestones</span>
                      </a>
                      </div></>):null}

                      
                      </div>
                    </div>
                  
                 </div>) : null}

                  {allowedRoles(['SuperAdmin','CompanyAdmin','CommercialManager','CommercialUser']) ? (
                 <div className="accordion-item">
                       <h2 className="accordion-header" id="flush-headingTwo">
                        <button className="accordion-button collapsed  py-2" type="button" data-mdb-toggle="collapse" data-mdb-target="#flush-collapseTwo" aria-expanded="true" aria-controls="flush-collapseTwo">
                           <i className="fas fa-chart-line fa-fw me-3"></i><span>Commercial</span>
                         </button>
                       </h2>
                       <div id="flush-collapseTwo" className="accordion-collapse collapse" aria-labelledby="flush-headingTwo" data-mdb-parent="#accordionFlushExample">

                      
                      <div className="accordion-body ms-3"> 

                      {allowedRoles(['SuperAdmin','CompanyAdmin','CommercialManager','CommercialUser']) ? (
                      <div className="mb-2">
                      <a href="/create-opportunity" className="list-group-item-action" >
                      <i className="fas fa-calendar fa-fw me-2"></i><span>Create Opportunity</span>
                      </a>
                      </div>) : null}

                      {allowedRoles(['SuperAdmin','CompanyAdmin','CommercialManager','CommercialUser']) ? (
                      <div className="mb-2">
                      <a href="/progress-opportunity" className="list-group-item-action" >
                      <i className="fas fa-pen fa-fw me-2"></i><span>Progress Opportunity</span>
                      </a>
                      </div>) : null}

                      <div className="mb-2">
                      <a href="/opportunities" className="list-group-item-action" >
                      <i className="fas fa-list fa-fw me-2"></i><span>Opportunity listing</span>
                      </a>
                      </div>

                      {allowedRoles(['SuperAdmin','CompanyAdmin','CommercialManager']) ? (
                      <div className="mb-2">
                      <a href="/commercial-calculations" className="list-group-item-action" >
                      <i className="fas fa-calculator fa-fw me-2"></i><span>Calculations</span>
                      </a>
                      </div>) : null}


                      {allowedRoles(['SuperAdmin','CompanyAdmin','CommercialManager']) ? (
                      <div className="mb-2">
                      <a href="/commercial-dashboard" className="list-group-item-action" >
                      <i className="fas fa-tachometer-alt fa-fw me-2"></i><span>Dashboard</span>
                      </a>
                      </div>) : null}

                      </div>

                    
                        
                    </div>
                  </div>) : null}

                  {allowedRoles(['SuperAdmin','CompanyAdmin','OperationManager','OperationUser']) ? (
                  <div className="accordion-item">
                       <h2 className="accordion-header" id="flush-headingThree">
                        <button className="accordion-button collapsed  py-2" type="button" data-mdb-toggle="collapse" data-mdb-target="#flush-collapseThree" aria-expanded="true" aria-controls="flush-collapseThree">
                           <i className="fas fa-chart-area fa-fw me-3"></i><span>Operation</span>
                          
                         </button>
                       </h2>
                       <div id="flush-collapseThree" className="accordion-collapse collapse" aria-labelledby="flush-headingThree" data-mdb-parent="#accordionFlushExample">
                        
                       <div className="accordion-body ms-3"> 

                       {allowedRoles(['SuperAdmin','CompanyAdmin','OperationManager','OperationUser']) ? (
                      <div className="mb-2">
                      <a href="/create-project" className="list-group-item-action" >
                      <i className="fas fa-calendar fa-fw me-2"></i><span>Create Project</span>
                      </a>
                      </div>) : null}
                      
                      {allowedRoles(['SuperAdmin','CompanyAdmin','OperationManager','OperationUser']) ? (
                      <div className="mb-2">
                      <a href="/progress-project" className="list-group-item-action" >
                      <i className="fas fa-pen fa-fw me-2"></i><span>Progress Project</span>
                      </a>
                      </div>) : null}

                      <div className="mb-2">
                      <a href="/projects" className="list-group-item-action" >
                      <i className="fas fa-list fa-fw me-2"></i><span>Project listing</span>
                      </a>
                      </div>

                      {allowedRoles(['SuperAdmin','CompanyAdmin','OperationManager','OperationUser']) ? (
                      <div className="mb-2">
                      <a href="/projects-invoices" className="list-group-item-action" >
                      <i className="fas fa-money-bill fa-fw me-2"></i><span>Project Invoices</span>
                      </a>
                      </div>):null}

                      {allowedRoles(['SuperAdmin','CompanyAdmin','OperationManager']) ? (
                      <div className="mb-2">
                      <a href="/operation-calculations" className="list-group-item-action" >
                      <i className="fas fa-calculator fa-fw me-2"></i><span>Calculations</span>
                      </a>
                      </div>):null}

                      {allowedRoles(['SuperAdmin','CompanyAdmin','OperationManager']) ? (
                      <div className="mb-2">
                      <a href="/operation-dashboard" className="list-group-item-action" >
                      <i className="fas fa-tachometer-alt fa-fw me-2"></i><span>Dashboard</span>
                      </a>
                      </div>): null}
                      </div>

                    </div>
                  </div>): null}

                  {allowedRoles(['SuperAdmin','CompanyAdmin','FinancialManager','FinancialUser']) ? (
                  <div className="accordion-item">
                       <h2 className="accordion-header" id="flush-headingFive">
                        <button className="accordion-button collapsed  py-2" type="button" data-mdb-toggle="collapse" data-mdb-target="#flush-collapseFive" aria-expanded="true" aria-controls="flush-collapseFive">
                           <i className="fas fa-file-invoice-dollar fa-fw me-3"></i><span>Finance</span>
                          
                         </button>
                       </h2>
                       <div id="flush-collapseFive" className="accordion-collapse collapse" aria-labelledby="flush-headingFive" data-mdb-parent="#accordionFlushExample">
                        
                       <div className="accordion-body ms-3"> 

                      
                      
                    

                       {allowedRoles(['SuperAdmin','CompanyAdmin','FinancialManager','FinancialUser']) ? (
                      <div className="mb-2">
                      <a href="/finance-invoices" className="list-group-item-action" >
                      <i className="fas fa-money-bill fa-fw me-2"></i><span>Finance Invoices</span>
                      </a>
                      </div>):null}

                      {allowedRoles(['SuperAdmin','CompanyAdmin','FinancialManager']) ? (
                      <div className="mb-2">
                      <a href="/finance-calculations" className="list-group-item-action" >
                      <i className="fas fa-calculator fa-fw me-2"></i><span>Calculations</span>
                      </a>
                      </div>):null}

                      {allowedRoles(['SuperAdmin','CompanyAdmin','FinancialManager']) ? (
                      <div className="mb-2">
                      <a href="/finance-dashboard" className="list-group-item-action" >
                      <i className="fas fa-tachometer-alt fa-fw me-2"></i><span>Dashboard</span>
                      </a>
                      </div>): null}
                      </div>

                    </div>
                  </div>): null}

                  

                  {allowedRoles(['SuperAdmin','FDBAdmin']) ? (
                  <div className="accordion-item">
                       <h2 className="accordion-header" id="flush-headingFour">
                        <button className="accordion-button collapsed  py-2" type="button" data-mdb-toggle="collapse" data-mdb-target="#flush-collapseFour" aria-expanded="true" aria-controls="flush-collapseFour">
                           <i className="fas fa-users fa-fw me-3"></i><span>Users</span>
                         </button>
                       </h2>
                       <div id="flush-collapseFour" className="accordion-collapse collapse" aria-labelledby="flush-headingFour" data-mdb-parent="#accordionFlushExample">
                       <div className="accordion-body ms-3"> 

                      
                       <div className="mb-2">
                      <a href="/assign-roles" className="list-group-item-action" >
                      <i className="fas fa-user fa-fw me-2"></i><span>Assign roles</span>
                      </a>
                      </div>

                      <div className="mb-2">
                      <a href="/assign-company" className="list-group-item-action" >
                      <i className="fas fa-house-user fa-fw me-2"></i><span>Assign company</span>
                      </a>
                      </div>
                     
                      <div className="mb-2">
                      <a href="/users-list" className="list-group-item-action" >
                      <i className="fas fa-users fa-fw me-2"></i><span>User listing</span>
                      </a>
                      </div>

                      

                     
                      </div>
                    </div>
                  </div>):null}
                 
                 </div>

                
{/*                  
                
                  <a href="/" className="list-group-item list-group-item-action py-2 ripple" aria-current="true" >
                    <i className="fas fa-tachometer-alt fa-fw me-3"></i><span>Operation dashboard</span>
                  </a>
                  
                  
                  <a href="/" className="list-group-item list-group-item-action py-2 ripple " >
                    <i  className="fas fa-chart-line fa-fw me-3"></i><span>Create opportunity</span>
                  </a>
                  <a href="/" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-pen fa-fw me-3"></i><span>Update opportunity</span></a>


                  <a href="/" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-chart-area fa-fw me-3"></i><span>Create project</span></a>
                  <a href="/" className="list-group-item list-group-item-action py-2 ripple">
                    <i className="fas fa-pen fa-fw me-3"></i><span>Update project</span>
                  </a>

                  <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-chart-bar fa-fw me-3"></i><span>Calculations</span></a>
                   <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-globe fa-fw me-3"></i><span>International</span></a>
                  <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-building fa-fw me-3"></i><span>Partners</span></a>
                  <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-calendar fa-fw me-3"></i><span>Calendar</span></a> 
                  <a href="/" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-building fa-fw me-3"></i><span>Customer</span></a>
                  <a href="/usersList" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-users fa-fw me-3"></i><span>Users</span></a>
                   <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                      className="fas fa-money-bill fa-fw me-3"></i><span>Sales</span></a>  */}
                </div>
              </div>
            </nav>
  )
}

export default Nav