import type { AsyncData } from '#app'

type _AsyncResponseStatus<DataT = unknown, ErrorT = unknown> = Pick<
  AsyncData<DataT, ErrorT>,
  'error' | 'pending' | 'status' | 'refresh' | 'execute' | 'clear'
>
export type AsyncResponseStatus<
  DataT = unknown,
  ErrorT = unknown
> = _AsyncResponseStatus<DataT, ErrorT>
  & PromiseLike<_AsyncResponseStatus<DataT, ErrorT>>
