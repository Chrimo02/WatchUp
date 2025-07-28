import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import { auth } from '../utils/api'
import { useToast } from '../hooks/use-toast'

// 1) Create the context
const AuthContext = createContext({
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  sessionId: null,
  login: async () => {},
  logout: async () => {},
})

// 2) Export the hook for consumption
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const { toast } = useToast()

  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  // 3) Single initEffect with toast for errors
  useEffect(() => {
    const initAuth = async () => {
      try {
        const urlParams     = new URLSearchParams(window.location.search)
        const requestToken = urlParams.get('request_token')
        const approved     = urlParams.get('approved')
        const storedSid    = localStorage.getItem('tmdb_session_id')

        if (requestToken && approved === 'true') {
          await handleAuthCallback(requestToken)
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          )
        } else if (storedSid) {
          const { data: accountData } = await auth.getAccount(storedSid)
          setUser(accountData)
          setSessionId(storedSid)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth init failed:', error)
        toast({
          title: 'Authentication failed',
          description: error.message,
          variant: 'destructive',
        })
      } finally {
        setIsInitialized(true)
      }
    }

    initAuth()
  }, [])

  // 4) login() remains largely the same, but with toast on failure
  const login = async () => {
    try {
      const { data: tokenData } = await auth.createRequestToken()
      const requestToken        = tokenData.request_token
      if (!requestToken) throw new Error('No request token returned')

      const redirectUrl = window.location.origin + window.location.pathname
      const authUrl     = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${encodeURIComponent(
        redirectUrl
      )}`

      localStorage.setItem('tmdb_request_token', requestToken)
      window.location.href = authUrl
    } catch (error) {
      console.error('Login failed:', error)
      toast({
        title: 'Login failed',
        description:
          'Could not start authentication. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // 5) handleAuthCallback() no longer alerts, just toasts on success
  const handleAuthCallback = async (requestToken) => {
    const { data: sessionData } = await auth.createSession(requestToken)
    const newSessionId           = sessionData.session_id
    if (!newSessionId) {
      throw new Error('Failed to create TMDB session')
    }

    localStorage.setItem('tmdb_session_id', newSessionId)
    localStorage.removeItem('tmdb_request_token')

    const { data: accountData } = await auth.getAccount(newSessionId)
    setSessionId(newSessionId)
    setUser(accountData)
    setIsAuthenticated(true)

    toast({
      title: `Welcome, ${accountData.username}!`,
      description: 'You are now signed in.',
    })

    return true
  }

  // 6) logout() swaps alert for toast
  const logout = async () => {
    try {
      if (sessionId) {
        await auth.deleteSession(sessionId)
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
      // (you could toast here if you like)
    } finally {
      localStorage.removeItem('tmdb_session_id')
      localStorage.removeItem('tmdb_request_token')
      setIsAuthenticated(false)
      setUser(null)
      setSessionId(null)

      toast({
        title: 'Signed out',
        description: 'You have successfully signed out.',
      })
    }
  }

  // 7) Provide everything
  const value = {
    isInitialized,
    isAuthenticated,
    user,
    sessionId,
    login,
    logout,
    handleAuthCallback,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
