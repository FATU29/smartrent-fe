import { HttpMethod } from '@/api/types/pagination.type'
import { instanceClientAxios } from '@/configs/axios/axiosClient'
import { CustomAxiosRequestConfig } from '@/configs/axios/types'
import { useEffect, useState } from 'react'

export type FetchOptions = CustomAxiosRequestConfig & {
  url: string
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
}

function useApi<T>(fetchOptions: FetchOptions) {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    ...restConfig
  } = fetchOptions
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchData = async (): Promise<T> => {
    setLoading(true)
    setError(null)

    try {
      const response = await instanceClientAxios({
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        data: body,
        ...restConfig,
      })

      setLoading(false)
      return response.data as T
    } catch (err: any) {
      setLoading(false)
      throw err
    }
  }

  useEffect(() => {
    fetchData()
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        setData(null)
      })
  }, [
    url,
    method,
    JSON.stringify(headers),
    JSON.stringify(body),
    JSON.stringify(restConfig),
  ])

  return {
    data,
    setData,
    error,
    loading,
    refetch: fetchData,
  }
}

export { useApi }
