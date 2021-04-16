import { IRouteStack } from "..";
export declare type TManageTransitions = {
    previousPage: IRouteStack;
    currentPage: IRouteStack;
    unmountPreviousPage: () => void;
};
interface IProps {
    className?: string;
    manageTransitions?: (T: TManageTransitions) => Promise<void>;
}
/**
 * @name Stack
 */
declare function Stack(props: IProps): JSX.Element;
export { Stack };
