import { apiSlice } from "../../../app/api/apiSlice"

export const opportunityApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getOpportunities: builder.mutation({
            query: opportunitySearchModelView => ({
                url: '/GetAllOpportunities',
                method: 'POST',
                body:opportunitySearchModelView
            })
        }),
        getOpportunityById: builder.mutation({
            query: opportunityViewModel => ({
                url: '/GetOpportunityById',
                method: 'POST',
                body:opportunityViewModel
            })
        }),
        getCompanies: builder.mutation({
            query: companySearchModelView => ({
                url: '/GetAllCompanies',
                method: 'POST',
                body:companySearchModelView
            })
        }),
        saveOpportunity: builder.mutation({
            query: opportunityViewModel => ({
                url: '/AddOpportunity',
                method: 'POST',
                body: opportunityViewModel 
            })
        }),
        updateOpportunity: builder.mutation({
            query: opportunityViewModel => ({
                url: '/UpdateOpportunity',
                method: 'POST',
                body: opportunityViewModel 
            })
        }),
        deleteOpportunity: builder.mutation({
            query: opportunityViewModel => ({
                url: '/DeleteOpportunity',
                method: 'POST',
                body: opportunityViewModel 
            })
        }),
        saveClient: builder.mutation({
            query: clientViewModel => ({
                url: '/AddClient',
                method: 'POST',
                body: clientViewModel 
            })
        }),
        exportOpportunities: builder.mutation({
            query: opportunitySearchModelView => ({
                url: '/ExportOpportunities',
                method: 'POST',
                body:opportunitySearchModelView
            })
        }),
    })
})

export const {
    useGetCompaniesMutation,
   useGetOpportunitiesMutation,
   useSaveOpportunityMutation,
   useDeleteOpportunityMutation,
   useUpdateOpportunityMutation,
   useSaveClientMutation,
   useGetOpportunityByIdMutation,
   useExportOpportunitiesMutation,
} = opportunityApiSlice 