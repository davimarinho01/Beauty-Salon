import { Box, useColorModeValue, useDisclosure, useBreakpointValue } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const Layout = () => {
  const { isOpen, onClose, onToggle } = useDisclosure()
  const sidebarWidth = useBreakpointValue({ base: '0px', md: '280px' })
  const bgColor = useColorModeValue('neutral.50', 'gray.900')
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Box minH="100vh" bg={bgColor}>
      <Sidebar isOpen={isOpen} onClose={onClose} isMobile={isMobile} />
      <Header 
        sidebarWidth={sidebarWidth || '0px'} 
        onMenuClick={onToggle}
        isMobile={isMobile}
      />
      
      <Box
        ml={{ base: 0, md: sidebarWidth }}
        pt="70px"
        minH="100vh"
        transition="all 0.3s ease"
      >
        <Box p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
