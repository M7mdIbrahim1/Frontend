import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import RequireAuth from './features/auth/pages/RequireAuth'

import MainDashboard from './features/main/pages/MainDashboard'


import Companies from './features/basicConfiguration/pages/Companies'
import LineOfBusiness from './features/basicConfiguration/pages/LineOfBusinesses'
import Clients from './features/basicConfiguration/pages/Clients'
import Milestones from './features/basicConfiguration/pages/Milestones'

import CreateOpportunity from './features/commercial/pages/CreateOpportunity'
import ProgressOpportunity from './features/commercial/pages/ProgressOpportunity'
import Opportunities from './features/commercial/pages/Opportunities'
import CommercailCalculations from './features/commercial/pages/CommercialCalculations'
import CommercialDashboard from './features/commercial/pages/CommercialDashboard'

import CreateProject from './features/operation/pages/CreateProject'

import ProgressProject from './features/operation/pages/ProgressProject'
import Projects from './features/operation/pages/Projects'

import OperationCalculations from './features/operation/pages/OperationCalculations'
import OperationDashboard from './features/operation/pages/OperationDashboard'
import ProjectsInvoices from './features/operation/pages/ProjectsInvoices'

import FinanceCalculations from './features/finance/pages/FinanceCalculations'
import FinanceDashboard from './features/finance/pages/FinanceDashboard'
import FinanceInvoices from './features/finance/pages/FinanceInvoices'

import UsersList from './features/users/pages/UsersList'
import AssignRoles from './features/users/pages/AssignRoles'
import AssignCompany from './features/users/pages/AssignCompany'



import './App.css'
import Unauthorized from './features/auth/pages/Unauthorized'
import Missing from './components/common/Missing'
import ImportOpportunitiesData from './features/users/pages/ImportOpportunitiesData'
import ImportProjectsData from './features/users/pages/ImportProjectsData'


function App() {


  return (
   
    
    <Routes>
       {/* public routes */}
       <Route path="login" element={<Login />} />
       <Route  path="register" element={<Register />} />
       <Route  path="unauthorized" element={<Unauthorized />} />
       <Route path="*" element={<Missing />} />
      
      
      <Route element={<RequireAuth allowedRoles={['User']}/>}>
      <Route path="/" element={<Home />}>
          {/* protected routes */}
          <Route element={<RequireAuth allowedRoles={['SuperAdmin']} />}>
          <Route path="main-dashboard" element={<MainDashboard />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin']} />}>
          <Route path="companies" element={<Companies />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin']} />}>
          <Route path="line-of-businesses" element={<LineOfBusiness />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin']} />}>
          <Route path="clients" element={<Clients />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin']} />}>
          <Route path="milestones" element={<Milestones />} />
          </Route>




          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','CommercialAdmin','CommercialEdit']} />}>
          <Route path="create-opportunity" element={<CreateOpportunity />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','CommercialAdmin','CommercialEdit']} />}>
          <Route path="progress-opportunity"  element={<ProgressOpportunity />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','CommercialAdmin','CommercialViewFull','CommercialView']} />}>
          <Route path="opportunities" element={<Opportunities />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','CommercialAdmin','CommercialViewFull']} />}>
          <Route path="commercial-calculations" element={<CommercailCalculations />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','CommercialAdmin','CommercialViewFull']} />}>
          <Route path="commercial-dashboard" element={<CommercialDashboard />} />
          </Route>




          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationEdit']} />}>
          <Route path="create-project" element={<CreateProject />} />
          </Route>

       

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationEdit']} />}>
          <Route path="progress-project" element={<ProgressProject />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationViewFull','OperationView']} />}>
          <Route path="projects" element={<Projects />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationViewFull']} />}>
          <Route path="projects-invoices" element={<ProjectsInvoices />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationViewFull']} />}>
          <Route path="operation-calculations" element={<OperationCalculations />} />
          </Route>


          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationViewFull']} />}>
          <Route path="operation-dashboard" element={<OperationDashboard />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationViewFull']} />}>
          <Route path="finance-invoices" element={<FinanceInvoices />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationViewFull']} />}>
          <Route path="finance-calculations" element={<FinanceCalculations />} />
          </Route>


          <Route element={<RequireAuth allowedRoles={['SuperAdmin','Admin','OperationAdmin','OperationViewFull']} />}>
          <Route path="finance-dashboard" element={<FinanceDashboard />} />
          </Route>



          <Route element={<RequireAuth allowedRoles={['SuperAdmin','FDBAdmin']} />}>
          <Route path="assign-roles" element={<AssignRoles />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin']} />}>
          <Route path="assign-company" element={<AssignCompany />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','FDBAdmin']} />}>
          <Route path="users-list" element={<UsersList />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['SuperAdmin','FDBAdmin']} />}>
          <Route path="import-Opportunities" element={<ImportOpportunitiesData />} />
          <Route path="import-Projects" element={<ImportProjectsData />} />
          </Route>
         
        </Route>
        </Route>


    
    </Routes>
   
    
  
    
  
  )
}

export default App;