import NavBar from './NavBar'
import Sidebar from './Sidebar'

export default function AppShell({ children, rightSidebar = false }) {
  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#2E3B42] dark:bg-[#2E3B42] dark:text-[#F5F7F8]">
      <div className="mx-auto flex max-w-[1440px] gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <NavBar />
          {children}
        </div>
        {rightSidebar && <Sidebar side="right" />}
      </div>
    </div>
  )
}
