import { IoMenuOutline } from "react-icons/io5";

export type MainHeaderProps = {
    onSidebarToggle?: () => void;
    hideSidebarToggle?: boolean;
};

export default function MainHeader({
                                       onSidebarToggle,
                                       hideSidebarToggle,
                                   }: MainHeaderProps) {
    return (
        <nav className="main-header navbar navbar-expand navbar-white navbar-light">
            <ul className="navbar-nav">
                {!hideSidebarToggle && (
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            onClick={onSidebarToggle}
                            data-widget="pushmenu"
                            role="button"
                        >
                            <IoMenuOutline className="nav-icon" />
                        </a>
                    </li>
                )}

                <li className="nav-item d-none d-sm-inline-block">
                    <a href="/" className="nav-link">
                        Home
                    </a>
                </li>
            </ul>

        </nav>
    );
}
