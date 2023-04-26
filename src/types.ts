import type {AxiosRequestConfig} from "axios";

/** Settings for the CKAN module */
export interface Settings{
	/** Request options to pass along to got. For more info, see the documentation: https://axios-http.com/docs/req_config */
	requestOptions?: AxiosRequestConfig;
	/** Ignore automatic API URL correction. Used for endpoints which don't follow the standard endpoint format. */
	skipEndpointCorrection?: boolean
};

/** Allowed HTTP request methods */
export type AllowedMethods = "GET" | "POST" | "PATCH" | "DELETE";

/** Generic CKAN response type */
export interface GenericResponse<T>{
	help: string;
	success: boolean;
	result?: T;
	error?:{
		__type: string;
		message: string;
	};
}