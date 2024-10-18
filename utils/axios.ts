import axios from 'axios'

const API_BASE_URL = `${process.env.TELEGRAM_API_BASE_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`

axios.defaults.baseURL = API_BASE_URL

function getAxiosInstance() {
  return {
    get(method: string, params: any) {
      return axios.get(`/${method}`, { params })
    },

    post(method: string, data: any) {
      return axios.post(`/${method}`, data)
    }
  }
}

export const $axios = getAxiosInstance()

