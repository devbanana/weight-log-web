import type { AsyncData, UseFetchOptions } from '#app'
import type { KeysOf, PickFrom } from '#app/composables/asyncData'
import type { AvailableRouterMethod, NitroFetchRequest } from 'nitropack/types'
import type { FetchError } from 'ofetch'
import type { Ref } from 'vue'
import type { ApiError } from '~/types/api-error'

import { useFetch, useNuxtApp } from '#app'

type DefaultResT<ResT> = ResT extends void ? unknown : ResT
type ValidMethods<ReqT extends NitroFetchRequest>
  = | AvailableRouterMethod<ReqT>
    | Uppercase<AvailableRouterMethod<ReqT>>

export const useAPI = <
  ResT = void,
  ErrorT = ApiError,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  MethodT extends ValidMethods<ReqT> = ValidMethods<ReqT>,
  _ResT = DefaultResT<ResT>,
  DataT = _ResT
>(
  url: ReqT | Ref<ReqT> | (() => ReqT),
  options?: UseFetchOptions<
    _ResT,
    DataT,
    KeysOf<DataT>,
    undefined,
    ReqT,
    MethodT
  >
): AsyncData<
  PickFrom<DataT, KeysOf<DataT>> | undefined,
  FetchError<ErrorT> | undefined
> => {
  return useFetch<ResT, FetchError<ErrorT>, ReqT, MethodT, _ResT, DataT>(url, {
    ...options,
    $fetch: useNuxtApp().$api
  })
}
