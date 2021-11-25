import { useContext } from "react";
import {
  IRouterContext,
  IRouterContextStackStates,
  RouterContext,
} from "../components/Router";
import { CreateRouter } from "..";
import { ROUTERS } from "../api/routers";

/**
 * Returns current router instance context
 * Instance depend of inside witch provider this function is called
 */
export const useRouter = () =>
  useContext<Omit<IRouterContext, keyof IRouterContextStackStates>>(RouterContext);


