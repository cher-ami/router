import { useContext } from "react";
import { RouterContext, ROUTERS } from "../components/Router";
import { RouterInstance } from "..";

/**
 * Returns current router instance context
 * Instance depend of inside witch provider this function is called
 */
export const useRouter = () => useContext(RouterContext);

/**
 * Returns root router instance
 */
export const useRootRouter = (): RouterInstance => ROUTERS?.[0];
