import { useContext } from "react";
import { RouterContext, rootRouter } from "../components/Router";
import { RouterInstance } from "..";

/**
 * Returns current router instance context
 * Instance depend of inside witch provider this function is called
 */
export const useRouter = () => useContext(RouterContext);

/**
 * Returns root router instance
 */
export const useRootRouter = (): RouterInstance => rootRouter.root;
