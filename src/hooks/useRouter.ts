import { useContext } from "react";
import { IRouterContext, RouterContext } from "../components/Router";
import { CreateRouter } from "..";
import { ROUTERS } from "../api/routers";

/**
 * Returns current router instance context
 * Instance depend of inside witch provider this function is called
 */
export const useRouter = () => useContext<IRouterContext>(RouterContext);

/**
 * Returns root router instance
 */
export const useRootRouter = (): CreateRouter => ROUTERS.instances?.[0];
