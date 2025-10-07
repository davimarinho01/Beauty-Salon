import { Box, useColorModeValue } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const Layout = () => {
  const sidebarWidth = '280px'
  const bgColor = useColorModeValue('neutral.50', 'gray.900')

  return (
    <Box minH="100vh" bg={bgColor}>
      <Sidebar />
      <Header sidebarWidth={sidebarWidth} />
      
      <Box
        ml={sidebarWidth}
        pt="70px"
        minH="100vh"
        transition="all 0.3s ease"
      >
        <Box p={6}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
