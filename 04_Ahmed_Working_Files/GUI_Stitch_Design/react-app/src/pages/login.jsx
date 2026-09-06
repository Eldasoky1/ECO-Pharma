import { useNavigate, Link } from 'react-router-dom'
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react'
import LightPillar from '../components/react-bits/LightPillar'
import { SpecularButton } from '../components/specular-button'
import { useTheme } from '../components/theme-provider'

export default function Login() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const pillar = dark
    ? { topColor: '#6ff7df', bottomColor: '#003f36' }
    : { topColor: '#00796b', bottomColor: '#d8fff4' }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <LightPillar
        className="absolute inset-0"
        topColor={pillar.topColor}
        bottomColor={pillar.bottomColor}
        intensity={0.9}
        rotationSpeed={0.25}
        glowAmount={0.005}
        noiseIntensity={0.4}
        pillarWidth={3.0}
        pillarHeight={0.4}
        interactive
        quality="high"
      />

      <main className="relative z-10 flex-grow flex items-center justify-center w-full px-6 md:px-10 py-12">
        <div className="bg-surface-container-low dark:bg-surface-container/80 rounded-2xl p-8 w-full max-w-md shadow-[0_4px_8px_rgba(0,104,91,0.04)] border border-outline-variant backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 text-primary">
              <Leaf size={48} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold text-primary mb-2">
              Smart Eco-Pharma Hub
            </h1>
            <p className="text-sm text-on-surface-variant">
              Secure access to pharmacy operations
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1 ml-4" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  aria-hidden="true"
                />
                <input
                  className="w-full bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant text-on-surface text-base rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-1 ml-4" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  aria-hidden="true"
                />
                <input
                  className="w-full bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant text-on-surface text-base rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type="password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  className="h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary"
                  type="checkbox"
                />
                <span className="text-sm text-on-surface-variant">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-primary hover:text-primary-container transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            <SpecularButton size="lg" className="w-full justify-center" type="submit">
              Sign In
              <ArrowRight size={18} />
            </SpecularButton>

            <p className="mt-6 text-center text-sm text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-sm text-primary hover:text-primary-container transition-colors">
                Create Account
              </Link>
            </p>
          </form>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px bg-outline-variant flex-grow" />
            <span className="text-xs text-on-surface-variant">Secure Login</span>
            <div className="h-px bg-outline-variant flex-grow" />
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-4 text-center">
        <p className="text-xs text-on-surface-variant">
          Smart Eco-Pharma Hub v0.1.0 © 2024
        </p>
      </footer>
    </div>
  )
}
