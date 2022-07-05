import { useReducer, useEffect } from "react";
import debug from "@wbe/debug";
import { Routers, useRouter } from "../../../src";
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
 * @param activeCache
 */
export const useGetStaticProps = <GData>(activeCache = true): IFetchState<GData> => {
  const { currentRoute } = useRouter();

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
  const getDataFromCache = (key = currentRoute?.fullUrl): GData | null => {
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
  const setDataInCache = (data: GData, key = currentRoute?.fullUrl): void => {
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

        if (currentRoute?.getStaticProps) {
          try {
            let result;
            if (window["__SSR_STATIC_PROPS__"]) {
              log('window["__SSR_STATIC_PROPS__"] exist, use it', window["__SSR_STATIC_PROPS__"])
              result = window["__SSR_STATIC_PROPS__"];
            } else {
              log('window["__SSR_STATIC_PROPS__"] NOT exist, request getStaticProps')
              await currentRoute.getStaticProps();
            }
            log(`request result`, result);
            if (activeCache) setDataInCache(result);
            dispatch({ type: EFetchState.FETCH_SUCCESS, payload: result });
          } catch (error) {
            dispatch({ type: EFetchState.FETCH_FAILURE, errorMessage: error });
          }
        }
      }
    };

    fetchData();
  }, [activeCache]);

  return state;
};
