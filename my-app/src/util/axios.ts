import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface MyRequest<U> extends AxiosRequestConfig {
    data?: U; // post传参
    params?: U; // get传参
  }
// 创建RESTful API封装类
class RestClient {
  private readonly axiosInstance: AxiosInstance;

  // 发起GET请求
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get(url, config);
  }

  // 发起POST请求
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post(url, data, config);
  }

  // 发起PUT请求
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put(url, data, config);
  }

  // 发起DELETE请求
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete(url, config);
  }
}

// 创建RESTful API实例
const request = new RestClient();

export default request;
