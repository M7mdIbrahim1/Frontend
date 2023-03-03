import { apiSlice } from "../../../app/api/apiSlice"

export const lineOfBusinessApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getLineOfBusinesses: builder.mutation({
            query: lineOfBusinessSearchModelView => ({
                url: '/LineOfBusiness/GetAllLineOfBusinesses',
                method: 'POST',
                body:lineOfBusinessSearchModelView
            })
        }),
        getCompanies: builder.mutation({
            query: searchCompanyViewModel => ({
                url: '/LineOfBusiness/GetAllCompanies',
                method: 'POST',
                body:searchCompanyViewModel
            })
        }),
        saveLOB: builder.mutation({
            query: lineOfBusinessViewModel => ({
                url: '/LineOfBusiness/AddLineOfBusiness',
                method: 'POST',
                body: lineOfBusinessViewModel 
            })
        }),
        updateLOB: builder.mutation({
            query: lineOfBusinessViewModel => ({
                url: '/LineOfBusiness/UpdateLineOfBusiness',
                method: 'POST',
                body: lineOfBusinessViewModel 
            })
        }),
        deleteLob: builder.mutation({
            query: lineOfBusinessViewModel => ({
                url: '/LineOfBusiness/DeleteLineOfBusiness',
                method: 'POST',
                body: lineOfBusinessViewModel 
            })
        }),
    })
})

export const {
   useGetCompaniesMutation,
   useGetLineOfBusinessesMutation,
   useSaveLOBMutation,
   useDeleteLobMutation,
   useUpdateLOBMutation
} = lineOfBusinessApiSlice 