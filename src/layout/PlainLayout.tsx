import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";
import { Outlet } from "react-router";

export default function PlainLayout() {
    return (
        <>
            <MainHeader hideSidebarToggle />

            <div className="content-wrapper" style={{ marginLeft: 0 }}>
                <div
                    style={{
                        maxWidth: 1100,
                        margin: "0 auto",
                        padding: "24px 16px",
                    }}
                >
                    <Outlet />
                </div>
            </div>

            <MainFooter />
        </>
    );
}
