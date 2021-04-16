import { ReactNode } from "react";
interface IProps {
    to: string;
    onClick?: () => void;
    className?: string;
    children: ReactNode;
}
/**
 * @name Link
 */
declare function Link(props: IProps): JSX.Element;
export { Link };
