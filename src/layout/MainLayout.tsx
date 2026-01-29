import MainHeader from "./MainHeader.tsx";
import MainFooter from "./MainFooter.tsx";
import MainSidebar from "./MainSidebar.tsx";
import {Outlet} from "react-router";
import {useSidebar} from "../components/hooks/useSidebar.ts";
import {MainSidebarOverlay} from "./MainSidebarOverlay.tsx";

export default function MainLayout() {
    const {isMobile, collapsed, setCollapsed, toggle} = useSidebar()
    console.log(collapsed, isMobile, collapsed && isMobile)
    return (
        <>
            <div className="preloader flex-column justify-content-center align-items-center " style={{height:'0px'}}>
                <img className="animation__shake" src="logo.webp" alt="AdminLTELogo" height="60" width="60"
                     style={{display: 'none'}}/>
            </div>
            <MainHeader onSidebarToggle={toggle}/>
            <MainSidebar/>
            <MainSidebarOverlay show={collapsed && isMobile} onClick={() => setCollapsed(false)}/>
            <div className="content-wrapper">
                <Outlet/>
            </div>
            <MainFooter/></>

    )
}