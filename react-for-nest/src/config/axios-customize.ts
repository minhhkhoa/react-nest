import { IBackendRes } from "@/types/backend";
import { Mutex } from "async-mutex";
import axiosClient from "axios";
import { store } from "@/redux/store";
import { setRefreshTokenAction } from "@/redux/slice/accountSlide";
interface AccessTokenResponse {
  access_token: string;
}

/**
 * Creates an initial 'axios' instance with custom settings.
 * Tu dong goi refresh_token khi access_token het han
 */

//- cau hinh axios
const instance = axiosClient.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  withCredentials: true,
});

//- mutex chi goi refresh_token 1 lan mac cho co nhiều request cùng lỗi 401
const mutex = new Mutex();

//- một header tùy biến để đánh dấu “đã retry rồi, đừng retry nữa”, chống vòng lặp vô hạn.
const NO_RETRY_HEADER = "x-no-retry";

// - tra ve access_token moi
const handleRefreshToken = async (): Promise<string | null> => {
  //- mutex.runExclusive: đặt critical section — các lời gọi khác phải chờ.
  return await mutex.runExclusive(async () => {
    const res = await instance.get<IBackendRes<AccessTokenResponse>>(
      "/api/v1/auth/refresh"
    );
    if (res && res.data) return res.data.access_token;
    else return null;
  });
};

//- Lợi ích: nếu 10 request cùng dính 401, chỉ 1 lần hit endpoint /refresh, các request khác đợi token mới rồi cùng chạy lại.

//- thiet lap interceptor de gui request
instance.interceptors.request.use(function (config) {
  if (
    typeof window !== "undefined" &&
    window &&
    window.localStorage &&
    window.localStorage.getItem("access_token")
  ) {
    //- neu co access_token thi them vao header Authorization bearer_token do
    config.headers.Authorization =
      "Bearer " + window.localStorage.getItem("access_token");
  }
  if (!config.headers.Accept && config.headers["Content-Type"]) {
    //- neu khong co header Accept thi them
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json; charset=utf-8";
  }
  return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
//- con day la response phan quan trong nhat
instance.interceptors.response.use(
  (res) => res.data, //- tra ve data tu BE neu khong co loi, ở đây .data rồi.
  async (error) => {
    if (
      //-  TH1: Access token hết hạn → gọi refresh token
      error.config &&
      error.response &&
      +error.response.status === 401 &&
      error.config.url !== "/api/v1/auth/login" &&
      !error.config.headers[NO_RETRY_HEADER]
    ) {
      /*
        * error.config && error.response
            Ý nghĩa: Đảm bảo đây là lỗi của một request Axios (có config) và có phản hồi từ server (có response).
            Nếu thiếu một trong 2 cái này, có thể lỗi xảy ra do vấn đề mạng (network error) hoặc config chưa kịp set. → Tránh xử lý nhầm.

        * error.response.status === 401 là mã lỗi mình bắn từ BE mặc định 401 là ko có accessToken hoặc hết hạn hoặc ko hợp lệ.

        * error.config.url !== "/api/v1/auth/login"
            Ý nghĩa: Nếu request gốc chính là gọi API login, mà bị 401 (vì lý do nào đó) THÌ KHÔNG ĐƯỢC REFRESH_TOKEN.
            Vì trong tình huống login sai mật khẩu hay lỗi nào đó (401), ta không thể lấy refresh token để sửa được. Refresh chỉ áp dụng khi user đã login trước đó và có refresh token hợp lệ.

        * !error.config.headers[NO_RETRY_HEADER]
            Ý nghĩa: Kiểm tra chưa retry lần nào.
            Khi đã gọi refresh và retry request 1 lần, code sẽ gắn header x-no-retry vào request.
            Điều kiện này giúp chặn vòng lặp vô hạn:
            Nếu refresh token cũng hết hạn/không hợp lệ → BE lại trả 401.
            Nếu không có cờ này, interceptor sẽ tiếp tục retry → loop vô tận.
       */
      const access_token = await handleRefreshToken();
      error.config.headers[NO_RETRY_HEADER] = "true";
      if (access_token) {
        error.config.headers["Authorization"] = `Bearer ${access_token}`;
        localStorage.setItem("access_token", access_token);
        return instance.request(error.config); //- goi lai request dang can goi nhung het access_token
      }
    }

    if (
      //- TH2: Refresh token thất bại → dispatch logout hoặc thông báo
      error.config &&
      error.response &&
      +error.response.status === 400 &&
      error.config.url === "/api/v1/auth/refresh" &&
      location.pathname.startsWith("/admin")
    ) {
      const message =
        error?.response?.data?.message ?? "Có lỗi xảy ra, vui lòng login.";
      //dispatch redux action
      store.dispatch(setRefreshTokenAction({ status: true, message }));
    }

    return error?.response?.data ?? Promise.reject(error);
  }
);

/**
 * Replaces main `axios` instance with the custom-one.
 *
 * @param cfg - Axios configuration object.
 * @returns A promise object of a response of the HTTP request with the 'data' object already
 * destructured.
 */
// const axios = <T>(cfg: AxiosRequestConfig) => instance.request<any, T>(cfg);

// export default axios;

export default instance;
