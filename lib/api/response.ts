export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiSuccess<T>(
  data: T,
  message = "Berhasil.",
  status = 200,
): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  return Response.json(body, { status });
}

export function apiError(error: string, status: number): Response {
  const body: ApiErrorResponse = {
    success: false,
    error,
  };

  return Response.json(body, { status });
}

export function apiValidationError(message: string): Response {
  return apiError(message, 400);
}
