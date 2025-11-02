import type { FetchError } from 'ofetch'
import type { AvailableRouterMethod, NitroFetchRequest } from 'nitropack/types'
import type { ApiError } from '~/types/api'
import type { AsyncData, UseFetchOptions } from '#app'
import type { KeysOf, PickFrom } from '#app/composables/asyncData'

type DefaultResT<ResT> = ResT extends void ? unknown : ResT
type ValidMethods<ReqT extends NitroFetchRequest> = AvailableRouterMethod<ReqT> | Uppercase<AvailableRouterMethod<ReqT>>

export const useAPI = <ResT = void, ErrorT = ApiError, ReqT extends NitroFetchRequest = NitroFetchRequest>(
  url: ReqT | Ref<ReqT> | (() => ReqT),
  options?: UseFetchOptions<DefaultResT<ResT>, DefaultResT<ResT>, KeysOf<DefaultResT<ResT>>, undefined, ReqT, ValidMethods<ReqT>>
): AsyncData<PickFrom<DefaultResT<ResT>, KeysOf<DefaultResT<ResT>>> | undefined, FetchError<ErrorT> | undefined> => {
  return useFetch<ResT, FetchError<ErrorT>, ReqT, ValidMethods<ReqT>, DefaultResT<ResT>>(url, {
    ...options,
    $fetch: useNuxtApp().$api
  })
}
