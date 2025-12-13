import React from 'react'
import AppHeader from '@/components/organisms/appHeader'
import Footer from '@/components/organisms/footer'
import CompareFloatingBar from '@/components/organisms/compareFloatingBar'

type MainLayoutProps = {
  children: React.ReactNode
  activeItem?: string
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeItem }) => {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <AppHeader activeItem={activeItem} />
      <div className='flex-1'>{children}</div>
      <Footer />
      <CompareFloatingBar />
    </div>
  )
}

export default MainLayout
