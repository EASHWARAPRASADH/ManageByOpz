import { platformApi } from '../../app/api';

export interface DashboardWidgetPreference {
  widgetKey: string;
  componentName: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}

export interface DashboardLayout {
  layoutId?: string;
  layoutName: string;
  widgets: DashboardWidgetPreference[];
}

export const dashboardApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyLayout: builder.query<DashboardLayout, void>({
      query: () => '/v1/dashboard/layouts/my-layout',
      transformResponse: (response: { data: DashboardLayout }) => response.data,
      providesTags: ['DashboardLayout'],
    }),
    saveMyLayout: builder.mutation<DashboardLayout, DashboardLayout>({
      query: (body) => ({
        url: '/v1/dashboard/layouts/save',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DashboardLayout'],
    }),
  }),
});

export const {
  useGetMyLayoutQuery,
  useSaveMyLayoutMutation,
} = dashboardApi;
