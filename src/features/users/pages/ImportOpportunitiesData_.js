import {useState, React} from 'react'
import { useImportOpportunitiesMutation,useImportProjectsMutation } from "../slices/userApiSlice"
import { Col, Row,Button,message,Descriptions , Input, Table } from 'antd';
import {OpportunityStatuses,OpportunitySources,ClientStatuses,OpportunityScopes, Currencies} from "../../Common/lookups";
import {OutTable, ExcelRenderer} from 'react-excel-renderer';

function ImportOpportunitiesData() {

    const key = 'updatable';
    const [actionLoading, setActionLoading] = useState(false)

    const [importOpportunities] = useImportOpportunitiesMutation()
    const [importProjects] = useImportProjectsMutation()


    const [projects, setProjects] = useState([])
    const [opportunities, setOpportunities] = useState([])

    const [rows, setRows] = useState([])
    const [cols, setCols] = useState([])

    const [opportunitesImport, setOpportunitesImport ] =  useState(false)
    const [projectsImport, setProjectsImport ] =  useState(false)

    const fileHandlerProjects = (event) => {
        setOpportunitesImport(false)
        setProjectsImport(true)
        let fileObj = event.target.files[0];
      
        //just pass the fileObj as parameter
        ExcelRenderer(fileObj, (err, resp) => {
          if(err){
            console.log(err);            
          }
          else{
            setCols(resp.cols)
            setRows(resp.rows)
            // this.setState({
            //   cols: resp.cols,
            //   rows: resp.rows
            // });
          }
        });               
      
      }

const fileHandlerOpportunities = (event) => {
    setOpportunitesImport(true)
    setProjectsImport(false)
    let fileObj = event.target.files[0];
  
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if(err){
        console.log(err);            
      }
      else{
        setCols(resp.cols)
        setRows(resp.rows)
        // this.setState({
        //   cols: resp.cols,
        //   rows: resp.rows
        // });
      }
    });               
  
  }

  const submitClick = async () =>{
    setActionLoading(true)
    showLoadingMessage('loading...')
    if(importProjects){
        await importOpportunities(opportunities).unwrap()
    }else if (importOpportunities){
        await importProjects(projects).unwrap()
    }
    showMessage("Date imported successfully")
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
<Descriptions title="Import Data"></Descriptions>
     
         <div
       className="site-layout-background"
       style={{
         padding: 24,
         minHeight: 150,
       }}
     >
   

   <div  style={{paddingLeft:15}}>
  
 

   

   <Row gutter={{
     xs: 8,
     sm: 16,
     md: 24,
     lg: 32,
   }}>
    <Col className="gutter-row" span={6}>
        <label>Opportunites</label>
    </Col>
     <Col className="gutter-row" span={12}>
    
     <input type="file" onChange={fileHandlerOpportunities}  />


     
       </Col>

       
   </Row>

   <Row gutter={{
     xs: 8,
     sm: 16,
     md: 24,
     lg: 32,
   }}>
    <Col className="gutter-row" span={6}>
        <label>Projects</label>
    </Col>
     <Col className="gutter-row" span={12}>
    
     <input type="file" onChange={fileHandlerProjects}  />


     
       </Col>

       
   </Row>

   <Row gutter={{
     xs: 8,
     sm: 16,
     md: 24,
     lg: 32,
   }}>
 <Button onClick={submitClick} disabled={actionLoading} type="primary" htmlType="submit">
        Submit
       </Button>
</Row>

   <Row gutter={{
     xs: 8,
     sm: 16,
     md: 24,
     lg: 32,
   }}>
<OutTable data={rows} columns={cols} tableClassName="ExcelTable2007" tableHeaderRowClass="heading" />
</Row>
   

 </div>

</div>
</>
  )
}

export default ImportOpportunitiesData