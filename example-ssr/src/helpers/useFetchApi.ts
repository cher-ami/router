import { useReducer, useEffect } from "react";
import debug from "@wbe/debug";
import { Routers } from "../../../src";
const log = debug(`front:useFetchApiHook`);

enum EFetchState {
  FETCH_INIT,
  FETCH_SUCCESS,
  FETCH_FAILURE,
}

export interface IFetchState<G = any> {
  response: G;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMessage?: any;
}

interface IAction {
  type: EFetchState;
  payload?: any;
  errorMessage?: any;
}

/**
 * Object used by useFetchApi hook to manage
 * ex:
 * {
 *    "pathname-endpoint": response,
 *    // ...
 * }
 */
const DATA_CACHE = {};

/**
 * use fetch API
 * Allow to fetch API, return data and state
 *
 * ex:
 *    const url = builApidUrl("home") // -> {VITE_BASE}/home
 *    const { response, isError, isLoading, isSuccess } = useFetchApi<MyPageInterface>("")
 *
 * @param url
 * @param activeCache
 */
export const useFetchApi = <GData>(
  url: string,
  activeCache = true
): IFetchState<GData> => {
  const dataFetchReducer = (state: IFetchState<GData>, action: IAction) => {
    switch (action.type) {
      case EFetchState.FETCH_INIT:
        return {
          ...state,
          isLoading: true,
          isError: false,
          isSuccess: false,
        };
      case EFetchState.FETCH_SUCCESS:
        return {
          ...state,
          isLoading: false,
          isError: false,
          isSuccess: true,
          response: action.payload,
        };
      case EFetchState.FETCH_FAILURE:
        return {
          ...state,
          isLoading: false,
          isError: true,
          isSuccess: false,
          errorMessage: action.errorMessage,
        };
      default:
        throw new Error();
    }
  };

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    errorMessage: null,
    response: null,
  });

  /**
   * Get data from cache
   */
  const getDataFromCache = (key = url): GData | null => {
    const dataAlreadyExist: boolean = Object.keys(DATA_CACHE).some((el) => el === key);
    if (!dataAlreadyExist) {
      log(`"${key}" data isn't in DATA_CACHE, we need to request the API. return.`);
      return null;
    }
    const data = DATA_CACHE[key];
    log("current page data is already in DATA_CACHE, we use it.", data);
    return data;
  };

  /**
   * Set Data in cache
   */
  const setDataInCache = (data: GData, key = url): void => {
    DATA_CACHE[key] = data;
    log("DATA_CACHE after set", DATA_CACHE);
  };

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: EFetchState.FETCH_INIT });

      // get data from cache
      const dataFromCache = getDataFromCache();
      if (dataFromCache && activeCache) {
        dispatch({ type: EFetchState.FETCH_SUCCESS, payload: dataFromCache });
      } else {
        // request API
        try {
          const result = await fetch(url).then((response) => {
            if (!response.ok) {
              throw new Error(`Unable to fetch "${url}", status: ${response.status}`);
            }
            return response.json();
          });
          log(`request result`, result);

          // set data in cache
          if (activeCache) setDataInCache(result);

          dispatch({ type: EFetchState.FETCH_SUCCESS, payload: result });
        } catch (error) {
          dispatch({ type: EFetchState.FETCH_FAILURE, errorMessage: error });
        }
      }
    };

    fetchData();
  }, [url, activeCache]);

  return state;
};

// -------------------------------------------------------------------------- HELPERS

/**
 * Build URL to request
 * @param endpoint Enpoint name to request
 * @param lang Language to request
 * @param apiUrl
 */
export const buildApiUrl = (
  endpoint: string,
  lang = Routers.langService?.currentLang?.key,
  apiUrl = import.meta.env.VITE_API_URL as string
): string => {
  let url = [apiUrl, "/", endpoint]
    .filter((e) => e)
    .join("")
    .replace(/(https?:\/\/)|(\/)+/g, "$1$2");

  let operator: string = "?";
  if (url.includes("?")) {
    operator = "&";
  }
  url += [operator, lang && `lang=${Routers.langService?.defaultLang.key}`]
    .filter((e) => e)
    .join("");

  // log("url", url)
  return url;
};
