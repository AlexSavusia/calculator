export function MainSidebarOverlay({ show, onClick }: { show: boolean; onClick: () => void }) {
    if (!show) return null;

    return (
        <div
            className="sidebar-overlay"
            onClick={onClick}
            onTouchStart={onClick}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1037,
            }}
            aria-hidden="true"
        />
    );
}