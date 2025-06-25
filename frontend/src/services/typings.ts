namespace Api {
  export interface ApiResponseMeet<T> {
    message: string;
    token: string;
    userInfo: T;
  }
  export interface ApiResponse<T> {
    message: string;
    data: T;
  }
  export interface ApiResponsePageing<T> {
    message: string;
    result: ApiResultList<T>;
  }
  export interface ApiResultList<T> {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    data: T;
  }
  export interface Request {
    pageSize?: number;
    pageIndex?: number;
    sortedField?: number;
    isDescending?: boolean;
  }
}
namespace ErrorBackend {
  export interface ErrorResponse {
    message: string;
    code: number;
    details?: string[];
  }
  export interface ErrorResponseWithData {
    isError: boolean;
    responseException: {
      errors: [];
      status: number;
      message: string;
      traceId: string;
      title: string;
      type: string;
    };
  }

  export interface ErrorResponseWithMessage {
    isError: boolean;
    responseException: {
      errors: [];
      status: number;
      message: string;
      traceId: string;
      title: string;
      type: string;
    };
  }

  export interface ErrorBackend {
    isError: boolean;
    responseException: ResponseException;
  }

  interface ResponseException {
    exceptionMessage: string;
  }
}
