import { apiSlice } from "../../../app/api/apiSlice"

export const milestoneApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMilestones: builder.mutation({
            query: milestoneSearchModelView => ({
                url: '/GetAllMilestones',
                method: 'POST',
                body:milestoneSearchModelView
            })
        }),
        getCompanies: builder.mutation({
            query: companySearchModelView => ({
                url: '/GetAllCompanies',
                method: 'POST',
                body:companySearchModelView
            })
        }),
        saveMilestone: builder.mutation({
            query: milestoneViewModel => ({
                url: '/AddMilestone',
                method: 'POST',
                body: milestoneViewModel 
            })
        }),
        updateMilestone: builder.mutation({
            query: milestoneViewModel => ({
                url: '/UpdateMilestone',
                method: 'POST',
                body: milestoneViewModel 
            })
        }),
        deleteMilestone: builder.mutation({
            query: milestoneViewModel => ({
                url: '/DeleteMilestone',
                method: 'POST',
                body: milestoneViewModel 
            })
        }),
    })
})

export const {
    useGetCompaniesMutation,
   useGetMilestonesMutation,
   useSaveMilestoneMutation,
   useDeleteMilestoneMutation,
   useUpdateMilestoneMutation
} = milestoneApiSlice 