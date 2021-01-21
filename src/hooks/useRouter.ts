import { useContext } from "react";
import { RouterContext } from "../components/Router";
import { RouterInstance } from "..";
import { ROUTERS } from "../api/routers";

/**
 * Returns current router instance context
 * Instance depend of inside witch provider this function is called
 */
export const useRouter = () => useContext(RouterContext);

/**
 * Returns root router instance
 */
export const useRootRouter = (): RouterInstance => ROUTERS.instances?.[0];
