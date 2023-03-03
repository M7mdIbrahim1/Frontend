import { apiSlice } from "../../../app/api/apiSlice"

export const projectApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        unload: builder.mutation({
            query: fileModelView => ({
                url: '/Delete',
                method: 'POST',
                body:fileModelView
            })
        }),
        getProjects: builder.mutation({
            query: projectSearchModelView => ({
                url: '/GetAllProjects',
                method: 'POST',
                body:projectSearchModelView
            })
        }),
        getProjectById: builder.mutation({
            query: projectViewModel => ({
                url: '/GetProjectById',
                method: 'POST',
                body:projectViewModel
            })
        }),
        getProjectByOpportunityId: builder.mutation({
            query: projectViewModel => ({
                url: '/GetProjectByOpportunityId',
                method: 'POST',
                body:projectViewModel
            })
        }),
        getLOBMilestones: builder.mutation({
            query: lineOfBusinessViewModel => ({
                url: '/GetLOBMilestones',
                method: 'POST',
                body:lineOfBusinessViewModel
            })
        }),
        getCompanies: builder.mutation({
            query: companySearchModelView => ({
                url: '/GetAllCompanies',
                method: 'POST',
                body:companySearchModelView
            })
        }),
        saveProject: builder.mutation({
            query: projectViewModel => ({
                url: '/AddProject',
                method: 'POST',
                body: projectViewModel 
            })
        }),
        updateProject: builder.mutation({
            query: projectViewModel => ({
                url: '/UpdateProject',
                method: 'POST',
                body: projectViewModel 
            })
        }),
        deleteProject: builder.mutation({
            query: projectViewModel => ({
                url: '/DeleteProject',
                method: 'POST',
                body: projectViewModel 
            })
        }),
        saveClient: builder.mutation({
            query: clientViewModel => ({
                url: '/AddClient',
                method: 'POST',
                body: clientViewModel 
            })
        }),
        exportProjects: builder.mutation({
            query: projectSearchModelView => ({
                url: '/ExportProjects',
                method: 'POST',
                body:projectSearchModelView
            })
        }),
    })
})

export const {
    useGetCompaniesMutation,
   useGetProjectsMutation,
   useSaveProjectMutation,
   useDeleteProjectMutation,
   useUpdateProjectMutation,
   useSaveClientMutation,
   useGetProjectByIdMutation,
   useGetLOBMilestonesMutation,
   useGetProjectByOpportunityIdMutation,
   useExportProjectsMutation,
   useUnloadMutation,
} = projectApiSlice 